const mainMenuButtons = [
  { title: '📥 Rejoindre la file', payload: '/rejoindre' },
  { title: '📊 Mon statut', payload: '/status' },
  { title: '🚫 Quitter la file', payload: '/annuler' }
];

const returnButton = [{ title: '↩️ Retour', payload: '/' }];

const afterActionButtons = [
  { title: '📊 Mon statut', payload: '/status' },
  ...returnButton
];

const confirmCancelAllButtons = [
  { title: '✅ Oui, quitter', payload: '/confirmer_annuler' },
  { title: '↩️ Non, revenir', payload: '/status' }
];

const deliveryOptions = [
  { title: '📎 Sur une clé USB', payload: '/delivery_usb' },
  { title: '📧 Par e-mail', payload: '/delivery_email' },
  { title: '↩️ Retour', payload: '/rejoindre' }
];

const adminMenu = [
  { title: '✅ Suivant', payload: '/suivant' },
  { title: '📋 Voir la file', payload: '/file' }
];

module.exports = {
  mainMenuButtons, 
  returnButton,
  afterActionButtons,
  confirmCancelAllButtons,
  deliveryOptions,
  adminMenu
};
