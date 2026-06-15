const db = require('../config/db');

// GET /api/stocks
const getAllStocks = async (req, res, next) => {
  try {
    const { search, sector, sort } = req.query;
    let query = 'SELECT * FROM stocks WHERE is_active = TRUE';
    const params = [];

    if (search) {
      query += ' AND (symbol LIKE ? OR company_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (sector && sector !== 'All') {
      query += ' AND sector = ?';
      params.push(sector);
    }

    if (sort === 'price_asc') query += ' ORDER BY current_price ASC';
    else if (sort === 'price_desc') query += ' ORDER BY current_price DESC';
    else if (sort === 'change_asc') query += ' ORDER BY (current_price - previous_close) ASC';
    else if (sort === 'change_desc') query += ' ORDER BY (current_price - previous_close) DESC';
    else query += ' ORDER BY market_cap DESC';

    const [stocks] = await db.query(query, params);

    const stocksWithChange = stocks.map((s) => ({
      ...s,
      change: parseFloat((s.current_price - s.previous_close).toFixed(2)),
      change_percent: parseFloat(
        (((s.current_price - s.previous_close) / s.previous_close) * 100).toFixed(2)
      ),
    }));

    res.json({ success: true, data: stocksWithChange });
  } catch (err) {
    next(err);
  }
};

// GET /api/stocks/:id
const getStockById = async (req, res, next) => {
  try {
    const [stocks] = await db.query('SELECT * FROM stocks WHERE id = ?', [req.params.id]);
    if (stocks.length === 0) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }
    const s = stocks[0];
    res.json({
      success: true,
      data: {
        ...s,
        change: parseFloat((s.current_price - s.previous_close).toFixed(2)),
        change_percent: parseFloat(
          (((s.current_price - s.previous_close) / s.previous_close) * 100).toFixed(2)
        ),
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/stocks (admin)
const createStock = async (req, res, next) => {
  try {
    const {
      symbol, company_name, current_price, previous_close,
      market_cap, sector, volume, day_high, day_low,
      pe_ratio, dividend_yield, description,
    } = req.body;

    if (!symbol || !company_name || !current_price || !previous_close) {
      return res.status(400).json({ success: false, message: 'Symbol, company name, current price, and previous close are required' });
    }

    const [result] = await db.query(
      `INSERT INTO stocks (symbol, company_name, current_price, previous_close, market_cap, sector, volume, day_high, day_low, pe_ratio, dividend_yield, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [symbol.toUpperCase(), company_name, current_price, previous_close, market_cap, sector, volume, day_high, day_low, pe_ratio, dividend_yield, description]
    );

    const [newStock] = await db.query('SELECT * FROM stocks WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Stock created successfully', data: newStock[0] });
  } catch (err) {
    next(err);
  }
};

// PUT /api/stocks/:id (admin)
const updateStock = async (req, res, next) => {
  try {
    const {
      symbol, company_name, current_price, previous_close,
      market_cap, sector, volume, day_high, day_low,
      pe_ratio, dividend_yield, description, is_active,
    } = req.body;

    const [existing] = await db.query('SELECT id FROM stocks WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }

    await db.query(
      `UPDATE stocks SET symbol=?, company_name=?, current_price=?, previous_close=?,
       market_cap=?, sector=?, volume=?, day_high=?, day_low=?, pe_ratio=?, dividend_yield=?,
       description=?, is_active=? WHERE id=?`,
      [symbol, company_name, current_price, previous_close, market_cap, sector, volume,
       day_high, day_low, pe_ratio, dividend_yield, description, is_active ?? true, req.params.id]
    );

    const [updated] = await db.query('SELECT * FROM stocks WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Stock updated successfully', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/stocks/:id (admin)
const deleteStock = async (req, res, next) => {
  try {
    const [existing] = await db.query('SELECT id FROM stocks WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }
    await db.query('UPDATE stocks SET is_active = FALSE WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Stock deactivated successfully' });
  } catch (err) {
    next(err);
  }
};

// GET /api/stocks/sectors
const getSectors = async (req, res, next) => {
  try {
    const [sectors] = await db.query('SELECT DISTINCT sector FROM stocks WHERE is_active = TRUE AND sector IS NOT NULL ORDER BY sector');
    res.json({ success: true, data: sectors.map((s) => s.sector) });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllStocks, getStockById, createStock, updateStock, deleteStock, getSectors };
