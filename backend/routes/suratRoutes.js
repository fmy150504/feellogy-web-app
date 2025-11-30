const express = require('express');
const router = express.Router();
const suratController = require('../controllers/suratController');
const { protect } = require('../middleware/authMiddleware');

// Route untuk mengirim surat baru (Anonim)
// POST /api/surat
router.post('/', protect, suratController.createSurat);

// Route untuk mendapatkan semua surat yang diizinkan untuk dipublikasikan
// GET /api/surat/published
router.get('/published', suratController.getPublishedSurat);

// Route untuk menambah like pada surat (Contoh: menggunakan ID)
// POST /api/surat/like/:id
router.post('/like/:id', suratController.likeSurat);

// GET /api/surat/sent (Memerlukan Login)
router.get('/sent', protect, suratController.getSentLetters);

module.exports = router;