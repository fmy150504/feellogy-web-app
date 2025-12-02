const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    // Nama samaran/username untuk komunitas
    username: {
        type: String,
        required: [true, 'Nama pengguna wajib diisi'],
        unique: true,
        trim: true,
        minlength: [3, 'Nama pengguna minimal 3 karakter']
    },
    email: {
        type: String,
        required: [true, 'Email wajib diisi'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+\@.+\..+/, 'Format email tidak valid'] 
    },
    password: {
        type: String,
        required: [true, 'Kata sandi wajib diisi'],
        minlength: [6, 'Kata sandi minimal 6 karakter'],
        select: false, // TIDAK AKAN MUNCUL SAAT QUERY DATABASE
    },
    role: {
        type: String,
        enum: ['user', 'psikolog', 'admin'], // Nilai yang mungkin
        default: 'user', // Default adalah pengguna biasa
    },
    is_suspended: {
        type: Boolean,
        default: false, // Flag jika user ditangguhkan aksesnya
    },
}, {
    timestamps: true
});

// --- ENKRIPSI PASSWORD SEBELUM DISIMPAN ---
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// --- Metode untuk Membandingkan Password Saat Login ---
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;