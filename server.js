require('dotenv').config();
const express = require('express');
const { initializeBot } = require('./bot');
const ngrok = require('ngrok');
const { handleMessage } = require('./controllers/botController');

// Inisialisasi bot dengan token dari .env
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
const PORT = process.env.PORT || 3000;

// Middleware
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Otomatis set webhook menggunakan ngrok saat development
    if (process.env.NODE_ENV === 'development') {
        ngrok.connect(PORT).then(async (url) => {
            console.log(`ngrok tunnel opened at: ${url}`);
            try {
                // Hapus webhook yang mungkin sudah ada sebelumnya
                await bot.deleteWebHook();
                // Set webhook baru dengan URL dari ngrok
                await bot.setWebHook(`${url}/webhook`);
                console.log('Webhook set successfully with ngrok URL!');
            } catch (error) {
                console.error('Error setting webhook with ngrok:', error);
            }
        }).catch(error => {
            console.error('Error while connecting ngrok:', error);
            // Jika Anda menggunakan ngrok versi gratis, Anda mungkin perlu token.
            // Coba jalankan: ngrok config add-authtoken <YOUR_AUTHTOKEN>
            // Token bisa didapatkan dari dashboard ngrok Anda.
        });
    } else {
        console.log('In production, please set WEBHOOK_URL in your .env file and set the webhook manually or via a script.');
    }
});