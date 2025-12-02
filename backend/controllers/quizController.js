const Quiz = require('../models/QuizModel');
const QuizResult = require('../models/QuizResultModel'); // Model tunggal untuk semua hasil kuis
const mongoose = require('mongoose'); 

// --- Konfigurasi Bobot Stres (Sesuai Aturan: Max 50 Poin) ---
const STRESS_THRESHOLDS = {
    RENDAH: 20,  
    SEDANG: 35, 
    TINGGI: 50
};

// Fungsi untuk menentukan level stres dan pesan utama (Kotak Skor)
const determineStressLevel = (score) => {
    let level = '';
    let message = '';
    
    if (score <= STRESS_THRESHOLDS.RENDAH) {
        level = 'Rendah';
        message = `Berdasarkan jawabanmu, kondisimu terlihat cukup stabil. Kamu mungkin masih menghadapi beberapa tantangan, tetapi sejauh ini kamu bisa mengelolanya dengan baik. Ini adalah hal yang patut diapresiasi.`;
    } else if (score <= STRESS_THRESHOLDS.SEDANG) {
        level = 'Sedang';
        message = `Jawabanmu menunjukkan bahwa kamu sedang berada di fase yang cukup sulit. Perasaan seperti ini valid dan wajar. Kamu mungkin merasa lelah atau sulit menemukan ruang untuk diri sendiri. Tetapi tenang saja, kamu tidak sendirian.`;
    } else {
        level = 'Tinggi';
        message = `Kondisimu menunjukkan bahwa kamu sedang berada dalam tekanan yang intens. Kamu mungkin merasa kewalahan, lelah, atau sendirian menghadapi semuanya.  Tidak apa-apa, kamu tidak harus kuat setiap saat.`;
    }

    return { level, message };
};

// --- FUNGSI GENERATOR HEALING PROMPT (Menyediakan Tips Motivasi) ---
const getHealingPrompt = (level) => {
    let tips_message = '';
    let title = '';
    let text = '';
    let recommendation = '';
    
    switch (level) {
        case 'Rendah':
            tips_message = "Luangkan waktu sejenak untuk melakukan hal-hal kecil yang membuatmu merasa bahagia. Kamu sedang berada di titik yang baik. Tetap rawat ritme ini!";
            title = "Kondisimu Terlihat Cukup Stabil";
            text = "Emosi Anda dalam kondisi yang baik. Ingatlah untuk tetap memberikan diri Anda waktu sejenak untuk bersyukur atas hal-hal kecil hari ini.";
            recommendation = "Coba jelajahi Audio Diary untuk inspirasi harian.";
            break;
        case 'Sedang':
            tips_message = "Beri dirimu waktu untuk berhenti sejenak dan mengevaluasi apa yang paling menguras energimu. Kamu tidak harus menyelesaikan semuanya sekarang karena satu langkah kecil pun tetap berarti.";
            title = "Kamu Berada di Fase yang Cukup Menantang";
            text = "Anda telah melalui banyak hal. Jangan biarkan stres menumpuk. Izinkan diri Anda beristirahat dan memproses emosi tanpa menghakimi.";
            recommendation = "Kami sarankan Anda mencoba menulis Surat Anonim untuk melepaskan beban pikiran.";
            break;
        case 'Tinggi':
            tips_message = "Berikan dirimu waktu untuk benar-benar beristirahat. Dengarkan kebutuhan tubuh dan pikiranmu hari ini. Berbicaralah dengan seseorang yang kamu percaya. Kamu tidak harus melalui semua ini sendirian.";
            title = "Kamu Mungkin Memikul Beban yang Cukup Berat";
            text = "Beban yang Anda rasakan terlihat berat. Penting untuk mencari dukungan sekarang. Ingat, meminta bantuan adalah kekuatan, bukan kelemahan.";
            recommendation = "Silakan cari bantuan profesional atau hubungi layanan darurat mental health.";
            break;
        default:
            tips_message = "Tutup mata sejenak dan tarik napas perlahan.";
            title = "Refleksi Default";
            text = "Terima kasih sudah mencoba kuis ini. Kami tidak dapat menentukan level stres Anda secara spesifik.";
            recommendation = "Coba ulangi kuis dengan lebih fokus.";
            break;
    }
    
    return { title, text, recommendation, tips_message }; 
};

// @desc    Mendapatkan semua pertanyaan kuis
// @route   GET /api/quiz/questions
// @access  Public
const getQuizQuestions = async (req, res) => {
    try {
        const questions = await Quiz.find().select('-__v'); 

        res.status(200).json({ 
            message: 'Daftar pertanyaan kuis berhasil dimuat', 
            count: questions.length,
            data: questions 
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memuat pertanyaan.', error: error.message });
    }
};

// @desc    Menyimpan hasil kuis dan mengembalikan level stres/healing prompt (ANONIM)
// @route   POST /api/quiz/submit
// @access  Public 
const submitQuiz = async (req, res) => {
    const { answers } = req.body;
    // User ID akan null karena ini adalah submission instan anonim
    const userId = null; 

    if (!answers || answers.length === 0) {
        return res.status(400).json({ message: 'Jawaban kuis wajib diisi.' });
    }

    const totalScore = answers.reduce((sum, answer) => sum + (answer.selected_score || 0), 0);
    const { level: stressLevel, message: levelMessage } = determineStressLevel(totalScore);

    try {
        // Simpan Hasil Instan/Anonim (Menggunakan QuizResultModel)
        const newResult = await QuizResult.create({
            user_id: userId, // NULL untuk anonim
            total_score: totalScore,
            stress_level: stressLevel,
            answers: answers, 
        });

        const healingPrompt = getHealingPrompt(stressLevel);

        res.status(201).json({ 
            message: 'Kuis berhasil diselesaikan.',
            total_score: totalScore,
            stress_level: stressLevel,
            level_message: levelMessage, 
            tips_message: healingPrompt.tips_message,
            healing_prompt: healingPrompt, 
            result_id: newResult._id,
        });

    } catch (error) {
        console.error("Error saat submit quiz (Anonim):", error);
        res.status(500).json({ message: 'Gagal memproses hasil kuis. (Cek Mongoose ID di backend).' });
    }
};


// @desc    Menyimpan hasil Mind Quiz ke Riwayat (BUTUH LOGIN)
// @route   POST /api/quiz/results
// @access  Private
const saveQuizResult = async (req, res) => {
    // req.user._id didapat dari middleware 'protect'
    const userId = req.user._id; 
    const { total_score, stress_level, answers = [] } = req.body; 

    if (total_score === undefined || stress_level === undefined) {
        return res.status(400).json({ message: 'Skor dan tingkat stres wajib diisi.' });
    }

    try {
        // Simpan hasil ke QuizResultModel (History)
        const newResult = await QuizResult.create({
            user_id: userId,
            total_score: total_score,
            stress_level: stress_level,
            answers: answers,
        });

        res.status(201).json({
            message: 'Hasil kuis berhasil disimpan ke riwayat!',
            data: newResult,
        });
    } catch (error) {
        console.error('Error saat menyimpan hasil kuis:', error.message);
        res.status(500).json({ message: 'Gagal menyimpan hasil kuis.', error: error.message });
    }
};

// @desc    Mendapatkan semua riwayat Mind Quiz pengguna yang login
// @route   GET /api/quiz/history
// @access  Private
const getQuizHistory = async (req, res) => {
    const userId = req.user._id;

    try {
        const history = await QuizResult.find({ user_id: userId })
            .sort({ createdAt: -1 }) 
            .select('-__v');

        res.status(200).json({
            message: 'Riwayat kuis berhasil dimuat.',
            count: history.length,
            data: history,
        });
    } catch (error) {
        console.error('Error saat memuat riwayat kuis:', error.message);
        res.status(500).json({ message: 'Gagal memuat riwayat kuis.' });
    }
};


// @desc    Mendapatkan hasil kuis detail berdasarkan ID (Memerlukan Login)
// @route   GET /api/quiz/result/:id
// @access  Private
const getResultById = async (req, res) => {
    if (!req.user || req.user.role === 'user') {
        return res.status(403).json({ message: 'Akses Ditolak. Membutuhkan izin.' });
    }
    
    res.status(200).json({
        message: 'Akses hasil kuis detail berhasil!',
        resultId: req.params.id,
        user: req.user.username, 
        detail: 'Ini adalah hasil analisis mendalam yang hanya bisa dilihat oleh user yang login.'
    });
};

module.exports = {
    getQuizQuestions,
    submitQuiz,
    saveQuizResult, 
    getQuizHistory, 
    getResultById, 
};