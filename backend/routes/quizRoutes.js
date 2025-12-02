const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');
const { saveQuizResult, getQuizHistory } = require('../controllers/quizController');

// GET /api/quiz/questions (Mendapatkan semua pertanyaan)
router.get('/questions', quizController.getQuizQuestions);

// POST /api/quiz/submit (Mengirim jawaban dan mendapatkan hasil/prompt)
router.post('/submit', quizController.submitQuiz);

// Route untuk melihat hasil detail (Hanya akan dibuat setelah Login/Auth siap)
router.get('/result/:id', protect, quizController.getResultById);

// POST /api/quiz/results - Menyimpan hasil kuis
router.post('/results', protect, saveQuizResult);

// GET /api/quiz/history - Mendapatkan riwayat kuis
router.get('/history', protect, getQuizHistory);

module.exports = router;