const { sendQuickReplies, sendMessage } = require('../services/messengerService');
const { handleAdminCommand } = require('../controllers/adminController');
const { handleUserCommand } = require('../controllers/userFlowController');
const { mainMenuButtons } = require('../utils/menus');
const { isWithinWorkingHours, getWorkingHoursMessage } = require('../utils/schedule');

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

  // 🕒 Графік роботи
  if (!isWithinWorkingHours() && !isAdmin && command !== '/start' && command !== '/') {
    return sendMessage(senderId, getWorkingHoursMessage());
  }

  // ▶️ Стартове меню
  if (command === '/start' || command === '/') {
    return sendQuickReplies(
      senderId,
      '👋 Bonjour ! Je suis le bot de file d’attente pour l’impression. Que souhaitez-vous faire ?',
      mainMenuButtons
    );
  }

  // 🛠️ Адмін-команди
  if (isAdmin) {
    const isHandled = await handleAdminCommand(command, senderId, db);
    if (isHandled) return;
  }

  // 👤 Користувач
  await handleUserCommand(command, senderId, db);
}

module.exports = messageHandler;
