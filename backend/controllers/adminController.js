const User = require('../models/UserModel');
const UserWallet = require('../models/WalletModel'); 
const AdminLog = require('../models/AdminLogModel'); 
const Surat = require('../models/SuratModel'); // <-- FIX: Diimpor
const mongoose = require('mongoose');

// Helper untuk mencatat aksi Admin (digunakan di semua fungsi Admin)
const logAdminAction = async (adminId, action, description, targetId = null) => {
    await AdminLog.create({
        admin_id: adminId,
        action: action,
        description: description,
        target_id: targetId,
    });
};

// @desc    Membuat akun pengguna baru (Admin, Psikolog, atau User)
// @route   POST /api/admin/users
// @access  Private/Admin Only
const createNewUser = async (req, res) => {
    const { username, email, password, role } = req.body;
    const adminId = req.user._id; 

    try {
        // 1. Validasi Input
        if (!username || !email || !password || !role) {
            return res.status(400).json({ message: 'Semua field wajib diisi.' });
        }

        // 2. Validasi Role
        const validRoles = ['user', 'psikolog', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Role tidak valid.' });
        }
        
        // 3. Cek Duplikasi
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ message: 'Email atau Username sudah terdaftar.' });
        }

        // 4. Buat User Baru
        const newUser = await User.create({
            username,
            email,
            password,
            role,
        });
        
        // 5. Log Aksi
        await logAdminAction(
            adminId, 
            'CREATE_USER', 
            `Admin membuat akun baru: ${role} - ${newUser.username}`, 
            newUser._id
        );
        
        // 6. Inisialisasi Wallet untuk semua user baru (Saldo 0)
        await UserWallet.create({ user_id: newUser._id, balance: 0 });


        res.status(201).json({
            message: `Akun ${role} (${username}) berhasil dibuat dan Wallet diinisialisasi.`,
            user: { id: newUser._id, username: newUser.username, role: newUser.role }
        });

    } catch (error) {
        console.error('Error creating new user by admin:', error);
        res.status(500).json({ message: 'Gagal membuat akun baru.' });
    }
};

// @desc    Mendapatkan ringkasan statistik (CMS Summary)
// @route   GET /api/admin/summary
// @access  Private/Admin Only
const getAdminSummary = async (req, res) => {
    try {
        // Menggunakan Promise.all untuk mengambil data secara paralel (lebih cepat)
        const [
            totalUsers,
            totalPsikologs,
            totalLetters,
            lettersWaiting,
            latestLogs
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'psikolog' }),
            Surat.countDocuments(), // <-- Surat Model sekarang dikenali
            Surat.countDocuments({ status: 'paid_waiting' }), // <-- Surat Model sekarang dikenali
            AdminLog.find().sort({ createdAt: -1 }).limit(10), 
        ]);

        res.status(200).json({
            message: 'Ringkasan data berhasil dimuat.',
            data: {
                totalUsers,
                totalPsikologs,
                totalLetters,
                lettersWaiting,
                latestLogs,
            }
        });
    } catch (error) {
        // [CATCH ERROR]: Error di sini sekarang akan ditangkap
        console.error('Error fetching admin summary:', error); 
        res.status(500).json({ message: 'Gagal memuat ringkasan CMS.' });
    }
};


module.exports = {
    createNewUser,
    getAdminSummary,
    logAdminAction, 
};