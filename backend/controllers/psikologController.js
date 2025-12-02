const User = require('../models/UserModel');
const Surat = require('../models/SuratModel'); 
const UserWallet = require('../models/WalletModel'); 
const Transaction = require('../models/TransactionModel'); 
const mongoose = require('mongoose');

// Biaya tetap untuk balasan surat (Digunakan di logic pemotongan koin di SuratController)
const LETTER_COST = 200; // Harga Baru: 200 koin

// Fungsi Helper (Diperlukan untuk logic Wallet/Refund/Log)
// NOTE: Fungsi ini harus tersedia jika tidak diimpor dari file lain.
const updateWalletAndLog = async (userId, amount, type, description, referenceId = null) => {
    // 1. Update Saldo Wallet
    const updatedWallet = await UserWallet.findOneAndUpdate(
        { user_id: userId },
        { $inc: { balance: amount } },
        { new: true, upsert: true }
    );

    // 2. Buat Log Transaksi
    await Transaction.create({
        user_id: userId,
        type: type,
        amount: amount,
        description: description,
        reference_id: referenceId,
    });
    
    return updatedWallet;
};

// Helper untuk mencatat aksi Admin (Diambil dari AdminController)
const logAdminAction = async (adminId, action, description, targetId = null) => {
    // Pastikan AdminLog Model diimpor
    await AdminLog.create({
        admin_id: adminId,
        action: action,
        description: description,
        target_id: targetId,
    });
};


// --- CONTROLLER GETTERS ---

// @desc    Mendapatkan semua Surat Internal (Paid Waiting & Non-Paid)
// @route   GET /api/psikolog/letters-internal
// @access  Private (Psikolog/Admin)
const getAllInternalLetters = async (req, res) => {
    try {
        // Query Mongoose NYATA untuk Dashboard Psikolog
        const letters = await Surat.find({
            is_published: false, // Hanya surat internal
            status: { $nin: ['paid_answered', 'refunded'] }, // Belum selesai
            is_deleted: { $ne: true } 
        })
        .sort({ is_paid: -1, sent_at: 1 }) // Paid dulu, lalu yang paling lama dikirim
        .select('-__v -updatedAt'); 

        res.status(200).json({
            message: 'Daftar surat internal berhasil dimuat dari database.',
            data: letters, 
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

    // 1. Validasi Input dan Role Admin
    if (!reply_content || reply_content.length < 50) {
        return res.status(400).json({ message: 'Isi balasan minimal 50 karakter.' });
    }
    
    if (req.user.role === 'admin') {
        return res.status(403).json({ message: 'Admin hanya dapat melihat log, tidak diizinkan membalas surat berbayar.' });
    }

    try {
        // 2. Cek status surat (Harus 'paid_waiting')
        const letter = await Surat.findById(suratId);
        
        if (!letter || !letter.is_paid || letter.status !== 'paid_waiting') {
            return res.status(404).json({ message: 'Surat tidak ditemukan, sudah dibalas, atau statusnya tidak "menunggu balasan berbayar".' });
        }

        // 3. Update Surat dengan Balasan
        const updatedLetter = await Surat.findByIdAndUpdate(suratId, {
            psikolog_id: psikologId,
            reply_text: reply_content,
            status: 'paid_answered', // Ubah status menjadi selesai
            answered_at: new Date(),
        }, { new: true });

        // Safety check setelah update
        if (!updatedLetter) {
             return res.status(500).json({ message: 'Gagal memperbarui status surat.' });
        }
        
        // 4. (Logika Koin): Hentikan timer 48 jam di sini.

        res.status(200).json({
            message: `Balasan untuk surat "${updatedLetter.title}" berhasil dikirim.`, 
            surat: updatedLetter,
        });

    } catch (error) {
        res.status(500).json({ message: 'Gagal memproses balasan.', error: error.message });
    }
};


// @desc    Memicu refund koin untuk surat yang batas waktunya habis
// @route   POST /api/psikolog/refund/:letterId
// @access  Private (Admin/Scheduler Only)
const refundLetterCoins = async (req, res) => {
    const { letterId } = req.params;
    const adminId = req.user._id; // Admin yang memicu aksi

    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Akses Ditolak. Hanya Admin yang dapat memicu refund.' });
    }
    if (!mongoose.Types.ObjectId.isValid(letterId)) {
        return res.status(400).json({ message: 'ID Surat tidak valid.' });
    }

    try {
        // 1. Ambil Surat dan cek status
        const letter = await Surat.findById(letterId);

        if (!letter) {
            return res.status(404).json({ message: 'Surat tidak ditemukan.' });
        }
        if (letter.status !== 'paid_waiting' || !letter.is_paid) {
            return res.status(400).json({ message: 'Surat sudah diproses/di-refund atau bukan surat berbayar.' });
        }
        
        const refundAmount = LETTER_COST; 
        const userIdToRefund = letter.user_id;

        // 2. Lakukan Transaksi Refund
        await updateWalletAndLog(
            userIdToRefund, 
            refundAmount, // Nilai positif untuk penambahan saldo
            'refund', 
            `Pengembalian koin karena surat ID ${letterId} tidak dibalas dalam 48 jam.`,
            letterId
        );
        
        // 3. Update Status Surat menjadi Refunded
        const updatedLetter = await Surat.findByIdAndUpdate(letterId, 
            { 
                status: 'refunded', 
                answered_at: new Date() // Catat waktu refund
            },
            { new: true }
        );

        // 4. Log Aksi Admin
        await logAdminAction(
            adminId,
            'REFUND_COIN',
            `Admin memproses refund ${refundAmount} koin untuk Surat ID: ${letterId}`,
            letterId
        );

        res.status(200).json({
            message: `Refund ${refundAmount} koin berhasil diproses untuk Surat ID ${updatedLetter._id}.`,
            letter: updatedLetter,
        });

    } catch (error) {
        res.status(500).json({ message: 'Gagal memproses refund.', error: error.message });
    }
};


module.exports = {
    replyToPaidLetter,
    getAllInternalLetters,
    refundLetterCoins, // Export fungsi refund
};