const sqlite3 = require('sqlite3').verbose();

function addToQueue(userId, userData, callback) {
  const db = new sqlite3.Database('./data/queuebot.db');

  const name = userData.name;
  const format = userData.format;
  const pages = userData.pages;
  const delivery = userData.delivery;

  db.run(
    `INSERT INTO queue (userId, name, format, pages, delivery, createdAt)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    [userId, name, format, pages, delivery],
    function (err) {
      if (err) {
        console.error('❌ Error inserting into queue:', err);
        return callback(null);
      }

      const newId = this.lastID;

      db.all(
        `SELECT id FROM queue ORDER BY id ASC`,
        [],
        (err, rows) => {
          if (err) return callback(null);
          const position = rows.findIndex(row => row.id === newId) + 1;
          const eta = position * 5; // груба оцінка часу
          callback({ id: newId, position, eta });
        }
      );
    }
  );
}

function cancelFromQueue(userId, callback) {
  const db = new sqlite3.Database('./data/queuebot.db');

  db.run(`DELETE FROM queue WHERE userId = ?`, [userId], function (err) {
    if (err) {
      console.error('❌ Error deleting from queue:', err);
      return callback(false);
    }

    return callback(this.changes > 0);
  });
}

module.exports = {
  addToQueue,
  cancelFromQueue
};
