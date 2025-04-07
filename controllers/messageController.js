const { sendQuickReplies } = require('../services/messengerService');
const { handleAdminCommand } = require('../controllers/adminController');
const { handleUserCommand } = require('../controllers/userFlowController');
const { userMainMenu } = require('../utils/menus');

const PAGE_ID = process.env.PAGE_ID;
const ADMIN_IDS = process.env.ADMINS.split(',').map(id => id.trim());

async function messageHandler(event, db) {
  const senderId = event.sender?.id;
  const message = event.message;
  const text = message?.text;
  const payload = message?.quick_reply?.payload;
  const command = payload || text;

  if (message?.is_echo || senderId === PAGE_ID || !command) return;

  const isAdmin = ADMIN_IDS.includes(senderId);

  if (command === '/start' || command === '/') {
    return sendQuickReplies(
      senderId,
      '👋 Bonjour ! Je suis le bot de file d’attente pour l’impression. Que souhaitez-vous faire ?',
      userMainMenu
    );
  }

  if (isAdmin) {
    const isHandled = await handleAdminCommand(command, senderId, db);
    if (isHandled) return;
  }

  await handleUserCommand(command, senderId, db);
}

module.exports = messageHandler;
