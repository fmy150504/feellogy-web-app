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
            User.countDocuments({ role: 'user' }),
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

// @desc    Melakukan soft delete pada surat
// @route   POST /api/admin/letters/delete/:letterId
// @access  Private/Admin Only
const softDeleteLetter = async (req, res) => {
    const { letterId } = req.params;
    const adminId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(letterId)) {
        return res.status(400).json({ message: 'ID Surat tidak valid.' });
    }

    try {
        // 1. Lakukan Soft Delete
        const updatedLetter = await Surat.findByIdAndUpdate(
            letterId,
            { is_deleted: true },
            { new: true }
        );

        if (!updatedLetter) {
            return res.status(404).json({ message: 'Surat tidak ditemukan.' });
        }

        // 2. Log Aksi
        await logAdminAction(
            adminId,
            'SOFT_DELETE_SURAT',
            `Admin menghapus (soft delete) Surat ID: ${letterId} (${updatedLetter.title})`,
            letterId
        );

        res.status(200).json({
            message: `Surat "${updatedLetter.title}" berhasil di-soft delete.`,
            letter: updatedLetter,
        });

    } catch (error) {
        console.error('Error soft deleting letter:', error);
        res.status(500).json({ message: 'Gagal melakukan soft delete.' });
    }
};

// @desc    Mendapatkan SEMUA surat (termasuk public, internal, paid, dan soft deleted)
// @route   GET /api/admin/letters/all
// @access  Private/Admin Only
const getAllLetters = async (req, res) => {
    try {
        const allLetters = await Surat.find({}) // Query tanpa filter untuk mendapatkan SEMUA surat
            .sort({ createdAt: -1 }) // Terbaru di atas
            .select('-__v'); 

        res.status(200).json({
            message: 'Daftar semua surat berhasil dimuat.',
            data: allLetters,
        });
    } catch (error) {
        console.error('Error fetching all letters:', error);
        res.status(500).json({ message: 'Gagal memuat daftar semua surat.' });
    }
};

// @desc    Mendapatkan daftar SEMUA pengguna (untuk CMS)
// @route   GET /api/admin/users/all
// @access  Private/Admin Only
const getAllUsers = async (req, res) => {
    // 1. Ambil ID pengguna yang sedang login dari JWT
    const adminId = req.user._id; 

    try {
        // 2. Query Mongoose: Ambil semua user KECUALI user dengan ID adminId
        const users = await User.find({ _id: { $ne: adminId } }) // <-- FILTER BARU
            .select('-password')
            .sort({ role: 1, username: 1 }); 
        
        res.status(200).json({
            message: 'Daftar semua pengguna berhasil dimuat.',
            data: users,
        });
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Gagal memuat daftar pengguna.' });
    }
};

// @desc    Mengubah status suspensi pengguna (Suspend/Unsuspend)
// @route   PUT /api/admin/users/suspend/:userId
// @access  Private/Admin Only
const toggleUserSuspension = async (req, res) => {
    const { userId } = req.params;
    const { status } = req.body; // status: true/false
    const adminId = req.user._id;

    try {
        const userToUpdate = await User.findById(userId);
        if (!userToUpdate) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
        
        const action = status ? 'SUSPEND' : 'UNSUSPEND';

        // Lakukan update status
        userToUpdate.is_suspended = status;
        await userToUpdate.save();

        // Log Aksi
        await logAdminAction(
            adminId,
            `${action}_USER`,
            `Admin ${action.toLowerCase()} user: ${userToUpdate.username}`,
            userId
        );

        res.status(200).json({
            message: `User ${userToUpdate.username} berhasil di${action.toLowerCase()}kan.`,
            user: userToUpdate,
        });
    } catch (error) {
        console.error('Error toggling suspension:', error);
        res.status(500).json({ message: 'Gagal mengubah status pengguna.' });
    }
};

// @desc    Menghapus akun pengguna secara permanen (Hapus Permanen)
// @route   DELETE /api/admin/users/:userId
// @access  Private/Admin Only
const deleteUserPermanently = async (req, res) => {
    const { userId } = req.params;
    const adminId = req.user._id;

    try {
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });

        // Log Aksi
        await logAdminAction(
            adminId,
            'DELETE_USER_PERMANENT',
            `Admin menghapus akun permanen: ${deletedUser.username} (${deletedUser.role})`,
            userId
        );
        
        // CATATAN: Dalam implementasi nyata, Anda juga harus menghapus/menghubungkan data terkait (wallet, surat, dll.)
        
        res.status(200).json({
            message: `Akun ${deletedUser.username} berhasil dihapus permanen.`,
        });

    } catch (error) {
        console.error('Error deleting user permanently:', error);
        res.status(500).json({ message: 'Gagal menghapus akun pengguna.' });
    }
};

module.exports = {
    createNewUser,
    getAdminSummary,
    softDeleteLetter,
    getAllLetters,
    logAdminAction,
    getAllUsers,
    toggleUserSuspension,
    deleteUserPermanently,
};