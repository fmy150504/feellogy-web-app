// backend/controllers/suratController.js

const Surat = require('../models/SuratModel');
const mongoose = require('mongoose');
const UserWallet = require('../models/WalletModel'); // Diperlukan untuk cek saldo
const Transaction = require('../models/TransactionModel'); // Diperlukan untuk log transaksi

// Biaya tetap untuk balasan surat
const LETTER_COST = 200; // 200 koin

// Fungsi Helper untuk Update Saldo dan Log Transaksi (Diambil dari Psikolog Controller)
const updateWalletAndLog = async (userId, amount, type, description, referenceId = null) => {
    // 1. Update Saldo Wallet (menggunakan $inc: increment/decrement)
    const updatedWallet = await UserWallet.findOneAndUpdate(
        { user_id: userId },
        { $inc: { balance: amount } },
        { new: true, upsert: true } // Buat jika belum ada
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


// @desc    Membuat Surat Anonim Baru
// @route   POST /api/surat
// @access  Private (Harus diproteksi jika is_paid=true)
const createSurat = async (req, res) => {
    try {
        const { title, content, is_published, is_paid } = req.body;
        
        // Cek validasi dasar
        if (!title || !content) {
             return res.status(400).json({ message: 'Judul dan isi surat wajib diisi.' });
        }

        // --- Dapatkan User ID dari JWT ---
        // Karena route harus diproteksi (lihat suratRoutes.js), req.user._id tersedia
        const userId = req.user._id; 
        
        // 1. Tentukan Status Awal
        let initialStatus = 'internal'; 
        let publishFlag = is_published || false; 
        let paidFlag = is_paid || false; 

        // Logika Status: Prioritaskan Berbayar
        if (paidFlag) {
            
            // --- VALIDASI DAN PEMOTONGAN KOIN ---
            const wallet = await UserWallet.findOne({ user_id: userId });
            
            if (!wallet || wallet.balance < LETTER_COST) {
                 return res.status(402).json({ 
                     message: `Saldo koin tidak cukup. Perlu ${LETTER_COST} koin. Silakan Top Up.`,
                     required_coins: LETTER_COST,
                 });
            }
            // --- END VALIDASI KOIN ---

            initialStatus = 'paid_waiting'; 
            publishFlag = false; // Surat berbayar tidak bisa di-publish
            
        } else if (publishFlag) {
            initialStatus = 'public';
        }
        
        // 2. Buat Surat di Database
        const newSurat = await Surat.create({
            title,
            content,
            user_id: userId, // Simpan user ID yang terautentikasi
            is_published: publishFlag, 
            is_paid: paidFlag,
            status: initialStatus,
        });

        // 3. Potong Koin (HANYA JIKA PAID)
        if (paidFlag) {
            await updateWalletAndLog(
                userId, 
                -LETTER_COST, // Nilai negatif untuk pemotongan
                'use_letter', 
                `Penggunaan koin untuk Balasan Surat ID: ${newSurat._id}`, 
                newSurat._id
            );
        }

        // 4. Kirim Respons Sukses
        let statusMessage = initialStatus === 'paid_waiting' 
            ? `Surat berbayar Anda berhasil dikirim! ${LETTER_COST} koin telah terpotong. Mohon tunggu balasan.`
            : (initialStatus === 'public' ? 'Surat berhasil dipublikasikan.' : 'Surat Anda telah diteruskan ke Tim Ahli.');

        res.status(201).json({ 
            message: statusMessage,
            data: newSurat
        });

    } catch (error) {
        console.error('Error saat membuat surat:', error.message);
        res.status(500).json({ message: 'Gagal mengirim surat.', error: error.message });
    }
};

// @desc    Mendapatkan Surat-Surat yang Dipublikasikan
// @route   GET /api/surat/published
// @access  Public
const getPublishedSurat = async (req, res) => {
    try {
        const publishedSurat = await Surat.find({ is_published: true })
            .sort({ createdAt: -1 }) 
            .select('-__v -updatedAt'); 

        res.status(200).json({ 
            message: 'Daftar surat yang dipublikasikan', 
            count: publishedSurat.length,
            data: publishedSurat 
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil surat.', error: error.message });
    }
};

// @desc    Menambah Like pada Surat yang Dipublikasikan
// @route   POST /api/surat/like/:id
// @access  Public
const likeSurat = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ message: 'ID Surat tidak valid.' });
        }

        const updatedSurat = await Surat.findByIdAndUpdate(
            id,
            { $inc: { likes_count: 1 } }, 
            { new: true, runValidators: true }
        );

        if (!updatedSurat) {
            return res.status(404).json({ message: 'Surat tidak ditemukan.' });
        }

        res.status(200).json({ 
            message: 'Dukungan/Like berhasil ditambahkan!', 
            likes: updatedSurat.likes_count 
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menambah like.', error: error.message });
    }
};

// @desc    Mendapatkan semua surat yang dikirim oleh pengguna yang login
// @route   GET /api/surat/sent
// @access  Private
const getSentLetters = async (req, res) => {
    // Ambil ID pengguna dari JWT token (req.user._id disediakan oleh middleware 'protect')
    const userId = req.user._id;

    try {
        const sentLetters = await Surat.find({
            user_id: userId, // <-- Filter berdasarkan ID pengguna
            is_published: { $ne: true } // Hanya tampilkan surat internal/berbayar (yang tidak dipublikasikan)
        })
        .sort({ sent_at: -1 }) // Terbaru di atas
        .select('-__v'); 

        res.status(200).json({
            message: 'Daftar surat terkirim berhasil dimuat.',
            count: sentLetters.length,
            data: sentLetters,
        });

    } catch (error) {
        console.error("Error fetching sent letters:", error.message);
        res.status(500).json({ message: 'Gagal memuat surat terkirim.' });
    }
};

// @desc    Toggle dukungan (support/upvote) pada surat publik
// @route   POST /api/letters/support/:letterId
// @access  Private (Requires JWT)
const toggleSupportLetter = async (req, res) => {
    const { letterId } = req.params;
    const userId = req.user._id; // ID pengguna yang sedang login

    if (!mongoose.Types.ObjectId.isValid(letterId)) {
        return res.status(400).json({ message: 'ID Surat tidak valid.' });
    }

    try {
        const letter = await Surat.findById(letterId);

        if (!letter) {
            return res.status(404).json({ message: 'Surat tidak ditemukan.' });
        }
        if (!letter.is_published) {
            return res.status(403).json({ message: 'Tidak dapat memberikan dukungan pada surat internal.' });
        }

        const isSupported = letter.supports.includes(userId);

        if (isSupported) {
            // Jika sudah ada, hapus dukungan (unsupvote)
            letter.supports.pull(userId);
            await letter.save();
            return res.status(200).json({ 
                message: 'Dukungan berhasil dibatalkan.',
                supportsCount: letter.supports.length,
                action: 'unsupported'
            });
        } else {
            // Jika belum ada, tambahkan dukungan (support)
            letter.supports.push(userId);
            await letter.save();
            return res.status(200).json({ 
                message: 'Dukungan berhasil diberikan.',
                supportsCount: letter.supports.length,
                action: 'supported'
            });
        }

    } catch (error) {
        console.error('Error toggling support:', error);
        res.status(500).json({ message: 'Gagal memproses dukungan.', error: error.message });
    }
};

module.exports = {
    createSurat,
    getPublishedSurat,
    likeSurat,
    getSentLetters,
    toggleSupportLetter,
};