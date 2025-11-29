const express = require('express');
const router = express.Router();
const audioController = require('../controllers/audioController'); 

// GET /api/audio/random (Untuk Homepage)
router.get('/random', audioController.getRandomEpisode);

// GET /api/audio (Mendapatkan semua daftar episode)
router.get('/', audioController.getAllEpisodes);


module.exports = router;