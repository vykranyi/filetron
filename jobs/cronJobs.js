const cron = require('node-cron');
const { exportAndClearQueue } = require('../utils/dailyBackup');

function registerCrons(app) {
  const db = app.get('db');

  // 🕐 Щоденний бекап о 23:59
  cron.schedule('59 23 * * *', async () => {
    console.log('⏳ Стартує щоденне резервне копіювання черги...');
    try {
      const result = await exportAndClearQueue(db);
      console.log(result);
    } catch (err) {
      console.error('❌ Помилка резервного копіювання:', err);
    }
  });
}

module.exports = { registerCrons };
