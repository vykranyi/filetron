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
            // 🔹 Utilisateur
            {
              type: "postback",
              title: "📥 Rejoindre la file",
              payload: "/rejoindre"
            },
            {
              type: "postback",
              title: "📊 Mon statut",
              payload: "/statut"
            },
            {
              type: "postback",
              title: "🚫 Quitter la file",
              payload: "/annuler"
            },
            // 🔧 Admin
            {
              type: "postback",
              title: "📋 Voir la file (admin)",
              payload: "/file"
            },
            {
              type: "postback",
              title: "✅ Appeler suivant",
              payload: "/suivant"
            }
          ]
        }
      ]
    };

    const response = await axios.post(url, payload);
    console.log('✅ Menu persistant mis à jour :', response.data);
  } catch (err) {
    console.error('❌ Erreur de menu persistant :', err.response?.data || err.message);
  }
};

setupPersistentMenu();
