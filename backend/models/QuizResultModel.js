const mongoose = require('mongoose');

const QuizResultSchema = new mongoose.Schema({
    // ID Pengguna: Diperlukan untuk history, tapi TIDAK WAJIB untuk hasil anonim
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: false, // <-- SET KE FALSE UNTUK MENGIZINKAN HASIL ANONIM
    },
    // Total skor yang didapatkan pengguna
    total_score: {
        type: Number,
        required: true,
    },
    // Tingkat Stres (Rendah, Sedang, Tinggi)
    stress_level: {
        type: String,
        enum: ['Rendah', 'Sedang', 'Tinggi'],
        required: true,
    },
    // Jawaban detail pengguna
    answers: [{
        question_id: mongoose.Schema.Types.ObjectId,
        selected_score: Number,
    }],
}, {
    timestamps: true 
});

// Model ini akan digunakan untuk semua hasil kuis (anonim & history)
const QuizResultModel = mongoose.model('QuizResult', QuizResultSchema);

module.exports = QuizResultModel;