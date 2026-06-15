/**
 * Run this once after importing the SQL to fix demo passwords.
 * Usage: node utils/fixPasswords.js
 */
const bcrypt = require('bcrypt');
require('dotenv').config();
const db = require('../config/db');

async function fixPasswords() {
  try {
    const hash = await bcrypt.hash('password123', 10);
    const [result] = await db.query('UPDATE users SET password = ?', [hash]);
    console.log(`✅ Updated passwords for ${result.affectedRows} users`);
    console.log('');
    console.log('Demo accounts (password: password123):');
    console.log('  admin@stockmarket.com  → Admin');
    console.log('  john@example.com       → User');
    console.log('  jane@example.com       → User');
    console.log('  rahul@example.com      → User');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixPasswords();
