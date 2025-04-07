const { setUserState, clearUserState } = require('../userController');
const { addToQueue } = require('../queueController');
const { sendMessage, sendQuickReplies } = require('../../services/messengerService');
const {
  returnButton,
  afterActionButtons,
  deliveryOptions
} = require('../../utils/menus');

async function handleFormSteps(command, senderId, state, db) {
  if (!state?.step) return null;

  // 🧩 Étape 1 : Nom
  if (state.step === 'name') {
    setUserState(senderId, { step: 'format', name: command });
    return sendQuickReplies(senderId, '🖨️ Quel type ou format souhaitez-vous imprimer ?\n(ex : A4, A3, carte, édition, affiche...)', returnButton);
  }

  // 🧩 Étape 2 : Format
  if (state.step === 'format') {
    setUserState(senderId, { ...state, step: 'pages', format: command });
    return sendQuickReplies(senderId, '📄 Combien de pages souhaitez-vous imprimer ?', returnButton);
  }

  // 🧩 Étape 3 : Nombre de pages
  if (state.step === 'pages') {
    setUserState(senderId, { ...state, step: 'delivery_method', pages: command });
    return sendQuickReplies(senderId, '📤 Comment souhaitez-vous transmettre le fichier pour impression ?', deliveryOptions);
  }

  // 🧩 Étape 4 : Méthode de livraison
  if (state.step === 'delivery_method') {
    const method = command === '/delivery_usb' ? 'USB' : 'Email';
    const userData = { ...state, step: 'done', delivery: method };
    clearUserState(senderId);

    return addToQueue(senderId, userData, async queueInfo => {
      if (!queueInfo) {
        await sendMessage(senderId, '😢 Une erreur s’est produite lors de l’ajout à la file.');
        return sendQuickReplies(senderId, '🔽 Que souhaitez-vous faire ?', returnButton);
      }

      const fullId = `#${String(queueInfo.id).padStart(3, '0')}`;
      const peopleAhead = Math.max(queueInfo.position - 1, 0);

      await sendMessage(senderId,
        `✅ Vous avez été ajouté à la file d’attente !\n🆔 ID : ${fullId}\n👥 Personnes devant vous : ${peopleAhead}`
      );

      if (method === 'Email') {
        const subjectLine = `${fullId}_${userData.name}`;
        const emailAddress = 'email@email.com';

        await sendMessage(senderId,
          `📧 Veuillez envoyer votre fichier à l’adresse suivante :\n\`${emailAddress}\`\n\n` +
          `📌 Dans le sujet du mail, copiez ce texte :\n\`${subjectLine}\`\n\n` +
          `Cela nous permet de retrouver rapidement votre demande. Merci !`
        );
      }

      return sendQuickReplies(senderId, 'Souhaitez-vous faire autre chose ?', afterActionButtons);
    });
  }

  return null;
}

module.exports = handleFormSteps;
