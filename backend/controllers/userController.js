const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config({ path: '../../.env' }); // Pastikan path .env benar

// Fungsi untuk membuat JWT (JSON Web Token)
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// @desc    Register user baru
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    // Role default 'user' akan diterapkan oleh Mongoose Model
    const { username, email, password } = req.body; 

    try {
        // Cek apakah user sudah ada
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email sudah terdaftar.' });
        }

        // Cek apakah username sudah dipakai
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({ message: 'Nama pengguna (username) sudah digunakan.' });
        }

        // Buat user baru (Password otomatis di-hash oleh pre-save hook di model)
        const user = await User.create({
            username,
            email,
            password,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role, // <-- FIX: Sertakan role
                token: generateToken(user._id),
                message: 'Registrasi berhasil! Selamat datang di Feelmates.',
            });
        } else {
            res.status(400).json({ message: 'Data pengguna tidak valid.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Cari user berdasarkan email dan ambil field password
        const user = await User.findOne({ email }).select('+password');

        // Cek user dan bandingkan password
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role, // <-- FIX: Sertakan role
                token: generateToken(user._id), // Berikan Token JWT
                message: `Login berhasil! Selamat datang kembali, ${user.username}.`,
            });
        } else {
            res.status(401).json({ message: 'Email atau kata sandi salah.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
};