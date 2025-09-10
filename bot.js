const TelegramBot = require('node-telegram-bot-api');

let botInstance;

function initializeBot(token) {
    if (!token) {
        throw new Error('FatalError: Telegram Bot Token not provided!');
    }
    if (!botInstance) {
        botInstance = new TelegramBot(token);
    }
    return botInstance;
}

// Ekspor fungsi inisialisasi dan getter untuk instance bot
module.exports = { initializeBot, getBot: () => botInstance };