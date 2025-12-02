const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // Tambahkan require path untuk deployment

// Import Routes
const suratRoutes = require('./routes/suratRoutes');
const audioRoutes = require('./routes/audioRoutes');
const quizRoutes = require('./routes/quizRoutes');
const userRoutes = require('./routes/userRoutes');
const psikologRoutes = require('./routes/psikologRoutes');
const walletRoutes = require('./routes/walletRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Muat environment variables dari .env (Hanya untuk pengembangan lokal)
// Di Render, variabel ini akan diambil dari dashboard
dotenv.config({ path: path.resolve(__dirname, '..', '.env') }); 

// Inisialisasi Aplikasi Express
const app = express();

// --- Variabel Konfigurasi ---
// Gunakan process.env.PORT yang disediakan oleh hosting (misalnya Render)
const PORT = process.env.PORT || 8080; 
const MONGODB_URI = process.env.MONGODB_URI;

// --- Middleware Umum ---
app.use(express.json()); // Untuk memparsing JSON dari request body

// Konfigurasi CORS: Diaktifkan hanya untuk pengembangan lokal atau domain tertentu
// Di produksi, CORS umumnya tidak diperlukan jika Express menyajikan file frontend
app.use(cors({
    origin: (process.env.NODE_ENV === 'production' 
        ? false // Matikan CORS saat produksi jika Express melayani frontend
        : ['http://localhost:5173', 'https://dcd405eab62a.ngrok-free.app'] // Lokal
    ), 
    credentials: true
}));

// --- Integrasi Routes Utama (API) ---
app.use('/api/surat', suratRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/users', userRoutes);
app.use('/api/psikolog', psikologRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);

// **********************************************
// ********* LOGIKA FRONTEND UNTUK PRODUKSI *********
// **********************************************

// Route Sederhana (Test) - Ini hanya akan berfungsi jika tidak di lingkungan produksi, 
// atau jika request tidak cocok dengan API apapun.
// Jika di produksi, route catch-all di bawah akan menangkapnya.
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Selamat datang di API Feellogy!' });
});


// Jika berada di lingkungan produksi (saat deploy ke Render)
if (process.env.NODE_ENV === 'production') {
    // Path ke folder build frontend (dari backend, naik satu tingkat '..', lalu ke 'frontend/dist')
    const frontendPath = path.resolve(__dirname, '..', 'frontend', 'dist'); 

    // Middleware untuk menyajikan file statis dari folder build React
    app.use(express.static(frontendPath));

    // Tangani semua request GET yang tidak cocok dengan route API di atas (catch-all)
    // dan kirim index.html (untuk routing React, penting untuk refresh halaman)
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(frontendPath, 'index.html'));
    });
}

// --- Koneksi ke MongoDB dan Start Server ---
mongoose.connect(MONGODB_URI, { dbName: 'feellogy-database' })
    .then(() => {
        console.log('✅ Koneksi ke MongoDB berhasil!');

        // Start Server hanya jika koneksi database berhasil
        app.listen(PORT, () => {
            console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
            if (process.env.NODE_ENV === 'production') {
                console.log('Mode: Production - Melayani Frontend dari Express');
            } else {
                console.log('Mode: Development - Frontend dipisah');
            }
        });
    })
    .catch((error) => {
        console.error('❌ Koneksi ke MongoDB Gagal:', error.message);
        process.exit(1); // Keluar jika koneksi database gagal
    });