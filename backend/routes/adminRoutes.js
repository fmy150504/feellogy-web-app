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

// ... (route lain untuk manajemen surat, log, dll.)

module.exports = router;