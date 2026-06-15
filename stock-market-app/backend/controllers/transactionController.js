const db = require('../config/db');

// POST /api/transactions/buy
const buyStock = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const { stock_id, quantity } = req.body;
    const user_id = req.user.id;

    if (!stock_id || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Valid stock_id and quantity required' });
    }

    await conn.beginTransaction();

    const [[stock]] = await conn.query('SELECT * FROM stocks WHERE id = ? AND is_active = TRUE', [stock_id]);
    if (!stock) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Stock not found or inactive' });
    }

    const [[user]] = await conn.query('SELECT balance FROM users WHERE id = ?', [user_id]);
    const totalCost = stock.current_price * quantity;

    if (user.balance < totalCost) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Required: ₹${totalCost.toFixed(2)}, Available: ₹${user.balance}`,
      });
    }

    // Deduct balance
    await conn.query('UPDATE users SET balance = balance - ? WHERE id = ?', [totalCost, user_id]);

    // Update or insert portfolio
    const [[existing]] = await conn.query(
      'SELECT * FROM portfolios WHERE user_id = ? AND stock_id = ?',
      [user_id, stock_id]
    );

    if (existing) {
      const newQty = existing.quantity + parseInt(quantity);
      const newTotalInvested = parseFloat(existing.total_invested) + totalCost;
      const newAvgPrice = newTotalInvested / newQty;
      await conn.query(
        'UPDATE portfolios SET quantity = ?, avg_buy_price = ?, total_invested = ? WHERE id = ?',
        [newQty, newAvgPrice, newTotalInvested, existing.id]
      );
    } else {
      await conn.query(
        'INSERT INTO portfolios (user_id, stock_id, quantity, avg_buy_price, total_invested) VALUES (?, ?, ?, ?, ?)',
        [user_id, stock_id, quantity, stock.current_price, totalCost]
      );
    }

    // Record transaction
    const [txResult] = await conn.query(
      'INSERT INTO transactions (user_id, stock_id, type, quantity, price_per_share, total_amount) VALUES (?, ?, "buy", ?, ?, ?)',
      [user_id, stock_id, quantity, stock.current_price, totalCost]
    );

    await conn.commit();

    const [[updatedUser]] = await db.query('SELECT balance FROM users WHERE id = ?', [user_id]);

    res.status(201).json({
      success: true,
      message: `Successfully purchased ${quantity} shares of ${stock.symbol}`,
      data: {
        transaction_id: txResult.insertId,
        stock: stock.symbol,
        quantity,
        price: stock.current_price,
        total: totalCost,
        new_balance: updatedUser.balance,
      },
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

// POST /api/transactions/sell
const sellStock = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const { stock_id, quantity } = req.body;
    const user_id = req.user.id;

    if (!stock_id || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Valid stock_id and quantity required' });
    }

    await conn.beginTransaction();

    const [[stock]] = await conn.query('SELECT * FROM stocks WHERE id = ? AND is_active = TRUE', [stock_id]);
    if (!stock) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }

    const [[portfolio]] = await conn.query(
      'SELECT * FROM portfolios WHERE user_id = ? AND stock_id = ?',
      [user_id, stock_id]
    );

    if (!portfolio || portfolio.quantity < quantity) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: `Insufficient shares. You own ${portfolio?.quantity || 0} shares`,
      });
    }

    const saleAmount = stock.current_price * quantity;
    const newQty = portfolio.quantity - parseInt(quantity);
    const soldInvestedCost = portfolio.avg_buy_price * quantity;
    const newTotalInvested = parseFloat(portfolio.total_invested) - soldInvestedCost;

    // Update portfolio
    if (newQty === 0) {
      await conn.query('DELETE FROM portfolios WHERE id = ?', [portfolio.id]);
    } else {
      await conn.query(
        'UPDATE portfolios SET quantity = ?, total_invested = ? WHERE id = ?',
        [newQty, Math.max(0, newTotalInvested), portfolio.id]
      );
    }

    // Credit balance
    await conn.query('UPDATE users SET balance = balance + ? WHERE id = ?', [saleAmount, user_id]);

    // Record transaction
    const [txResult] = await conn.query(
      'INSERT INTO transactions (user_id, stock_id, type, quantity, price_per_share, total_amount) VALUES (?, ?, "sell", ?, ?, ?)',
      [user_id, stock_id, quantity, stock.current_price, saleAmount]
    );

    await conn.commit();

    const [[updatedUser]] = await db.query('SELECT balance FROM users WHERE id = ?', [user_id]);

    res.json({
      success: true,
      message: `Successfully sold ${quantity} shares of ${stock.symbol}`,
      data: {
        transaction_id: txResult.insertId,
        stock: stock.symbol,
        quantity,
        price: stock.current_price,
        total: saleAmount,
        profit_loss: saleAmount - soldInvestedCost,
        new_balance: updatedUser.balance,
      },
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

// GET /api/transactions/:userId
const getTransactions = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    if (parseInt(userId) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [transactions] = await db.query(
      `SELECT t.*, s.symbol, s.company_name
       FROM transactions t
       JOIN stocks s ON t.stock_id = s.id
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC
       LIMIT 100`,
      [userId]
    );

    res.json({ success: true, data: transactions });
  } catch (err) {
    next(err);
  }
};

// GET /api/transactions/all (admin)
const getAllTransactions = async (req, res, next) => {
  try {
    const [transactions] = await db.query(
      `SELECT t.*, s.symbol, s.company_name, u.name as user_name, u.email as user_email
       FROM transactions t
       JOIN stocks s ON t.stock_id = s.id
       JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC
       LIMIT 500`
    );
    res.json({ success: true, data: transactions });
  } catch (err) {
    next(err);
  }
};

module.exports = { buyStock, sellStock, getTransactions, getAllTransactions };
