const db = require('../config/db');

// GET /api/admin/users
const getAllUsers = async (req, res, next) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, phone, balance, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const [[userCount]] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "user"');
    const [[stockCount]] = await db.query('SELECT COUNT(*) as count FROM stocks WHERE is_active = TRUE');
    const [[txCount]] = await db.query('SELECT COUNT(*) as count, SUM(total_amount) as volume FROM transactions');
    const [[portfolioValue]] = await db.query(
      `SELECT SUM(p.quantity * s.current_price) as total_value
       FROM portfolios p JOIN stocks s ON p.stock_id = s.id`
    );

    const [topStocks] = await db.query(
      `SELECT s.symbol, s.company_name, s.current_price,
              (s.current_price - s.previous_close) / s.previous_close * 100 as change_pct,
              COUNT(t.id) as trade_count
       FROM stocks s
       LEFT JOIN transactions t ON s.id = t.stock_id
       WHERE s.is_active = TRUE
       GROUP BY s.id
       ORDER BY trade_count DESC
       LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        totalUsers: userCount.count,
        totalStocks: stockCount.count,
        totalTransactions: txCount.count,
        totalVolume: parseFloat(txCount.volume || 0).toFixed(2),
        totalPortfolioValue: parseFloat(portfolioValue.total_value || 0).toFixed(2),
        topStocks,
      },
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res, next) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }
    const [result] = await db.query('DELETE FROM users WHERE id = ? AND role != "admin"', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getDashboardStats, deleteUser };
