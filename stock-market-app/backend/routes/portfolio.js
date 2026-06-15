// routes/portfolio.js
const express = require('express');
const portfolioRouter = express.Router();
const { getPortfolio } = require('../controllers/portfolioController');
const { authMiddleware } = require('../middleware/auth');
portfolioRouter.get('/:userId', authMiddleware, getPortfolio);
module.exports = portfolioRouter;
