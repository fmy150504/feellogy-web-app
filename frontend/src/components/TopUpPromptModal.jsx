import React from 'react';
import { Link } from 'react-router-dom';

const TopUpPromptModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-2xl relative w-full max-w-sm text-center p-8">
                
                {/* Ikon Peringatan/Koin */}
                <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                
                <h3 className="text-xl font-bold text-red-600 mb-4">Saldo Koin Tidak Cukup</h3>
                
                <p className="text-gray-700 mb-6">
                    Anda perlu 100 koin untuk mengirim surat berbayar ini. Silakan Top Up terlebih dahulu.
                </p>

                {/* Tombol Aksi */}
                <div className="flex justify-center space-x-4">
                    <Link 
                        to="/buy-coins" 
                        onClick={onClose} // Tutup modal saat navigasi
                        className="px-6 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition font-semibold"
                    >
                        Top Up Sekarang
                    </Link>
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-100 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                    >
                        Nanti Saja
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TopUpPromptModal;