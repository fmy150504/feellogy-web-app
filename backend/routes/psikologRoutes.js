// backend/routes/psikologRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isPsikologOrAdmin } = require('../middleware/roleMiddleware');

// Import Controller yang sudah diimplementasikan dengan logic nyata
const psikologController = require('../controllers/psikologController'); 


// 1. ENDPOINT: GET /api/psikolog/letters-internal (Wadah curhat tim ahli)
// Mengambil semua surat yang membutuhkan tindakan (paid_waiting atau internal)
router.get('/letters-internal', protect, isPsikologOrAdmin, psikologController.getAllInternalLetters);


// 2. ENDPOINT: POST /api/psikolog/reply-letter/:suratId (Balas Surat Berbayar)
// Hanya Psikolog yang bisa membalas (Logic Admin check ada di Controller)
router.post('/reply-letter/:suratId', protect, isPsikologOrAdmin, psikologController.replyToPaidLetter);


// 3. (Opsional, Getter Admin - Akan Diimplementasikan di Controller Admin)
// router.get('/admin/summary', protect, isAdmin, psikologController.getAdminSummary);


module.exports = router;