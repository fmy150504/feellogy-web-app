const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
    // ID Pengguna (Akan digunakan saat fitur Login/Register diimplementasikan)
    // Untuk saat ini bisa null/undefined (jika pengguna tidak login)
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: false, // TIDAK WAJIB saat ini (untuk pengguna anonim)
    },
    // Total skor yang didapatkan pengguna
    total_score: {
        type: Number,
        required: true,
    },
    // Tingkat Stres (Ringan, Sedang, Berat)
    stress_level: {
        type: String,
        enum: ['Rendah', 'Sedang', 'Tinggi'],
        required: true,
    },
    // Jawaban detail pengguna (opsional, untuk analisis detail)
    answers: [{
        question_id: mongoose.Schema.Types.ObjectId,
        selected_score: Number,
    }],
    // Tanggal kuis diselesaikan
    completedAt: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true 
});

const ResultModel = mongoose.model('QuizResult', ResultSchema);

module.exports = ResultModel;