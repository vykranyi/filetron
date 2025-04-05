const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/queuebot.db');

// Ініціалізація таблиць
db.serialize(() => {
  // Таблиця для збереження кроків користувача
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      step TEXT,
      name TEXT,
      format TEXT,
      pages TEXT,
      delivery TEXT
    )
  `);

  // Таблиця черги
  db.run(`
    CREATE TABLE IF NOT EXISTS queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT,
      name TEXT,
      format TEXT,
      pages TEXT,
      delivery TEXT,
      timestamp INTEGER
    )
  `);

  // Індекси (опціонально, для прискорення пошуку статусу)
  db.run(`CREATE INDEX IF NOT EXISTS idx_queue_userId ON queue(userId)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_queue_timestamp ON queue(timestamp)`);
});

module.exports = db;
