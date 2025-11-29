const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/quiz/questions (Mendapatkan semua pertanyaan)
router.get('/questions', quizController.getQuizQuestions);

// POST /api/quiz/submit (Mengirim jawaban dan mendapatkan hasil/prompt)
router.post('/submit', quizController.submitQuiz);

// Route untuk melihat hasil detail (Hanya akan dibuat setelah Login/Auth siap)
router.get('/result/:id', protect, quizController.getResultById);

module.exports = router;