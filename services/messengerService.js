const axios = require('axios');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const FB_API = 'https://graph.facebook.com/v17.0/me/messages';

// Загальний виклик API
function callSendAPI(payload, label = 'sendAPI') {
  return axios.post(FB_API, payload, {
    params: { access_token: PAGE_ACCESS_TOKEN }
  }).catch(err => {
    console.error(`❌ ${label} error:`, err.response?.data || err.message);
  });
}

// Текстове повідомлення
function sendMessage(recipientId, text) {
  return callSendAPI({
    recipient: { id: recipientId },
    message: { text }
  }, 'sendMessage');
}

// Кнопки
function sendQuickReplies(recipientId, text, replies = []) {
  const messageData = {
    recipient: { id: recipientId },
    message: { text }
  };

  if (Array.isArray(replies) && replies.length > 0) {
    messageData.message.quick_replies = replies.map(btn => ({
      content_type: 'text',
      title: btn.title,
      payload: btn.payload
    }));
  }

  return callSendAPI(messageData, 'sendQuickReplies');
}

module.exports = {
  sendMessage,
  sendQuickReplies
};
