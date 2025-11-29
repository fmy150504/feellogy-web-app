const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['purchase', 'use_letter', 'refund'], // Jenis transaksi
        required: true,
    },
    amount: {
        type: Number, // Jumlah koin yang bergerak (+ atau -)
        required: true,
    },
    status: {
        type: String,
        enum: ['completed', 'failed', 'pending'],
        default: 'completed',
    },
    reference_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false, // ID Surat atau ID Pembelian
    },
    description: {
        type: String, 
        required: false,
    },
}, {
    timestamps: true
});

const TransactionModel = mongoose.model('WalletTransaction', TransactionSchema);
module.exports = TransactionModel;