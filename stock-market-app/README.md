# 📈 StockVault — Share & Stock Market Investment Management System

A full-stack production-ready web application for managing stock market investments. Built with **React**, **Node.js/Express**, and **MySQL**.

---

## ✨ Features

- 🔐 JWT Authentication (Register / Login / Protected Routes)
- 📊 Live Dashboard with Charts (Portfolio Pie + Growth Line)
- 📈 Stock Market with Buy/Sell modals
- 💼 Portfolio Management with P&L tracking
- 🔄 Complete Transaction History
- ⭐ Watchlist System
- 🛡️ Admin Panel (CRUD stocks, manage users, view all transactions)
- 📱 Fully Responsive Dark UI

---

## 🗂️ Project Structure

```
stock-market-app/
├── database/
│   └── stock_market.sql          # MySQL schema + seed data
│
├── backend/
│   ├── config/
│   │   └── db.js                 # MySQL2 connection pool
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── stockController.js
│   │   ├── portfolioController.js
│   │   ├── transactionController.js
│   │   ├── watchlistController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js               # JWT + admin middleware
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── stocks.js
│   │   ├── portfolio.js
│   │   ├── transactions.js
│   │   ├── watchlist.js
│   │   └── admin.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── layouts/
    │   │   └── MainLayout.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Stocks.jsx
    │   │   ├── Portfolio.jsx
    │   │   ├── Transactions.jsx
    │   │   ├── Watchlist.jsx
    │   │   └── AdminPanel.jsx
    │   ├── services/
    │   │   └── api.js             # Axios API service
    │   ├── styles/
    │   │   └── index.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## ⚙️ Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/) v18+
- [MySQL](https://dev.mysql.com/downloads/) v8.0+
- npm v9+

---

## 🗄️ Step 1 — MySQL Database Setup

### Option A: MySQL CLI

```bash
# Log in to MySQL
mysql -u root -p

# Import the schema and seed data
source /path/to/stock-market-app/database/stock_market.sql

# Verify
USE stock_market;
SHOW TABLES;
SELECT COUNT(*) FROM stocks;
```

### Option B: MySQL Workbench

1. Open MySQL Workbench
2. Connect to your local server
3. Go to **File → Run SQL Script**
4. Select `database/stock_market.sql`
5. Execute

---

## 🔧 Step 2 — Backend Setup

```bash
# Navigate to backend
cd stock-market-app/backend

# Install dependencies
npm install

# Configure environment variables
# Edit .env with your MySQL credentials:
```

Edit `backend/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password   # ← Change this
DB_NAME=stock_market
JWT_SECRET=stock_market_super_secret_key_2024
JWT_EXPIRES_IN=7d
PORT=5000
```

```bash
# Start the backend (development)
npm run dev

# OR production
npm start
```

✅ You should see:
```
✅ MySQL Database connected successfully
🚀 Stock Market API running on http://localhost:5000
```

---

## 💻 Step 3 — Frontend Setup

```bash
# Open a new terminal tab
cd stock-market-app/frontend

# Install dependencies
npm install

# Start the frontend dev server
npm run dev
```

✅ Open your browser at: **http://localhost:5173**

---

## 🌐 REST API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Stocks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stocks` | Get all stocks (with search/filter) |
| GET | `/api/stocks/:id` | Get stock by ID |
| POST | `/api/stocks` | Create stock (admin) |
| PUT | `/api/stocks/:id` | Update stock (admin) |
| DELETE | `/api/stocks/:id` | Deactivate stock (admin) |

### Portfolio
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portfolio/:userId` | Get user portfolio + summary |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transactions/buy` | Buy shares |
| POST | `/api/transactions/sell` | Sell shares |
| GET | `/api/transactions/:userId` | Get user transactions |
| GET | `/api/transactions/all` | Get all transactions (admin) |

### Watchlist
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/watchlist/:userId` | Get user watchlist |
| POST | `/api/watchlist` | Add to watchlist |
| DELETE | `/api/watchlist/:id` | Remove from watchlist |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Admin dashboard stats |
| GET | `/api/admin/users` | All users list |
| DELETE | `/api/admin/users/:id` | Delete user |

---

## 🔑 Demo Accounts

> **Note**: The SQL seed data uses a placeholder password hash. To use demo accounts, register new ones via the app's Register page, or update the password hashes by running this in the backend:

```bash
# Quick fix: register fresh accounts via the UI at http://localhost:5173/register
```

Alternatively, update demo passwords via a one-time script:

```bash
node -e "
const bcrypt = require('bcrypt');
const db = require('./config/db');
bcrypt.hash('password123', 10).then(h => {
  db.query('UPDATE users SET password = ?', [h]).then(() => { console.log('Done'); process.exit(); });
});
"
```

After running the script, you can log in with:

| Email | Password | Role |
|-------|----------|------|
| admin@stockmarket.com | password123 | Admin |
| john@example.com | password123 | User |
| jane@example.com | password123 | User |
| rahul@example.com | password123 | User |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios, Chart.js, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MySQL 8 via mysql2 |
| Auth | JWT + bcrypt |
| Dev Server | Vite |

---

## 🛡️ Security Features

- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens with expiry (7 days)
- Protected API routes with auth middleware
- Admin-only middleware for sensitive routes
- MySQL parameterized queries (SQL injection prevention)
- CORS configured to frontend origin only

---

## 🐛 Troubleshooting

**MySQL connection refused:**
```bash
# Check MySQL is running
sudo systemctl status mysql
# or on macOS
brew services list | grep mysql
```

**Port already in use:**
```bash
# Change PORT in backend/.env
# Change port in frontend/vite.config.js
```

**CORS error:**
- Ensure backend is running on port 5000
- Vite proxy in `vite.config.js` handles `/api` calls

**"Invalid token" after login:**
- Clear localStorage in browser DevTools → Application → Local Storage
- Re-login

---

## 📝 License

MIT — Free to use for educational and commercial projects.
