import React from 'react';
import SuratForm from './SuratForm'; // <-- IMPORT SURATFORM YANG BARU DIBUAT

const SuratModal = ({ isOpen, onClose, formType, fetchSurat }) => {
    if (!isOpen) return null;

    // Tentukan nilai default form berdasarkan tipe yang dipilih
    const isPaidDefault = formType === 'psikolog';
    const isPublishedDefault = formType === 'anonim';
    
    const title = isPaidDefault ? "Kirim Surat Anonim ke Psikolog" : "Kirim Surat Anonim";
    const titleColor = isPaidDefault ? 'text-purple-700' : 'text-purple-700';

    return (
        // Wrapper Modal (Full Screen Overlay)
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            
            {/* Modal Card */}
            <div className="bg-white rounded-xl shadow-2xl relative w-full max-w-2xl max-h-full overflow-y-auto">
                
                {/* Header Modal */}
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                    <h2 className={`text-2xl font-bold ${titleColor}`}>{title}</h2>
                    <button 
                        onClick={onClose} 
                        // Mengurangi ukuran font dan menambahkan background/padding agar terlihat lebih kecil
                        className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-800 transition text-xl leading-none w-8 h-8 flex items-center justify-center" // <-- PERUBAHAN
                        aria-label="Tutup" // Tambahkan untuk aksesibilitas
                    >
                        &times;
                    </button>
                </div>

                {/* Konten Form */}
                <div className="p-6">
                    <SuratForm 
                        fetchSurat={fetchSurat} 
                        isPaidDefault={isPaidDefault} // Kirim flag ke form
                        isPublishedDefault={isPublishedDefault}
                        onClose={onClose} // Agar form bisa menutup modal
                    />
                </div>
            </div>
        </div>
    );
};

export default SuratModal;