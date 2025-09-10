const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
const { fileTypeFromBuffer } = require("file-type");

// Pastikan dotenv sudah dipanggil di file utama (server.js)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Menghasilkan respons dari model Gemini berdasarkan prompt teks.
 * @param {string} prompt Teks input dari pengguna.
 * @returns {Promise<string>} Respons yang dihasilkan oleh AI.
 */
async function generateResponse(prompt) {
  try {
    // Menggunakan model 'gemini-1.5-flash' yang lebih baru dan cepat
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      // Menambahkan instruksi sistem untuk kepribadian bot
      systemInstruction:
        "Kamu adalah asisten AI bernama Linggayahaha Online. Selalu jawab semua pertanyaan dengan gaya bahasa Indonesia gaul, santai, dan sedikit humor. Boleh menggunakan bahasa selain bahasa indonesia hanya ketika diberi pertanyaan atau ditanya saja. Jangan pernah menggunakan bahasa formal. Jika ada yang bertanya siapa kamu, jawab dengan 'Aku adalah Linggayahaha Online!'.",
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    if (!response) {
      return "Waduh, sorry nih, gue lagi nge-blank. Coba tanya lagi deh.";
    }
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error generating response from Gemini:", error);
    // Mengembalikan pesan error yang ramah jika terjadi masalah
    return "Maaf, saya sedang kesulitan berpikir saat ini. Coba lagi nanti ya.";
  }
}

/**
 * Mengunduh gambar dari URL dan mengubahnya menjadi base64.
 * @param {string} url URL gambar.
 * @returns {Promise<{mimeType: string, data: string}>} Objek berisi mimeType dan data base64.
 */
async function urlToGenerativePart(url) {
  const response = await axios.get(url, {
    responseType: "arraybuffer",
  });
  const buffer = Buffer.from(response.data, "binary");

  // Deteksi tipe file dari buffer
  const type = await fileTypeFromBuffer(buffer);
  if (!type) {
    throw new Error("Tidak dapat mendeteksi tipe file gambar.");
  }

  return {
    inlineData: {
      mimeType: type.mime, // Gunakan tipe MIME yang terdeteksi
      data: buffer.toString("base64"),
    },
  };
}

/**
 * Menghasilkan respons dari model Gemini berdasarkan gambar dan teks.
 * @param {string} prompt Teks input dari pengguna.
 * @param {string} imageUrl URL gambar yang dikirim pengguna.
 * @returns {Promise<string>} Respons yang dihasilkan oleh AI.
 */
async function generateResponseFromImage(prompt, imageUrl) {
  try {
    // Gunakan model dan systemInstruction yang sama dengan text-only
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction:
        "Kamu adalah asisten AI bernama Linggayahaha Online. Selalu jawab semua pertanyaan dengan gaya bahasa Jawa gaul, santai, dan sedikit humor. Boleh menggunakan bahasa selain bahasa indonesia hanya ketika diberi pertanyaan atau ditanya saja. Jangan pernah menggunakan bahasa formal. Jika ada yang bertanya siapa kamu, jawab dengan 'Aku adalah Linggayahaha Online!'.",
    });

    const imagePart = await urlToGenerativePart(imageUrl);

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    if (!response) {
      return "Waduh, sorry nih, gue lagi nge-blank. Coba tanya lagi deh.";
    }
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error generating response from Gemini with image:", error);
    return "Duh, gambarnya burem atau gimana nih? Gue gabisa liat, coba kirim gambar lain.";
  }
}

module.exports = {
  generateResponse,
  generateResponseFromImage,
};
