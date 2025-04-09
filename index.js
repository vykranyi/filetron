require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();


const webhookRoutes = require('./routes/webhook');
const { registerCrons } = require('./jobs/cronJobs');

const app = express();
app.use(bodyParser.json());

const db = new sqlite3.Database('./data/queuebot.db');
app.set('db', db);

app.use('/webhook', webhookRoutes);

const path = require('path');
app.use('/public', express.static(path.join(__dirname, 'public')));

registerCrons(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
