// backend/controllers/psikologController.js

const User = require('../models/UserModel');
const Surat = require('../models/SuratModel'); // Diperlukan untuk query Surat
const UserWallet = require('../models/WalletModel'); // Diperlukan untuk logic Wallet
const Transaction = require('../models/TransactionModel'); // Diperlukan untuk Wallet Log
const mongoose = require('mongoose');

// Biaya tetap untuk balasan surat (Digunakan di logic pemotongan koin di SuratController)
const LETTER_COST = 100; 

// Fungsi Helper (Placeholder): Diperlukan untuk logic Wallet/Refund/Log di masa depan
const updateWalletAndLog = async (userId, amount, type, description, referenceId = null) => {
    // FUNGSI INI AKAN DIIMPLEMENTASIKAN SAAT LOGIC WALLET DIKEMBANGKAN
    // Untuk saat ini, kita kembalikan placeholder
    return { success: true, balance: 'N/A' };
};

// --- CONTROLLER GETTERS ---

// @desc    Mendapatkan semua Surat Internal (Paid Waiting & Non-Paid)
// @route   GET /api/psikolog/letters-internal
// @access  Private (Psikolog/Admin)
const getAllInternalLetters = async (req, res) => {
    try {
        const letters = await Surat.find({
            // 1. Ambil surat yang is_published: false (surat internal)
            // (Semua surat tim ahli masuk di sini, baik paid_waiting atau internal)
            is_published: false,
            
            // 2. Status BUKAN 'paid_answered' atau 'refunded'
            status: { $nin: ['paid_answered', 'refunded'] }, 
            
            // 3. Status BUKAN 'is_deleted'
            is_deleted: { $ne: true } 
        })
        .sort({ is_paid: -1, sent_at: 1 })
        .select('-__v -updatedAt');

        res.status(200).json({
            message: 'Daftar surat internal berhasil dimuat dari database.',
            data: letters, // Kirim data nyata
        });

    } catch (error) {
        res.status(500).json({ message: 'Gagal memuat surat internal dari database.', error: error.message });
    }
};

// --- CONTROLLER BALAS SURAT ---

// @desc    Membalas surat berbayar oleh Psikolog
// @route   POST /api/psikolog/reply-letter/:suratId
// @access  Private (Psikolog Only)
const replyToPaidLetter = async (req, res) => {
    const { suratId } = req.params;
    const { reply_content } = req.body;
    const psikologId = req.user._id; 

    if (!reply_content || reply_content.length < 50) {
        return res.status(400).json({ message: 'Isi balasan minimal 50 karakter.' });
    }
    
    // 1. Otorisasi Role Admin (Sesuai Aturan: Admin tidak boleh membalas)
    if (req.user.role === 'admin') {
        return res.status(403).json({ message: 'Admin hanya dapat melihat log, tidak diizinkan membalas surat berbayar.' });
    }

    try {
        // 2. Cek status surat (Hanya yang paid_waiting yang bisa dibalas)
        const letter = await Surat.findById(suratId);
        if (!letter || letter.status !== 'paid_waiting') {
            return res.status(404).json({ message: 'Surat tidak ditemukan, sudah dibalas, atau statusnya tidak "menunggu balasan".' });
        }

        // 3. Update Surat dengan Balasan
        const updatedLetter = await Surat.findByIdAndUpdate(suratId, {
            psikolog_id: psikologId,
            reply_text: reply_content,
            status: 'paid_answered', // Ubah status menjadi selesai
            answered_at: new Date(),
        }, { new: true });

        // Cek apakah updatedLetter berhasil (termasuk judulnya)
        if (!updatedLetter) {
            return res.status(500).json({ message: 'Gagal memperbarui status surat.' });
        }

        res.status(200).json({
            message: `Balasan untuk surat "${updatedLetter.title}" berhasil dikirim.`, 
            surat: updatedLetter,
        });
        
        // 4. (Logika Koin): Hentikan timer 48 jam dan konfirmasi pemotongan koin di sini.

        res.status(200).json({
            message: `Balasan untuk Surat ID ${updatedLetter._id} berhasil dikirim. Status surat diubah menjadi Selesai.`,
            surat: updatedLetter,
        });

    } catch (error) {
        res.status(500).json({ message: 'Gagal memproses balasan.', error: error.message });
    }
};


module.exports = {
    replyToPaidLetter,
    getAllInternalLetters,
    // Di sini akan ada getAdminSummary (Nanti)
};