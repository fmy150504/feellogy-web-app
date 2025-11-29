const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const walletController = require('../controllers/walletController');

// GET /api/wallet/balance
router.get('/balance', protect, walletController.getWalletBalance);

// POST /api/wallet/purchase (Sekarang menggunakan logic nyata)
router.post('/purchase', protect, walletController.purchaseCoins);

module.exports = router;