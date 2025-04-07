const axios = require('axios');

async function getUserNameFromFacebook(psid) {
  const token = process.env.PAGE_ACCESS_TOKEN;
  try {
    const url = `https://graph.facebook.com/${psid}?fields=first_name,last_name&access_token=${token}`;
    const res = await axios.get(url);

    const { first_name, last_name } = res.data;
    if (!first_name) return null;

    return `${first_name} ${last_name || ''}`.trim();
  } catch (err) {
    console.error('❌ Erreur lors de la récupération du profil FB:', err.response?.data || err.message);
    return null;
  }
}

module.exports = { getUserNameFromFacebook };
