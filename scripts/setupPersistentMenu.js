require('dotenv').config();
const axios = require('axios');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const setupPersistentMenu = async () => {
  try {
    const url = `https://graph.facebook.com/v17.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`;

    const payload = {
      persistent_menu: [
        {
          locale: "default",
          composer_input_disabled: false,
          call_to_actions: [
            {
              type: "postback",
              title: "📥 Долучитися",
              payload: "/долучитися"
            },
            {
              type: "postback",
              title: "📊 Мій статус",
              payload: "/статус"
            },
            {
              type: "postback",
              title: "🚫 Вийти з черги",
              payload: "/відміна"
            }
          ]
        }
      ]
    };

    const response = await axios.post(url, payload);
    console.log('✅ Persistent menu updated:', response.data);
  } catch (err) {
    console.error('❌ Persistent menu error:', err.response?.data || err.message);
  }
};

setupPersistentMenu();
