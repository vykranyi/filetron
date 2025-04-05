const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const sendMessage = async (recipientId, message) => {
  try {
    const url = `https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
    const payload = {
      recipient: { id: recipientId },
      message: { text: message }
    };

    await axios.post(url, payload);
    console.log(`✅ Message sent to ${recipientId}`);
  } catch (err) {
    console.error('❌ Send message error:', err.response?.data || err.message);
  }
};

const sendImage = async (recipientId, imagePath) => {
  try {
    const url = `https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

    const form = new FormData();
    form.append('recipient', JSON.stringify({ id: recipientId }));
    form.append('message', JSON.stringify({ attachment: { type: 'image', payload: {} } }));
    form.append('filedata', fs.createReadStream(imagePath));

    await axios.post(url, form, {
      headers: form.getHeaders()
    });

    console.log(`✅ Image sent to ${recipientId}`);
  } catch (err) {
    console.error('❌ Send image error:', err.response?.data || err.message);
  }
};

const sendQuickReplies = async (recipientId, text, replies) => {
  if (!replies?.length) {
    return sendMessage(recipientId, text);
  }

  try {
    const url = `https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;
    const payload = {
      recipient: { id: recipientId },
      message: {
        text,
        quick_replies: replies.map(reply => ({
          content_type: 'text',
          title: reply.title,
          payload: reply.payload
        }))
      }
    };

    await axios.post(url, payload);
    console.log(`✅ Quick replies sent to ${recipientId}`);
  } catch (err) {
    console.error('❌ sendQuickReplies error:', err.response?.data || err.message);
  }
};

module.exports = { sendMessage, sendImage, sendQuickReplies };
