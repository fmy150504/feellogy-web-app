const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const dotenv = require('dotenv');

dotenv.config({ path: '../../.env' }); // Pastikan path .env benar

const protect = async (req, res, next) => {
    let token;

    // 1. Cek token di Header (Bearer Token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Ambil token dari header (format: "Bearer [token]")
            token = req.headers.authorization.split(' ')[1];

            // 2. Verifikasi token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Ambil user dari database (tanpa password)
            req.user = await User.findById(decoded.id).select('-password');

            // Lanjut ke controller
            next();

        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Token tidak valid, akses ditolak.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Tidak ada token, akses ditolak.' });
    }
};

module.exports = { protect };