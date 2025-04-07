const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'queuebot.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    name TEXT,
    format TEXT,
    pages TEXT,
    delivery TEXT,
    createdAt TEXT
  )`);
});

console.log('✅ Базу даних створено або оновлено!');
