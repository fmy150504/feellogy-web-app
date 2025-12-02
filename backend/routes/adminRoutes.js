const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware'); // Hanya Admin

// Import Controller
const adminController = require('../controllers/adminController'); 

// Semua route di file ini dilindungi oleh protect dan isAdmin
router.use(protect, isAdmin); 

// POST /api/admin/users - Membuat akun baru (Psikolog/Admin)
router.post('/users', adminController.createNewUser);

// GET /api/admin/summary - Mendapatkan ringkasan CMS
router.get('/summary', adminController.getAdminSummary);

// POST /api/admin/letters/delete/:letterId - Soft Delete Surat
router.post('/letters/delete/:letterId', adminController.softDeleteLetter);

// GET /api/admin/letters/all - Mendapatkan SEMUA surat untuk CMS
router.get('/letters/all', adminController.getAllLetters);

// GET /api/admin/users/all - Mendapatkan semua pengguna
router.get('/users/all', adminController.getAllUsers);

// PUT /api/admin/users/suspend/:userId - Suspend/Unsuspend user
router.put('/users/suspend/:userId', adminController.toggleUserSuspension);

// DELETE /api/admin/users/:userId - Hapus permanen
router.delete('/users/:userId', adminController.deleteUserPermanently);

module.exports = router;