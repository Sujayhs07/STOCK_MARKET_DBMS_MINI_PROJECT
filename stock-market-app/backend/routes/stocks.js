const express = require('express');
const router = express.Router();
const { getAllStocks, getStockById, createStock, updateStock, deleteStock, getSectors } = require('../controllers/stockController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/sectors', authMiddleware, getSectors);
router.get('/', authMiddleware, getAllStocks);
router.get('/:id', authMiddleware, getStockById);
router.post('/', authMiddleware, adminMiddleware, createStock);
router.put('/:id', authMiddleware, adminMiddleware, updateStock);
router.delete('/:id', authMiddleware, adminMiddleware, deleteStock);

module.exports = router;
