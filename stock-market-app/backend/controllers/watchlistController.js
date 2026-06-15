const db = require('../config/db');

// GET /api/watchlist/:userId
const getWatchlist = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    if (parseInt(userId) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [watchlist] = await db.query(
      `SELECT w.id as watchlist_id, w.created_at as added_at, s.*,
              (s.current_price - s.previous_close) as change_val,
              ((s.current_price - s.previous_close) / s.previous_close * 100) as change_percent
       FROM watchlist w
       JOIN stocks s ON w.stock_id = s.id
       WHERE w.user_id = ? AND s.is_active = TRUE
       ORDER BY w.created_at DESC`,
      [userId]
    );

    res.json({ success: true, data: watchlist });
  } catch (err) {
    next(err);
  }
};

// POST /api/watchlist
const addToWatchlist = async (req, res, next) => {
  try {
    const { stock_id } = req.body;
    const user_id = req.user.id;

    if (!stock_id) {
      return res.status(400).json({ success: false, message: 'stock_id is required' });
    }

    const [existing] = await db.query(
      'SELECT id FROM watchlist WHERE user_id = ? AND stock_id = ?',
      [user_id, stock_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Stock already in watchlist' });
    }

    await db.query('INSERT INTO watchlist (user_id, stock_id) VALUES (?, ?)', [user_id, stock_id]);

    res.status(201).json({ success: true, message: 'Added to watchlist' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/watchlist/:id
const removeFromWatchlist = async (req, res, next) => {
  try {
    const [existing] = await db.query(
      'SELECT id FROM watchlist WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Watchlist item not found' });
    }

    await db.query('DELETE FROM watchlist WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Removed from watchlist' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };
