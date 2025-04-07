const { sendMessage, sendQuickReplies } = require('../../services/messengerService');
const { returnButton, afterActionButtons } = require('../../utils/menus');

function handleCancelSingle(command, senderId, db) {
  // 👉 Підтвердження скасування
  if (command.startsWith('/confirmer_annulation_')) {
    const cancelId = parseInt(command.split('_')[2]);
    return sendQuickReplies(senderId, `❓ Voulez-vous vraiment annuler la demande #${cancelId} ?`, [
      { title: '✅ Oui, annuler', payload: `/annuler_${cancelId}` },
      { title: '↩️ Non, garder', payload: '/status' }
    ]);
  }

  // 👉 Видалення з бази
  if (command.startsWith('/annuler_')) {
    const cancelId = parseInt(command.split('_')[1]);
    return db.run(`DELETE FROM queue WHERE id = ? AND userId = ?`, [cancelId, senderId], async function (err) {
      if (err || this.changes === 0) {
        await sendMessage(senderId, `⚠️ Échec de l’annulation de la demande #${cancelId}.`);
        return sendQuickReplies(senderId, '🔽 Que souhaitez-vous faire ?', returnButton);
      }

      await sendMessage(senderId, `❌ La demande #${cancelId} a été annulée avec succès.`);
      return sendQuickReplies(senderId, '🔽 Que souhaitez-vous faire ensuite ?', afterActionButtons);
    });
  }

  return null; // Не оброблено тут
}

module.exports = handleCancelSingle;
