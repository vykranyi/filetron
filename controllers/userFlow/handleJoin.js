const { sendMessage, sendQuickReplies } = require('../../services/messengerService');
const { getUserNameFromFacebook } = require('../../utils/fbProfile');
const { transliterate } = require('../../utils/transliterate');
const { setUserState } = require('../userController');
const { returnButton, afterActionButtons } = require('../../utils/menus');

async function handleJoin(senderId, db) {
  return db.get(`SELECT COUNT(*) as count FROM queue WHERE userId = ?`, [senderId], async (err, row) => {
    if (err) {
      await sendMessage(senderId, '❌ Une erreur est survenue. Veuillez réessayer plus tard.');
      return sendQuickReplies(senderId, '🔽 Que souhaitez-vous faire ?', returnButton);
    }

    if (row.count >= 3) {
      await sendMessage(senderId, '⚠️ Vous avez déjà trois demandes actives. Veuillez en annuler une avant d’en ajouter une nouvelle.');
      return sendQuickReplies(senderId, '🔽 Que souhaitez-vous faire ensuite ?', afterActionButtons);
    }

    const fbName = await getUserNameFromFacebook(senderId);
    const latinName = fbName ? transliterate(fbName) : null;

    if (latinName) {
      setUserState(senderId, { step: 'format', name: latinName });
      await sendMessage(senderId, `🖨️ Nom détecté : *${latinName}*`);
      return sendQuickReplies(senderId, 'Quel type ou format souhaitez-vous imprimer ? (ex : A4, carte...)', returnButton);
    } else {
      setUserState(senderId, { step: 'name' });
      return sendQuickReplies(senderId, '🖊️ Veuillez saisir votre nom complet (ou un nom pour l’identification) :', returnButton);
    }
  });
}

module.exports = handleJoin;
