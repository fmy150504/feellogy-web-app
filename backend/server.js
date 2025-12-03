const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // Diperlukan untuk deployment file statis

// --- Import Routes ---
const suratRoutes = require('./routes/suratRoutes');
const audioRoutes = require('./routes/audioRoutes');
const quizRoutes = require('./routes/quizRoutes');
const userRoutes = require('./routes/userRoutes');
const psikologRoutes = require('./routes/psikologRoutes');
const walletRoutes = require('./routes/walletRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Muat environment variables dari .env (Hanya untuk pengembangan lokal)
// Di Render, variabel ini akan diambil dari dashboard
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Inisialisasi Aplikasi Express
const app = express();

// --- Variabel Konfigurasi ---
const PORT = process.env.PORT || 8080; 
const MONGODB_URI = process.env.MONGODB_URI;

// --- Middleware Utama ---
app.use(express.json()); // Parsing JSON dari request body

// Konfigurasi CORS 
// Matikan CORS di produksi karena Express akan menyajikan frontend
app.use(cors({
    origin: (process.env.NODE_ENV === 'production' 
        ? false 
        : ['http://localhost:5173'] // Ganti dengan domain lokal Anda
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

// --- Route Sederhana (API Test) ---
app.get('/api', (req, res) => {
    res.status(200).json({ message: 'Selamat datang di API Feellogy!' });
});

if (process.env.NODE_ENV === 'production') {
    const frontendPath = path.resolve(__dirname, '..', 'frontend', 'dist');

    app.use(express.static(frontendPath));

    // Middleware universal: Tanpa path, tanpa asterisk
    app.use((req, res) => {
        if (req.method === 'GET') {
             res.sendFile(path.resolve(frontendPath, 'index.html'));
        } else {
             res.status(404).send('Not Found');
        }
    });
}

// --- Koneksi ke MongoDB dan Start Server ---
mongoose.connect(MONGODB_URI, { dbName: 'feellogy-database' })
    .then(() => {
        console.log('✅ Koneksi ke MongoDB berhasil!');

        // Start Server
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