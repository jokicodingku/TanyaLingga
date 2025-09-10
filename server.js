require('dotenv').config();
const express = require('express');
const { initializeBot } = require('./bot');
const { handleMessage } = require('./controllers/botController');

const bot = initializeBot(process.env.BOT_TOKEN);

// Mengatur daftar command yang akan muncul di Telegram
bot.setMyCommands([
    { command: 'tanya', description: 'Bertanya apa saja ke AI' },
    { command: 'help', description: 'Menampilkan menu bantuan' },
    { command: 'info', description: 'Menampilkan info tentang bot' },
]).then(() => {
    console.log('Bot commands set successfully!');
}).catch((error) => {
    console.error('Error setting bot commands:', error);
});

const app = express();

app.use(express.json());

// Webhook endpoint
app.post('/webhook', (req, res) => {
    // node-telegram-bot-api akan memproses seluruh body dari request
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'Bot is running!' });
});

// Railway akan menyediakan process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;