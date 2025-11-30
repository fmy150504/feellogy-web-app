const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
// Import Routes di bagian awal bersama dependensi lain
const suratRoutes = require('./routes/suratRoutes');
const audioRoutes = require('./routes/audioRoutes');
const quizRoutes = require('./routes/quizRoutes');
const userRoutes = require('./routes/userRoutes');
const psikologRoutes = require('./routes/psikologRoutes');
const walletRoutes = require('./routes/walletRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Muat environment variables dari .env
dotenv.config({ path: '../.env' }); 

// Inisialisasi Aplikasi Express
const app = express();

// --- Middleware ---
app.use(express.json()); // Untuk memparsing JSON dari request body
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://dcd405eab62a.ngrok-free.app'
    ], // Izinkan akses dari frontend Vite default port
    credentials: true
}));

// --- Variabel Konfigurasi ---
const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;

// --- Integrasi Routes Utama ---
app.use('/api/surat', suratRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/users', userRoutes);
app.use('/api/psikolog', psikologRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);

// --- Route Sederhana (Test) ---
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Selamat datang di API Feellogy!' });
});

// --- Koneksi ke MongoDB dan Start Server ---
mongoose.connect(MONGODB_URI, { dbName: 'feellogy-database' })
    .then(() => {
        console.log('✅ Koneksi ke MongoDB berhasil!');

        // Start Server hanya jika koneksi database berhasil
        app.listen(PORT, () => {
            console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Koneksi ke MongoDB Gagal:', error.message);
        process.exit(1); // Keluar jika koneksi database gagal
    });