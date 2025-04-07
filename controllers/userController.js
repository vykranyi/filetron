const userStates = new Map();

function getUserState(userId, callback) {
  callback(userStates.get(userId));
}

function setUserState(userId, state) {
  userStates.set(userId, state);
}

function clearUserState(userId) {
  userStates.delete(userId);
}

module.exports = {
  getUserState,
  setUserState,
  clearUserState,
};
