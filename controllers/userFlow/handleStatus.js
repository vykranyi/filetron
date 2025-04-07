// controllers/userFlow/handleStatus.js
const { sendQuickReplies } = require('../../services/messengerService');
const { returnButton, mainMenuButtons } = require('../../utils/menus');

async function handleStatus(senderId, db) {
  return db.all(`SELECT id, name FROM queue WHERE userId = ? ORDER BY id ASC`, [senderId], (err, rows) => {
    if (err || !rows.length) {
      return sendQuickReplies(senderId, 'ℹ️ Vous n’êtes pas actuellement dans la file.', [
        mainMenuButtons[0], // Rejoindre la file
        ...returnButton
      ]);
    }

    const list = rows.map(row => `#${String(row.id).padStart(3, '0')} — ${row.name}`).join('\n');
    const buttons = rows.map(row => ({
      title: `❌ Annuler #${row.id}`,
      payload: `/confirmer_annulation_${row.id}`
    }));

    return sendQuickReplies(senderId, `📍 Vos demandes :\n${list}`, [...buttons, ...returnButton]);
  });
}

module.exports = handleStatus;
