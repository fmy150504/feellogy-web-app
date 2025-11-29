// backend/models/AdminLogModel.js

const mongoose = require('mongoose');

const AdminLogSchema = new mongoose.Schema({
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {
        type: String,
        required: true, // Contoh: 'DELETE_SURAT', 'CREATE_USER', 'REFUND_COIN'
    },
    target_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false, // ID dokumen yang dimodifikasi/dihapus
    },
    description: {
        type: String, // Contoh: "Admin [AdminName] menghapus Surat ID: X"
        required: true,
    }
}, {
    timestamps: true
});

const AdminLogModel = mongoose.model('AdminLog', AdminLogSchema);
module.exports = AdminLogModel;