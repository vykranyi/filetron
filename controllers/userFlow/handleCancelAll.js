const { clearUserState } = require('../userController');
const { cancelFromQueue } = require('../queueController');
const { sendMessage, sendQuickReplies } = require('../../services/messengerService');
const { returnButton } = require('../../utils/menus');

function handleCancelAll(command, senderId) {
  if (command === '/annuler') {
    return sendQuickReplies(senderId, '⚠️ Voulez-vous vraiment **quitter la file** ? Cela supprimera **toutes** vos demandes en cours.', [
      { title: '✅ Oui, quitter', payload: '/confirmer_annuler' },
      { title: '↩️ Non, revenir', payload: '/status' }
    ]);
  }

  if (command === '/confirmer_annuler') {
    return cancelFromQueue(senderId, async success => {
      if (success) {
        clearUserState(senderId);
        return sendQuickReplies(senderId, '❌ Vous avez quitté la file avec succès.', [
          { title: '📥 Rejoindre à nouveau', payload: '/rejoindre' },
          ...returnButton
        ]);
      } else {
        return sendMessage(senderId, 'ℹ️ Vous n’étiez pas dans la file.');
      }
    });
  }

  return null; // Команда не оброблена тут
}

module.exports = handleCancelAll;
