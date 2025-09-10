const { getBot } = require("../bot");
const {
  generateResponse,
  generateResponseFromImage,
} = require("../services/geminiService");

// Handler untuk pesan masuk
const handleMessage = async (message) => {
  const chatId = message.chat.id;
  const messageText = message.text || message.caption || ""; // Ambil teks dari pesan atau caption gambar
  const userId = message.from.id;
  const userName = message.from.first_name || "User";

  const bot = getBot();
  if (!bot) return console.error("Bot not initialized when handling message!");

  console.log(`Pesan dari ${userName} (${userId}): ${messageText}`);
  
  // Cek jika pesan berisi foto
  if (message.photo) {
    await handleImageMessage(chatId, message, userName);
    return;
  }
  
  // Jika tidak ada teks sama sekali (misal: stiker), abaikan.
  if (!messageText) return;
  
  try {
    // Command handling
    if (messageText.startsWith("/")) {
      // Cek apakah ini command /tanya
      if (messageText.toLowerCase().startsWith("/tanya ")) {
        // Ekstrak pertanyaan dari command
        const question = messageText.substring(7); // Menghapus "/tanya "
        await handleTanyaCommand(chatId, question, userName);
      } else {
        await handleCommand(chatId, messageText, userName);
      }
    } else {
      // Regular message - ini nanti akan disambungkan ke Gemini API
      await handleRegularMessage(chatId, messageText, userName);
    }
  } catch (error) {
    console.error("Error handling message:", error);
    await bot.sendMessage(
      getBot(),
      "Maaf, terjadi kesalahan. Silakan coba lagi."
    );
  }
};

// Handler untuk commands
const handleCommand = async (chatId, command, userName) => {
  const bot = getBot();
  switch (command.toLowerCase()) {
    case "/start":
      const welcomeMessage = `Wih, halo ${userName}! 👋\n\nKenalin, gue Linggayahaha Online. Siap bantu lo dengan kekuatan AI.\n\nNih command yang bisa lo pake:\n• \`/tanya <pertanyaan>\` - Buat nanya apa aja ke gue.\n• \`/help\` - Kalo butuh bantuan.\n• \`/info\` - Info soal bot ini.\n\nAtau, lo bisa langsung chat aja, ntar gue bales! 🤖`;
      await bot.sendMessage(chatId, welcomeMessage, { parse_mode: "Markdown" });
      break;

    case "/help":
      const helpMessage = `📚 **Bantuan**\n\nSantai, bro. Gini cara pakenya:\n\n1.  **Nanya Langsung**\n    Ketik \`/tanya\` diikuti pertanyaan lo.\n    Contoh: \`/tanya cara bikin kopi enak gimana?\`\n\n2.  **Ngobrol Biasa**\n    Langsung aja kirim pesan apa aja, ntar gue bales.\n\n3.  **Command Lain**\n    • \`/start\` - Buat mulai dari awal.\n    • \`/info\` - Kepoin info soal bot ini.`;
      await bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
      break;

    case "/info":
      const infoMessage = `ℹ️ **Informasi Bot**\n\n🤖 Bot Telegram AI\n📡 Terhubung dengan Gemini API\n⚡ Dibuat dengan Node.js & Express.js\n\nKetik \`/tanya <pertanyaan Anda>\` untuk bertanya langsung ke AI.`;
      await bot.sendMessage(chatId, infoMessage, { parse_mode: "Markdown" });
      break;

    default:
      await bot.sendMessage(
        chatId,
        `Command "${command}" tidak dikenali. Ketik /help untuk melihat command yang tersedia.`
      );
  }
};

// Handler khusus untuk command /tanya
const handleTanyaCommand = async (chatId, question, userName) => {
  const bot = getBot();
  if (!question) {
    await bot.sendMessage(chatId, "Tolong sertakan pertanyaan setelah command /tanya.\n\nContoh: `/tanya Apa itu AI?`", { parse_mode: "Markdown" });
    return;
  }

  console.log(`Pertanyaan dari ${userName} via /tanya: ${question}`);
  // Kita bisa gunakan kembali handleRegularMessage karena logikanya sama
  await handleRegularMessage(chatId, question, userName);
};

// Handler untuk pesan biasa (nanti akan terhubung ke Gemini)
const handleRegularMessage = async (chatId, messageText, userName) => {
  const bot = getBot();
  try {
    // Kirim "typing..." indicator
    await bot.sendChatAction(chatId, "typing");
    
    // Hasilkan respons menggunakan Gemini API
    const response = await generateResponse(messageText);
    
    await bot.sendMessage(chatId, response);
  } catch (error) {
    console.error("Error in handleRegularMessage:", error);
    await bot.sendMessage(chatId, "Oops, ada yang salah di pihak saya.");
  }
};

const handleImageMessage = async (chatId, message, userName) => {
  const bot = getBot();
  try {
    await bot.sendChatAction(chatId, "typing");

    // Ambil foto dengan resolusi terbaik (terakhir di array)
    const photo = message.photo[message.photo.length - 1];
    const fileId = photo.file_id;

    // Dapatkan link untuk mengunduh file
    const fileLink = await bot.getFileLink(fileId);
    const caption = message.caption || "Jelaskan gambar ini dong."; // Default prompt jika tidak ada caption

    console.log(
      `Menganalisis gambar dari ${userName} dengan caption: "${caption}"`
    );

    // Hasilkan respons dari Gemini menggunakan gambar dan caption
    const response = await generateResponseFromImage(caption, fileLink);
    await bot.sendMessage(chatId, response, { reply_to_message_id: message.message_id });
  } catch (error) {
    console.error("Error in handleImageMessage:", error);
    await bot.sendMessage(chatId, "Waduh, ada masalah pas gue coba liat gambarnya.");
  }
};

module.exports = {
  handleMessage,
};
