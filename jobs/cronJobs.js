const cron = require('node-cron');
const { exportAndClearQueue } = require('../utils/dailyBackup');

function registerCrons(app) {
  const db = app.get('db');

  cron.schedule('59 23 * * *', async () => {
    console.log('⏳ Daily queue backup starts...');
    try {
      const result = await exportAndClearQueue(db);
      console.log(result);
    } catch (err) {
      console.error('❌ Backup error:', err);
    }
  });
}

module.exports = { registerCrons };
