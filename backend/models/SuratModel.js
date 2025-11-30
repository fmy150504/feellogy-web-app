const mongoose = require('mongoose');

const SuratSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false, // Tidak wajib jika suratnya public/anonim
        ref: 'User', // Referensi ke model User
        index: true, // Tambahkan index untuk pencarian cepat di /sent
    },
    // Judul surat
    title: {
        type: String,
        required: [true, 'Judul surat wajib diisi.'],
        trim: true,
        maxlength: [100, 'Judul tidak boleh melebihi 100 karakter.']
    },
    // Isi utama curhatan
    content: {
        type: String,
        required: [true, 'Isi surat wajib diisi.']
    },
    // Status untuk menentukan apakah surat akan dipublikasikan ke web atau hanya ke tim ahli
    is_published: {
        type: Boolean,
        default: false, // Default: hanya ke tim ahli (false), true jika publik
    },
    // Jumlah likes/dukungan dari pengguna lain (hanya untuk surat yang dipublikasikan)
    likes_count: {
        type: Number,
        default: 0
    },
    // Tanggal surat dibuat
    createdAt: {
        type: Date,
        default: Date.now
    },
    is_paid: {
        type: Boolean,
        default: false, // Apakah surat ini berbayar (meminta balasan psikolog)
    },
    status: {
        type: String,
        enum: ['public', 'internal', 'paid_waiting', 'paid_answered', 'refunded'],
        default: 'internal' // internal = hanya untuk tim ahli (default)
    },
    psikolog_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Merujuk ke UserModel (yang berperan sebagai psikolog)
        required: false,
    },
    reply_text: {
        type: String,
        required: false,
    },
    sent_at: {
        type: Date,
        default: Date.now,
    },
    answered_at: {
        type: Date,
        required: false,
    },
    is_deleted: {
        type: Boolean,
        default: false, // Flag untuk soft delete (Admin bisa menghapus)
    }
}, {
    // Opsional: menambahkan field updatedAt secara otomatis
    timestamps: true 
});

// Membuat model dari skema
const SuratModel = mongoose.model('Surat', SuratSchema);

module.exports = SuratModel;