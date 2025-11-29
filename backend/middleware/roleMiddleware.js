// Middleware untuk memastikan user adalah Admin (Hanya Admin)
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); 
    } else {
        res.status(403).json({ message: 'Akses Ditolak. Membutuhkan peran Admin.' });
    }
};

// Middleware untuk memastikan user adalah Psikolog atau Admin (Viewer/Writer)
const isPsikologOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'psikolog' || req.user.role === 'admin')) {
        next(); 
    } else {
        res.status(403).json({ message: 'Akses Ditolak. Membutuhkan peran Psikolog atau Admin.' });
    }
};

module.exports = { isAdmin, isPsikologOrAdmin };