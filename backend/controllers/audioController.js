const Audio = require('../models/AudioModel');
const mongoose = require('mongoose');

// @desc    Mendapatkan semua episode podcast
// @route   GET /api/audio
// @access  Public
const getAllEpisodes = async (req, res) => {
    try {
        const episodes = await Audio.find()
            .sort({ releaseDate: -1 }) // Urutkan dari yang terbaru
            .select('-__v -updatedAt'); 

        res.status(200).json({ 
            message: 'Daftar episode Audio Diary berhasil dimuat', 
            count: episodes.length,
            data: episodes 
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memuat episode.', error: error.message });
    }
};

// @desc    Mendapatkan satu episode secara acak (Untuk tombol 'Mulai Mendengar')
// @route   GET /api/audio/random
// @access  Public
const getRandomEpisode = async (req, res) => {
    try {
        const count = await Audio.countDocuments();
        const random = Math.floor(Math.random() * count);
        
        // Ambil satu dokumen secara acak
        const episode = await Audio.findOne().skip(random); 

        if (!episode) {
            return res.status(404).json({ message: 'Belum ada episode yang tersedia.' });
        }

        res.status(200).json({ 
            message: 'Episode acak berhasil dimuat', 
            data: episode 
        });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memuat episode acak.', error: error.message });
    }
};

// Fungsi lain (misalnya, getEpisodeById, CreateEpisode - hanya untuk admin) akan ditambahkan nanti.

module.exports = {
    getAllEpisodes,
    getRandomEpisode,
};