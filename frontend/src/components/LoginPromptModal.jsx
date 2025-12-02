import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const LoginPromptModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    
    // Gunakan useLocation untuk menyimpan path saat ini (misalnya /surat)
    const location = useLocation();
    
    // Save the current path to local storage before navigating to login
    const handleLoginClick = () => {
        // Simpan path agar setelah login, user dikembalikan ke halaman surat
        localStorage.setItem('redirectAfterLogin', location.pathname); 
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-xl shadow-2xl relative w-full max-w-sm text-center p-8">
                
                <h3 className="text-xl font-bold text-purple-700 mb-3">Login Diperlukan</h3>
                
                <p className="text-gray-700 mb-6">
                    Anda harus masuk (login) untuk memberikan dukungan pada surat ini.
                </p>

                {/* Tombol Aksi */}
                <div className="flex justify-center space-x-4">
                    <Link 
                        to="/login" 
                        onClick={handleLoginClick} 
                        className="px-6 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition font-semibold"
                    >
                        Login Sekarang
                    </Link>
                    <button 
                        onClick={onClose}
                        className="bg-white px-6 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                    >
                        Nanti Saja
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPromptModal;