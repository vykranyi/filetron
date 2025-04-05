require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/queuebot.db');
const { getUserState, setUserState, clearUserState } = require('./controllers/userController');
const { addToQueue, getStatus, cancelFromQueue } = require('./controllers/queueController');
const { generateTicketSVG } = require('./utils/ticketGenerator');
const { sendMessage, sendImage, sendQuickReplies } = require('./services/messengerService');

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ID = process.env.PAGE_ID;
const ADMIN_IDS = process.env.ADMINS.split(',').map(id => id.trim());

// 🔐 Вебхук для підтвердження
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified!');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 📩 Обробка повідомлень
app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      const events = entry.messaging || [];

      events.forEach(event => {
        const senderId = event.sender?.id;
        const message = event.message;
        const text = message?.text;
        const payload = message?.quick_reply?.payload;
        const command = payload || text;

        if (message?.is_echo || senderId === PAGE_ID || !command) return;

        const isAdmin = ADMIN_IDS.includes(senderId);
        console.log(`📩 New message: ${senderId}: ${command}`);

        // ✅ Команда /старт
        if (command === '/старт' || command === '/') {
          return sendQuickReplies(senderId, '👋 Привіт! Я бот черги на друк. Оберіть дію:', [
            { title: '📥 Долучитися', payload: '/долучитися' },
            { title: '📊 Мій статус', payload: '/статус' },
            { title: '🚫 Вийти з черги', payload: '/відміна' }
          ]);
        }

        // 👨‍💼 Адмін-команди
        if (isAdmin && command === '/черга') {
          db.all(`SELECT id, name FROM queue ORDER BY id ASC LIMIT 10`, [], (err, rows) => {
            if (err || !rows.length) {
              return sendMessage(senderId, '📭 Черга порожня');
            }

            const list = rows.map(row => `#${String(row.id).padStart(3, '0')} — ${row.name}`).join('\n');
            sendMessage(senderId, `📋 Поточна черга:\n${list}`);
            return sendQuickReplies(senderId, '🔧 Дії:', [
              { title: '✅ Наступний', payload: '/наступний' },
              { title: '📋 Черга', payload: '/черга' }
            ]);
          });
          return;
        }

        if (isAdmin && command === '/наступний') {
          db.get(`SELECT * FROM queue ORDER BY id ASC LIMIT 1`, [], (err, nextUser) => {
            if (err || !nextUser) {
              return sendMessage(senderId, '📭 Черга порожня');
            }

            db.run(`DELETE FROM queue WHERE id = ?`, [nextUser.id]);

            db.get(`SELECT * FROM queue ORDER BY id ASC LIMIT 1 OFFSET 4`, [], (err, warnUser) => {
              if (warnUser) {
                sendMessage(warnUser.userId, '⏳ Перед вами залишилось лише 5 людей, готуйтеся!');
              }
            });

            return sendQuickReplies(senderId, '⌛ Скільки часу триватиме ця послуга?', [
              { title: '5 хв', payload: `/таймер_5_${nextUser.userId}` },
              { title: '10 хв', payload: `/таймер_10_${nextUser.userId}` },
              { title: '15 хв', payload: `/таймер_15_${nextUser.userId}` },
              { title: '↩️ Назад', payload: '/черга' }
            ]);
          });
          return;
        }

        if (isAdmin && command.startsWith('/таймер_')) {
          const [_, mins, targetUserId] = command.split('_');
          sendMessage(targetUserId, `📣 Ви наступні! Підходьте до принтера 🖨️`);
          sendMessage(senderId, `✅ Повідомлення надіслано. Орієнтовний час: ${mins} хв.`);
          return;
        }

        // 👤 Користувачі
        getUserState(senderId, (userState) => {
          if (command === '/долучитися') {
            db.get(`SELECT COUNT(*) as count FROM queue WHERE userId = ?`, [senderId], (err, row) => {
              if (row.count >= 3) {
                return sendMessage(senderId, '⚠️ Ви вже маєте три активні запити. Спочатку завершіть один з них.');
              }
              setUserState(senderId, { step: 'name' });
              return sendQuickReplies(senderId, '📛 Введіть своє прізвище та ім’я:', [
                { title: '↩️ Назад', payload: '/' }
              ]);
            });
            return;
          }

          if (command === '/статус') {
            db.all(`SELECT id, name FROM queue WHERE userId = ? ORDER BY id ASC`, [senderId], (err, rows) => {
              if (err || !rows.length) {
                return sendQuickReplies(senderId, 'ℹ️ Ви зараз не в черзі.', [
                  { title: '📥 Долучитися', payload: '/долучитися' },
                  { title: '↩️ Назад', payload: '/' }
                ]);
              }
              const list = rows.map((row) => `#${String(row.id).padStart(3, '0')} — ${row.name}`).join('\n');
              const buttons = rows.map((row) => ({
                title: `❌ Скасувати #${row.id}`,
                payload: `/підтвердити_відміну_${row.id}`
              }));
              buttons.push({ title: '↩️ Назад', payload: '/' });
              return sendQuickReplies(senderId, `📍 Ваші черги:\n${list}`, buttons);
            });
            return;
          }

          if (command.startsWith('/підтвердити_відміну_')) {
            const cancelId = parseInt(command.split('_')[2]);
            return sendQuickReplies(senderId, `❓ Ви впевнені, що хочете скасувати запис #${cancelId}?`, [
              { title: '✅ Так, скасувати', payload: `/відміна_${cancelId}` },
              { title: '↩️ Ні, залишити', payload: '/статус' }
            ]);
          }

          if (command.startsWith('/відміна_')) {
            const cancelId = parseInt(command.split('_')[1]);
            db.run(`DELETE FROM queue WHERE id = ? AND userId = ?`, [cancelId, senderId], function (err) {
              if (err || this.changes === 0) {
                return sendMessage(senderId, `⚠️ Не вдалося скасувати запис #${cancelId}.`);
              }
              return sendMessage(senderId, `❌ Запис #${cancelId} успішно скасовано.`);
            });
            return;
          }

          if (command === '/відміна') {
            cancelFromQueue(senderId, (success) => {
              if (success) {
                clearUserState(senderId);
                return sendQuickReplies(senderId, '❌ Ви успішно вийшли з черги.', [
                  { title: '📥 Долучитися знову', payload: '/долучитися' }
                ]);
              } else {
                return sendMessage(senderId, 'ℹ️ Вас не було в черзі.');
              }
            });
            return;
          }

          if (userState?.step === 'name') {
            setUserState(senderId, { step: 'format', name: command });
            return sendQuickReplies(senderId, '📄 Вкажіть формат друку (A3, A4, плакат):', [
              { title: '↩️ Назад', payload: '/долучитися' }
            ]);
          }

          if (userState?.step === 'format') {
            setUserState(senderId, { ...userState, step: 'pages', format: command });
            return sendQuickReplies(senderId, '📃 Скільки сторінок потрібно надрукувати?', [
              { title: '↩️ Назад', payload: '/долучитися' }
            ]);
          }

          if (userState?.step === 'pages') {
            setUserState(senderId, { ...userState, step: 'delivery_method', pages: command });
            return sendQuickReplies(senderId, '📩 Як ви передасте файл для друку?', [
              { title: '📎 На флешці', payload: '/доставка_usb' },
              { title: '📧 Надішлю на email', payload: '/доставка_email' },
              { title: '↩️ Назад', payload: '/долучитися' }
            ]);
          }

          if (userState?.step === 'delivery_method') {
            if (command === '/доставка_usb') {
              const fullUser = { ...userState, step: 'done', delivery: 'USB' };
              clearUserState(senderId);

              addToQueue(senderId, fullUser, async (queueInfo) => {
                if (!queueInfo) {
                  return sendMessage(senderId, '😢 Сталася помилка при додаванні до черги.');
                }

                const { pngPath } = await generateTicketSVG(fullUser, queueInfo);

                await sendMessage(senderId,
                  `✅ Ви додані до черги!\n🆔 Ваш ID: ${queueInfo.id}\n📍 Позиція: ${queueInfo.position}\n⏳ Очікування: ~${queueInfo.eta} хв`
                );

                await sendImage(senderId, pngPath);
                return sendQuickReplies(senderId, 'Що бажаєте зробити далі?', [
                  { title: '📥 Долучитися', payload: '/долучитися' },
                  { title: '📊 Мій статус', payload: '/статус' },
                  { title: '🚫 Вийти з черги', payload: '/відміна' }
                ]);
              });
              return;
            }

            if (command === '/доставка_email') {
              const fullUser = { ...userState, step: 'done', delivery: 'Email' };
              clearUserState(senderId);

              addToQueue(senderId, fullUser, async (queueInfo) => {
                if (!queueInfo) {
                  return sendMessage(senderId, '😢 Сталася помилка при додаванні до черги.');
                }

                const { pngPath } = await generateTicketSVG(fullUser, queueInfo);

                await sendMessage(senderId,
                  `✅ Ви додані до черги!\n🆔 Ваш ID: ${queueInfo.id}\n📍 Позиція: ${queueInfo.position}\n⏳ Очікування: ~${queueInfo.eta} хв`
                );

                await sendMessage(senderId, '📧 Надішліть ваш файл на email@email.com. У темі листа вкажіть ваше ім’я та ID.');
                await sendImage(senderId, pngPath);
                return sendQuickReplies(senderId, 'Що бажаєте зробити далі?', [
                  { title: '📥 Долучитися', payload: '/долучитися' },
                  { title: '📊 Мій статус', payload: '/статус' },
                  { title: '🚫 Вийти з черги', payload: '/відміна' }
                ]);
              });
              return;
            }
          }

          return sendQuickReplies(senderId, 'Що бажаєте зробити?', [
            { title: '📥 Долучитися', payload: '/долучитися' },
            { title: '📊 Мій статус', payload: '/статус' },
            { title: '🚫 Вийти з черги', payload: '/відміна' }
          ]);
        });
      });
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});