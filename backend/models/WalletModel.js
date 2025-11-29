const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Setiap user hanya punya 1 wallet
    },
    balance: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true
});

const WalletModel = mongoose.model('UserWallet', WalletSchema);
module.exports = WalletModel;