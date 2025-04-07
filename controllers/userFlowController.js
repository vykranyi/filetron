const { getUserState } = require('./userController');

const handleJoin = require('./userFlow/handleJoin');
const handleStatus = require('./userFlow/handleStatus');
const handleCancelSingle = require('./userFlow/handleCancelSingle');
const handleCancelAll = require('./userFlow/handleCancelAll');
const handleFormSteps = require('./userFlow/handleFormSteps');
const handleDefault = require('./userFlow/handleDefault');

async function handleUserCommand(command, senderId, db) {
  const state = await new Promise(resolve => getUserState(senderId, resolve));

  if (command === '/rejoindre') return handleJoin(senderId, db);

  if (command === '/status') return handleStatus(senderId, db);

  const singleCancelHandled = await handleCancelSingle(command, senderId, db);
  if (singleCancelHandled !== null) return singleCancelHandled;

  const cancelAllHandled = await handleCancelAll(command, senderId);
  if (cancelAllHandled !== null) return cancelAllHandled;

  const formHandled = await handleFormSteps(command, senderId, state, db);
  if (formHandled !== null) return formHandled;

  return handleDefault(senderId);
}

module.exports = { handleUserCommand };
