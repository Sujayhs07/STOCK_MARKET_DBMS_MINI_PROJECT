const express = require('express');
const router = express.Router();
const { buyStock, sellStock, getTransactions, getAllTransactions } = require('../controllers/transactionController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.post('/buy', authMiddleware, buyStock);
router.post('/sell', authMiddleware, sellStock);
router.get('/all', authMiddleware, adminMiddleware, getAllTransactions);
router.get('/:userId', authMiddleware, getTransactions);

module.exports = router;
