const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified!');
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

router.post('/', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    const db = req.app.get('db');
    body.entry.forEach(entry => {
      (entry.messaging || []).forEach(event => {
        messageController(event, db);
      });
    });

    return res.status(200).send('EVENT_RECEIVED');
  }

  return res.sendStatus(404);
});

module.exports = router;
