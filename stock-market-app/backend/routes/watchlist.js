const express = require('express');
const router = express.Router();
const { getWatchlist, addToWatchlist, removeFromWatchlist } = require('../controllers/watchlistController');
const { authMiddleware } = require('../middleware/auth');

router.get('/:userId', authMiddleware, getWatchlist);
router.post('/', authMiddleware, addToWatchlist);
router.delete('/:id', authMiddleware, removeFromWatchlist);

module.exports = router;
