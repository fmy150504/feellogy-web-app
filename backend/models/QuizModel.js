const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
    // Pertanyaan yang akan ditampilkan
    question_text: {
        type: String,
        required: true,
    },
    // Opsi jawaban. Setiap opsi memiliki teks dan skor/bobot.
    options: [{
        option_text: {
            type: String,
            required: true,
        },
        score_value: { // Bobot untuk pertanyaan ini (misal: 0, 1, 2, 3)
            type: Number,
            required: true,
        },
    }],
    // Topik atau kategori pertanyaan (misal: "Emosi", "Tidur", "Fisik")
    category: {
        type: String,
        required: true,
    }
}, {
    collection: 'quizquestions'
});

const QuizModel = mongoose.model('QuizQuestion', QuizSchema);

module.exports = QuizModel;