const { sendMessage, sendQuickReplies } = require('../services/messengerService');
const { adminMenu } = require('../utils/menus');

async function handleAdminCommand(command, senderId, db) {
  if (command === '/file') {
    return db.all(`SELECT id, name FROM queue ORDER BY id ASC LIMIT 10`, [], async (err, rows) => {
      if (err || !rows.length) {
        return sendMessage(senderId, '📭 La file d’attente est vide.');
      }

      const list = rows.map(row => `#${String(row.id).padStart(3, '0')} — ${row.name}`).join('\n');

      const total = await new Promise((resolve, reject) => {
        db.get(`SELECT COUNT(*) as count FROM queue`, [], (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        });
      });

      await sendMessage(senderId, `📋 File actuelle :\n${list}\n\n👥 Total : ${total} personnes`);
      return sendQuickReplies(senderId, '🔧 Actions :', adminMenu);
    });
  }

  if (command === '/suivant') {
    db.get(`SELECT COUNT(*) as total FROM queue`, [], async (err, countRow) => {
      if (err || !countRow || countRow.total === 0) {
        return sendMessage(senderId, '📭 La file d’attente est vide.');
      }

      const wasOnlyOne = countRow.total === 1;

      const nextUser = await new Promise((resolve, reject) => {
        db.get(`SELECT * FROM queue ORDER BY id ASC LIMIT 1`, [], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!nextUser) {
        return sendMessage(senderId, '📭 La file d’attente est vide.');
      }

      await new Promise((resolve, reject) => {
        db.run(`DELETE FROM queue WHERE id = ?`, [nextUser.id], function (err) {
          if (err) reject(err);
          else resolve();
        });
      });

      const warnUser = await new Promise((resolve, reject) => {
        db.get(`SELECT * FROM queue ORDER BY id ASC LIMIT 1 OFFSET 4`, [], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (warnUser) {
        await sendMessage(warnUser.userId, '⏳ Il ne reste que 5 personnes avant vous, préparez-vous !');
      }

      const fullId = `#${String(nextUser.id).padStart(3, '0')}`;
      const name = nextUser.name || '—';
      const format = nextUser.format || '—';
      const pages = nextUser.pages || '—';
      const delivery = nextUser.delivery || '—';

      const emailInfo = delivery === 'Email'
        ? `✉️ Sujet recommandé :\n${fullId}_${name}`
        : '';

      const totalAfter = countRow.total - 1;

      const message =
        `📣 L’utilisateur suivant a été appelé :\n\n` +
        `🆔 ID : ${fullId}\n` +
        `👤 Nom : ${name}\n` +
        `🖨️ Type : ${format}\n` +
        `📄 Pages : ${pages}\n` +
        `📤 Livraison : ${delivery}\n` +
        `${emailInfo ? '\n' + emailInfo : ''}\n\n` +
        `👥 Restants dans la file : ${totalAfter}`;

      if (wasOnlyOne) {
        await sendMessage(senderId, `🚦 La file vient de commencer.`);
      }

      await sendMessage(senderId, message);

      return sendQuickReplies(senderId, '🔧 Actions :', adminMenu);
    });

    return true;
  }

  return false;
}

module.exports = { handleAdminCommand };
