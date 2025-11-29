const mongoose = require('mongoose');

const AudioSchema = new mongoose.Schema({
    // Judul episode
    title: {
        type: String,
        required: [true, 'Judul episode wajib diisi.'],
        trim: true,
    },
    // Deskripsi singkat tentang isi episode
    description: {
        type: String,
        required: [true, 'Deskripsi wajib diisi.'],
    },
    // URL ke file audio aktual (misalnya, diupload ke S3 atau platform hosting lain)
    audio_url: {
        type: String,
        required: [true, 'URL audio wajib diisi.'],
    },
    // Durasi episode (dalam format string, misal: "12:30")
    duration: {
        type: String,
        default: '00:00',
    },
    // Topik atau tag untuk memudahkan pencarian
    tags: [String],
    
    // Tanggal episode dipublikasikan
    releaseDate: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true 
});

const AudioModel = mongoose.model('AudioDiary', AudioSchema);

module.exports = AudioModel;