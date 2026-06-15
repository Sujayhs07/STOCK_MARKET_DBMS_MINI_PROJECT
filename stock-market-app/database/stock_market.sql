-- ============================================================
-- Share and Stock Market Investment Management System
-- Database Schema + Seed Data
-- ============================================================

CREATE DATABASE IF NOT EXISTS stock_market;
USE stock_market;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  balance DECIMAL(15,2) DEFAULT 100000.00,
  role ENUM('user','admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: stocks
-- ============================================================
CREATE TABLE IF NOT EXISTS stocks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL UNIQUE,
  company_name VARCHAR(150) NOT NULL,
  current_price DECIMAL(12,2) NOT NULL,
  previous_close DECIMAL(12,2) NOT NULL,
  market_cap DECIMAL(20,2),
  sector VARCHAR(80),
  volume BIGINT DEFAULT 0,
  day_high DECIMAL(12,2),
  day_low DECIMAL(12,2),
  pe_ratio DECIMAL(8,2),
  dividend_yield DECIMAL(5,2) DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: portfolios
-- ============================================================
CREATE TABLE IF NOT EXISTS portfolios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  stock_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  avg_buy_price DECIMAL(12,2) NOT NULL,
  total_invested DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_stock (user_id, stock_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  stock_id INT NOT NULL,
  type ENUM('buy','sell') NOT NULL,
  quantity INT NOT NULL,
  price_per_share DECIMAL(12,2) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  status ENUM('completed','pending','failed') DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: watchlist
-- ============================================================
CREATE TABLE IF NOT EXISTS watchlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  stock_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_watchlist (user_id, stock_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE
);

-- ============================================================
-- SEED DATA: users (password = "password123" hashed)
-- ============================================================
INSERT INTO users (name, email, password, phone, balance, role) VALUES
('Admin User', 'admin@stockmarket.com', '$2b$10$rQZ3k8Kl/GvB5yY5m5H0c.9VjX5Xv7Gg9Kl3Xv7Gg9Kl3Xv7Gg9K', '9999999999', 999999.00, 'admin'),
('John Doe', 'john@example.com', '$2b$10$rQZ3k8Kl/GvB5yY5m5H0c.9VjX5Xv7Gg9Kl3Xv7Gg9Kl3Xv7Gg9K', '9876543210', 85000.00, 'user'),
('Jane Smith', 'jane@example.com', '$2b$10$rQZ3k8Kl/GvB5yY5m5H0c.9VjX5Xv7Gg9Kl3Xv7Gg9Kl3Xv7Gg9K', '9123456780', 120000.00, 'user'),
('Rahul Sharma', 'rahul@example.com', '$2b$10$rQZ3k8Kl/GvB5yY5m5H0c.9VjX5Xv7Gg9Kl3Xv7Gg9Kl3Xv7Gg9K', '9812345670', 65000.00, 'user');

-- ============================================================
-- SEED DATA: stocks
-- ============================================================
INSERT INTO stocks (symbol, company_name, current_price, previous_close, market_cap, sector, volume, day_high, day_low, pe_ratio, dividend_yield, description) VALUES
('AAPL', 'Apple Inc.', 189.45, 187.20, 2950000000000.00, 'Technology', 58234500, 191.20, 186.80, 29.5, 0.55, 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.'),
('GOOGL', 'Alphabet Inc.', 141.80, 139.50, 1780000000000.00, 'Technology', 23456700, 143.20, 140.10, 25.8, 0.00, 'Alphabet Inc. provides various products and platforms in the United States, Europe, Middle East, Africa, Asia-Pacific, and other regions.'),
('MSFT', 'Microsoft Corporation', 378.90, 375.20, 2810000000000.00, 'Technology', 18923400, 381.50, 376.00, 35.2, 0.72, 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.'),
('AMZN', 'Amazon.com Inc.', 178.25, 175.80, 1860000000000.00, 'Consumer Discretionary', 34567800, 180.00, 175.50, 62.1, 0.00, 'Amazon.com Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally.'),
('TSLA', 'Tesla Inc.', 242.10, 238.90, 769000000000.00, 'Automotive', 89234500, 248.30, 237.20, 72.3, 0.00, 'Tesla Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.'),
('META', 'Meta Platforms Inc.', 484.30, 479.20, 1240000000000.00, 'Technology', 14523600, 488.50, 477.90, 26.4, 0.40, 'Meta Platforms Inc. develops products that enable people to connect and share with friends and family.'),
('NVDA', 'NVIDIA Corporation', 875.40, 862.30, 2160000000000.00, 'Technology', 45678900, 889.20, 858.70, 65.8, 0.03, 'NVIDIA Corporation provides graphics, and compute and networking solutions worldwide.'),
('JPM', 'JPMorgan Chase & Co.', 198.75, 196.40, 573000000000.00, 'Financial Services', 9876500, 201.20, 195.80, 11.5, 2.20, 'JPMorgan Chase & Co. operates as a financial services company worldwide.'),
('JNJ', 'Johnson & Johnson', 158.20, 156.80, 381000000000.00, 'Healthcare', 7234500, 160.50, 156.20, 14.2, 3.10, 'Johnson & Johnson researches and develops, manufactures, and sells various products in the healthcare field worldwide.'),
('V', 'Visa Inc.', 275.60, 272.30, 562000000000.00, 'Financial Services', 6789000, 278.90, 271.80, 31.5, 0.78, 'Visa Inc. operates as a payments technology company worldwide.'),
('WMT', 'Walmart Inc.', 167.80, 165.50, 453000000000.00, 'Consumer Staples', 8923400, 169.20, 164.80, 28.9, 1.30, 'Walmart Inc. engages in the operation of retail, wholesale, and other units worldwide.'),
('NFLX', 'Netflix Inc.', 628.45, 619.30, 272000000000.00, 'Communication Services', 4567800, 634.20, 616.90, 44.7, 0.00, 'Netflix Inc. provides entertainment services. It offers TV series, documentaries, feature films, and games across various genres and languages.'),
('RELIANCE', 'Reliance Industries Ltd', 2847.50, 2810.30, 1920000000000.00, 'Energy', 12345600, 2890.00, 2800.00, 22.4, 0.35, 'Reliance Industries Limited operates as an integrated energy, petrochemicals, textile, natural resources, retail, and telecommunications company.'),
('TCS', 'Tata Consultancy Services', 3756.80, 3720.50, 1360000000000.00, 'Technology', 8765400, 3798.00, 3710.00, 28.6, 1.50, 'Tata Consultancy Services Limited operates as an information technology company worldwide.'),
('INFY', 'Infosys Limited', 1456.30, 1438.70, 606000000000.00, 'Technology', 9234500, 1478.00, 1432.00, 23.1, 2.80, 'Infosys Limited provides consulting, technology, outsourcing, and next-generation digital services worldwide.');

-- ============================================================
-- SEED DATA: portfolios
-- ============================================================
INSERT INTO portfolios (user_id, stock_id, quantity, avg_buy_price, total_invested) VALUES
(2, 1, 10, 175.50, 1755.00),
(2, 3, 5, 360.00, 1800.00),
(2, 5, 8, 220.00, 1760.00),
(2, 7, 3, 820.00, 2460.00),
(3, 2, 15, 130.00, 1950.00),
(3, 4, 7, 165.00, 1155.00),
(3, 6, 12, 460.00, 5520.00),
(3, 8, 20, 185.00, 3700.00),
(4, 13, 5, 2600.00, 13000.00),
(4, 14, 3, 3500.00, 10500.00),
(4, 15, 10, 1380.00, 13800.00);

-- ============================================================
-- SEED DATA: transactions
-- ============================================================
INSERT INTO transactions (user_id, stock_id, type, quantity, price_per_share, total_amount, created_at) VALUES
(2, 1, 'buy', 10, 175.50, 1755.00, DATE_SUB(NOW(), INTERVAL 30 DAY)),
(2, 3, 'buy', 5, 360.00, 1800.00, DATE_SUB(NOW(), INTERVAL 25 DAY)),
(2, 5, 'buy', 10, 220.00, 2200.00, DATE_SUB(NOW(), INTERVAL 20 DAY)),
(2, 5, 'sell', 2, 235.00, 470.00, DATE_SUB(NOW(), INTERVAL 15 DAY)),
(2, 7, 'buy', 3, 820.00, 2460.00, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(3, 2, 'buy', 15, 130.00, 1950.00, DATE_SUB(NOW(), INTERVAL 28 DAY)),
(3, 4, 'buy', 7, 165.00, 1155.00, DATE_SUB(NOW(), INTERVAL 22 DAY)),
(3, 6, 'buy', 15, 460.00, 6900.00, DATE_SUB(NOW(), INTERVAL 18 DAY)),
(3, 6, 'sell', 3, 475.00, 1425.00, DATE_SUB(NOW(), INTERVAL 12 DAY)),
(3, 8, 'buy', 20, 185.00, 3700.00, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(4, 13, 'buy', 5, 2600.00, 13000.00, DATE_SUB(NOW(), INTERVAL 35 DAY)),
(4, 14, 'buy', 3, 3500.00, 10500.00, DATE_SUB(NOW(), INTERVAL 27 DAY)),
(4, 15, 'buy', 10, 1380.00, 13800.00, DATE_SUB(NOW(), INTERVAL 14 DAY));

-- ============================================================
-- SEED DATA: watchlist
-- ============================================================
INSERT INTO watchlist (user_id, stock_id) VALUES
(2, 2), (2, 6), (2, 12),
(3, 1), (3, 7), (3, 13),
(4, 1), (4, 3), (4, 7);
-- ============================================================
-- USE DATABASE
-- ============================================================

USE stock_market;

-- ============================================================
-- 1. GET ALL STOCKS
-- ============================================================

SELECT * FROM stocks;


-- ============================================================
-- 2. GET USER PORTFOLIO WITH COMPANY NAMES
-- ============================================================

SELECT 
    p.user_id,
    s.company_name,
    s.symbol,
    p.quantity,
    p.avg_buy_price,
    p.total_invested
FROM portfolios p
JOIN stocks s
ON p.stock_id = s.id
WHERE p.user_id = 2;


-- ============================================================
-- 3. CALCULATE CURRENT PORTFOLIO VALUE
-- ============================================================

SELECT 
    u.name,
    SUM(p.quantity * s.current_price) AS current_portfolio_value
FROM portfolios p
JOIN users u
ON p.user_id = u.id
JOIN stocks s
ON p.stock_id = s.id
WHERE u.id = 2
GROUP BY u.name;


-- ============================================================
-- 4. CALCULATE PROFIT / LOSS FOR EACH STOCK
-- ============================================================

SELECT
    s.company_name,
    p.quantity,
    p.avg_buy_price,
    s.current_price,

    (s.current_price - p.avg_buy_price) AS profit_per_share,

    ((s.current_price - p.avg_buy_price)
    * p.quantity) AS total_profit_loss

FROM portfolios p
JOIN stocks s
ON p.stock_id = s.id
WHERE p.user_id = 2;


-- ============================================================
-- 5. GET TRANSACTION HISTORY OF A USER
-- ============================================================

SELECT
    t.id,
    s.company_name,
    t.type,
    t.quantity,
    t.price_per_share,
    t.total_amount,
    t.created_at
FROM transactions t
JOIN stocks s
ON t.stock_id = s.id
WHERE t.user_id = 2
ORDER BY t.created_at DESC;


-- ============================================================
-- 6. TOP 5 MOST EXPENSIVE STOCKS
-- ============================================================

SELECT
    company_name,
    symbol,
    current_price
FROM stocks
ORDER BY current_price DESC
LIMIT 5;


-- ============================================================
-- 7. TOTAL INVESTMENT BY EACH USER
-- ============================================================

SELECT
    u.name,
    SUM(p.total_invested) AS total_investment
FROM portfolios p
JOIN users u
ON p.user_id = u.id
GROUP BY u.name;


-- ============================================================
-- 8. USER WATCHLIST
-- ============================================================

SELECT
    u.name,
    s.company_name,
    s.symbol,
    s.current_price
FROM watchlist w
JOIN users u
ON w.user_id = u.id
JOIN stocks s
ON w.stock_id = s.id
WHERE u.id = 3;


-- ============================================================
-- 9. STOCKS WITH HIGHEST TRADING VOLUME
-- ============================================================

SELECT
    company_name,
    symbol,
    volume
FROM stocks
ORDER BY volume DESC
LIMIT 10;


-- ============================================================
-- 10. SECTOR-WISE AVERAGE STOCK PRICE
-- ============================================================

SELECT
    sector,
    AVG(current_price) AS average_stock_price
FROM stocks
GROUP BY sector
ORDER BY average_stock_price DESC;


-- ============================================================
-- BONUS QUERY : DASHBOARD SUMMARY
-- ============================================================

SELECT
    u.name,

    COUNT(DISTINCT p.stock_id) AS total_stocks,

    SUM(p.total_invested) AS total_investment,

    SUM(p.quantity * s.current_price)
    AS current_value,

    SUM(
        (s.current_price - p.avg_buy_price)
        * p.quantity
    ) AS total_profit_loss

FROM users u

JOIN portfolios p
ON u.id = p.user_id

JOIN stocks s
ON p.stock_id = s.id

WHERE u.id = 2

GROUP BY u.name;


-- ============================================================
-- BONUS QUERY : TOP GAINING STOCKS
-- ============================================================

SELECT
    company_name,
    symbol,
    current_price,
    previous_close,

    ((current_price - previous_close)
    / previous_close) * 100
    AS percentage_gain

FROM stocks

ORDER BY percentage_gain DESC
LIMIT 5;


-- ============================================================
-- BONUS QUERY : USER BALANCES
-- ============================================================

SELECT
    id,
    name,
    email,
    balance
FROM users;


-- ============================================================
-- BONUS QUERY : TOTAL BUY VS SELL TRANSACTIONS
-- ============================================================

SELECT
    type,
    COUNT(*) AS total_transactions,
    SUM(total_amount) AS total_amount
FROM transactions
GROUP BY type;


-- ============================================================
-- BONUS QUERY : MOST PURCHASED STOCKS
-- ============================================================

SELECT
    s.company_name,
    s.symbol,
    SUM(t.quantity) AS total_quantity_bought
FROM transactions t
JOIN stocks s
ON t.stock_id = s.id
WHERE t.type = 'buy'
GROUP BY s.company_name, s.symbol
ORDER BY total_quantity_bought DESC
LIMIT 5;