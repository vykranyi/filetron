const { sendQuickReplies } = require('../../services/messengerService');
const { mainMenuButtons } = require('../../utils/menus');

function handleDefault(senderId) {
  return sendQuickReplies(
    senderId,
    '🤖 Je n’ai pas compris votre message. Que souhaitez-vous faire ?',
    mainMenuButtons
  );
}

module.exports = handleDefault;
