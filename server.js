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
    const message = req.body.message;
    
    if (message) {
        handleMessage(message);
    }
    
    res.sendStatus(200);
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'Bot is running!' });
});

// Fungsi untuk mengatur webhook (dijalankan terpisah)
const setWebhook = async (url) => {
    try {
        await bot.setWebHook(`${url}/webhook`);
        console.log(`Webhook set to: ${url}/webhook`);
    } catch (error) {
        console.error('Error setting webhook:', error);
    }
};

// Jika dijalankan di luar Vercel (misalnya, untuk pengembangan lokal)
if (process.env.NODE_ENV === 'development') {
    app.listen(3000, () => console.log('Local server running on port 3000'));
}

module.exports = app;