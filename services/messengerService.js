const axios = require('axios');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const FB_API = 'https://graph.facebook.com/v17.0/me/messages';

function sendMessage(recipientId, text) {
  return axios.post(FB_API, {
    recipient: { id: recipientId },
    message: { text }
  }, {
    params: { access_token: PAGE_ACCESS_TOKEN }
  }).catch(err => {
    console.error('❌ sendMessage error:', err.response?.data || err.message);
  });
}

function sendQuickReplies(recipientId, text, replies) {
  const messageData = {
    recipient: { id: recipientId },
    message: {
      text,
      quick_replies: replies.map(btn => ({
        content_type: 'text',
        title: btn.title,
        payload: btn.payload
      }))
    }
  };

  return axios.post(FB_API, messageData, {
    params: { access_token: PAGE_ACCESS_TOKEN }
  }).catch(err => {
    console.error('❌ sendQuickReplies error:', err.response?.data || err.message);
  });
}

module.exports = {
  sendMessage,
  sendQuickReplies
};
