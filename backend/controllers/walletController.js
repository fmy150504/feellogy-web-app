// backend/controllers/walletController.js

const UserWallet = require('../models/WalletModel');
const Transaction = require('../models/TransactionModel'); // <-- IMPORT TRANSACTION MODEL
const mongoose = require('mongoose');

// --- Daftar Paket Koin (Sama dengan di Frontend) ---
const COIN_PACKAGES = {
    '100': { coins: 100, price: 10000, label: "Rp10.000" },
    '275': { coins: 275, price: 25000, label: "Rp25.000" },
    '600': { coins: 600, price: 50000, label: "Rp50.000 (Hemat)" },
    '1000': { coins: 1000, price: 70000, label: "Rp70.000 (Best Deal)" },
};
// ----------------------------------------------------


// @desc    Mendapatkan saldo koin pengguna
// @route   GET /api/wallet/balance
// @access  Private (Requires JWT)
const getWalletBalance = async (req, res) => {
    const userId = req.user._id; 
    try {
        const wallet = await UserWallet.findOne({ user_id: userId });
        if (!wallet) {
            return res.status(200).json({ balance: 0, message: "Wallet belum diinisialisasi." });
        }
        res.status(200).json({ 
            balance: wallet.balance, 
            message: "Saldo berhasil dimuat." 
        });
    } catch (error) {
        console.error("Error fetching wallet balance:", error.message);
        res.status(500).json({ message: "Gagal memuat saldo dompet." });
    }
};

// @desc    Memproses pembelian koin
// @route   POST /api/wallet/purchase
// @access  Private (Requires JWT)
const purchaseCoins = async (req, res) => {
    const userId = req.user._id;
    // package_id di sini harus berupa string '100', '275', dll.
    const { package_id } = req.body; 

    // 1. Validasi Paket
    const selectedPackage = COIN_PACKAGES[package_id];
    if (!selectedPackage) {
        return res.status(400).json({ message: 'ID paket tidak valid.' });
    }
    
    const coinsToAdd = selectedPackage.coins;

    try {
        // 2. Cari atau Buat Wallet dan Tambah Saldo ($inc)
        const updatedWallet = await UserWallet.findOneAndUpdate(
            { user_id: userId },
            { $inc: { balance: coinsToAdd } }, 
            { new: true, upsert: true }
        );

        // 3. Catat Transaksi Pembelian (Penting untuk Log)
        await Transaction.create({
            user_id: userId,
            type: 'purchase', // Tipe transaksi: pembelian
            amount: coinsToAdd, 
            description: `Pembelian ${coinsToAdd} koin sukses (${selectedPackage.label})`,
            status: 'completed',
        });
        
        // 4. Kirim Respons Sukses
        res.status(200).json({
            message: `Pembelian ${coinsToAdd} koin berhasil! Saldo Anda saat ini: ${updatedWallet.balance} Koin.`,
            new_balance: updatedWallet.balance,
        });

    } catch (error) {
        console.error("Error processing coin purchase:", error.message);
        res.status(500).json({ message: 'Gagal memproses pembelian koin.' });
    }
};


module.exports = {
    getWalletBalance,
    purchaseCoins, 
};