const { getUserState } = require('./userController');

const handleJoin = require('./userFlow/handleJoin');
const handleStatus = require('./userFlow/handleStatus');
const handleCancelSingle = require('./userFlow/handleCancelSingle');
const handleCancelAll = require('./userFlow/handleCancelAll');
const handleFormSteps = require('./userFlow/handleFormSteps');
const handleDefault = require('./userFlow/handleDefault');

async function handleUserCommand(command, senderId, db) {
  const state = await new Promise(resolve => getUserState(senderId, resolve));

  // 🔹 Дія користувача: приєднання до черги
  if (command === '/rejoindre') return handleJoin(senderId, db);

  // 🔹 Дія користувача: перегляд статусу
  if (command === '/status') return handleStatus(senderId, db);

  // 🔸 Спроба скасувати один запис
  const singleCancelHandled = await handleCancelSingle(command, senderId, db);
  if (singleCancelHandled !== null) return singleCancelHandled;

  // 🔸 Спроба скасувати всі записи
  const cancelAllHandled = await handleCancelAll(command, senderId);
  if (cancelAllHandled !== null) return cancelAllHandled;

  // 🧩 Обробка етапів форми (ім’я, формат, сторінки, доставка)
  const formHandled = await handleFormSteps(command, senderId, state, db);
  if (formHandled !== null) return formHandled;

  // 🤷 Якщо нічого не підійшло — дефолтна відповідь
  return handleDefault(senderId);
}

module.exports = { handleUserCommand };
