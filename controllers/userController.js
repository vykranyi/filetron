const db = require('../database');

const getUserState = (id, callback) => {
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
    if (err) return callback(null);
    callback(row);
  });
};

const setUserState = (id, data) => {
  db.run(`
    INSERT INTO users (id, step, name, format, pages, delivery)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      step = excluded.step,
      name = COALESCE(excluded.name, name),
      format = COALESCE(excluded.format, format),
      pages = COALESCE(excluded.pages, pages),
      delivery = COALESCE(excluded.delivery, delivery)
  `, [id, data.step, data.name || null, data.format || null, data.pages || null, data.delivery || null]);
};

const clearUserState = (id) => {
  db.run('DELETE FROM users WHERE id = ?', [id]);
};

module.exports = { getUserState, setUserState, clearUserState };
