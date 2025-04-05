const db = require('../database');

const addToQueue = (userId, userData, callback) => {
  const timestamp = Date.now();

  db.run(`
    INSERT INTO queue (userId, name, format, pages, delivery, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `,
    [userId, userData.name, userData.format, userData.pages, userData.delivery, timestamp],
    function (err) {
      if (err) {
        console.error('❌ Queue insert error:', err);
        return callback(null);
      }

      // отримуємо позицію в черзі
      db.get(
        `SELECT COUNT(*) AS position FROM queue WHERE id <= ?`,
        [this.lastID],
        (err, row) => {
          if (err) {
            console.error('❌ Queue position error:', err);
            return callback(null);
          }

          callback({
            id: String(this.lastID).padStart(3, '0'),
            position: row.position,
            eta: row.position * 5, // хвилини очікування
          });
        }
      );
    }
  );
};


const getStatus = (userId, callback) => {
  db.get(
    `SELECT id FROM queue WHERE userId = ? ORDER BY id ASC LIMIT 1`,
    [userId],
    (err, userRow) => {
      if (err || !userRow) return callback(null);

      const userQueueId = userRow.id;

      db.get(
        `SELECT COUNT(*) AS position FROM queue WHERE id <= ?`,
        [userQueueId],
        (err, row) => {
          if (err) return callback(null);

          callback({
            id: String(userQueueId).padStart(3, '0'),
            position: row.position,
            eta: row.position * 5,
          });
        }
      );
    }
  );
};

const cancelFromQueue = (userId, callback) => {
  db.run(
    `DELETE FROM queue WHERE userId = ?`,
    [userId],
    function (err) {
      if (err) {
        console.error('❌ Помилка при видаленні з черги:', err);
        return callback(false);
      }

      callback(this.changes > 0); // було щось видалено
    }
  );
};


module.exports = { addToQueue, getStatus };
module.exports = { addToQueue };
module.exports = {
  addToQueue,
  getStatus,
  cancelFromQueue
};
