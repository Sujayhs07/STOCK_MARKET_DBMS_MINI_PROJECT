const db = require('../config/db');

// GET /api/portfolio/:userId
const getPortfolio = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    if (parseInt(userId) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [portfolio] = await db.query(
      `SELECT p.*, s.symbol, s.company_name, s.current_price, s.sector,
              s.previous_close,
              (s.current_price - p.avg_buy_price) * p.quantity AS profit_loss,
              ((s.current_price - p.avg_buy_price) / p.avg_buy_price * 100) AS profit_loss_percent,
              s.current_price * p.quantity AS current_value
       FROM portfolios p
       JOIN stocks s ON p.stock_id = s.id
       WHERE p.user_id = ? AND p.quantity > 0
       ORDER BY current_value DESC`,
      [userId]
    );

    const [user] = await db.query('SELECT balance FROM users WHERE id = ?', [userId]);

    const totalInvested = portfolio.reduce((sum, p) => sum + parseFloat(p.total_invested), 0);
    const currentValue = portfolio.reduce((sum, p) => sum + parseFloat(p.current_value), 0);
    const totalProfitLoss = currentValue - totalInvested;
    const profitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    res.json({
      success: true,
      data: {
        holdings: portfolio,
        summary: {
          totalInvested: parseFloat(totalInvested.toFixed(2)),
          currentValue: parseFloat(currentValue.toFixed(2)),
          totalProfitLoss: parseFloat(totalProfitLoss.toFixed(2)),
          profitLossPercent: parseFloat(profitLossPercent.toFixed(2)),
          totalStocks: portfolio.length,
          availableBalance: user[0]?.balance || 0,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPortfolio };
