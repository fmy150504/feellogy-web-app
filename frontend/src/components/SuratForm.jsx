import React, { useState } from 'react';
import TopUpPromptModal from './TopUpPromptModal'; // <-- IMPORT MODAL PROMPT
import { useNavigate } from 'react-router-dom'; // Diperlukan untuk navigasi (walaupun di modal)

const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${BASE_URL}/surat`;

const SuratForm = ({ fetchSurat, isPaidDefault, isPublishedDefault, onClose }) => {
    // State form
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isPublished, setIsPublished] = useState(isPublishedDefault); 
    const [isPaid] = useState(isPaidDefault); 
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // STATE BARU: Untuk mengontrol modal Top Up
    const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false); 


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        // --- Cek Token untuk Surat Berbayar ---
        const token = localStorage.getItem('feellogyUserToken');
        
        if (isPaidDefault && !token) {
            setMessage('Gagal: Anda harus login untuk mengirim surat berbayar!');
            setIsLoading(false);
            return;
        }

        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        if (!title.trim() || !content.trim()) {
            setMessage('Judul dan isi surat tidak boleh kosong.');
            setIsLoading(false);
            return;
        }
        // --- END Cek Token ---

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: headers, 
                body: JSON.stringify({ 
                    title, 
                    content, 
                    is_published: isPublished,
                    is_paid: isPaid 
                }),
            });

            const data = await response.json();

            if (response.ok) {
                const statusMsg = data.message || (isPublished 
                    ? "Surat berhasil dipublikasikan." 
                    : "Surat Anda telah diteruskan ke tim ahli.");
                
                setMessage(statusMsg);
                setTitle('');
                setContent('');
                
                setTimeout(() => {
                    onClose(); 
                    if (isPublished) fetchSurat(); 
                }, 1500); 

            } else if (response.status === 402) { 
                // Deteksi Error 402: Saldo tidak cukup
                setIsTopUpModalOpen(true); // Tampilkan modal Top Up
                setMessage(data.message); // Tampilkan pesan saldo tidak cukup di form
                
            } else {
                setMessage('Gagal mengirim surat: ' + (data.message || 'Server error.'));
            }
        } catch (error) {
            setMessage('Terjadi kesalahan jaringan.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <>
            {/* Modal Top Up Prompt (Muncul saat Saldo Kurang) */}
            <TopUpPromptModal 
                isOpen={isTopUpModalOpen} 
                onClose={() => setIsTopUpModalOpen(false)} 
            />

            <div className="w-full max-w-2xl mx-auto"> 
                
                {message && (
                    // Styling khusus untuk error Saldo
                    <div className={`p-3 mb-4 rounded text-sm ${message.includes('Saldo koin tidak cukup') ? 'bg-red-200 text-red-800' : (message.includes('Gagal') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Input Judul dan Isi Surat */}
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-gray-700 font-medium mb-1">Judul Surat</label>
                        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-800" placeholder="Berikan judul singkat" disabled={isLoading} />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="content" className="block text-gray-700 font-medium mb-1">Isi Surat</label>
                        <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows="6" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 resize-none bg-white text-gray-800" placeholder="Tuliskan apa yang Anda rasakan..." disabled={isLoading} />
                    </div>
                    
                    {/* --- OPSI PUBLIKASI (KONDISIONAL: HANYA JIKA GRATIS) --- */}
                    {!isPaidDefault && (
                        <div className="mb-4 flex items-start">
                            <input
                                type="checkbox"
                                id="publish-option"
                                checked={isPublished}
                                onChange={(e) => setIsPublished(e.target.checked)}
                                className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500 bg-white"
                                disabled={isLoading}
                            />
                            <label htmlFor="publish-option" className="ml-3 text-sm text-gray-700">
                                Saya mengizinkan surat ini untuk <b>dipublikasikan</b> secara anonim (Gratis).
                                <span className="block text-xs text-gray-500 mt-1">Jika tidak dicentang, surat hanya ditujukan ke Tim Ahli (Gratis).</span>
                            </label>
                        </div>
                    )}


                    {/* INFORMASI TIPE SURAT (STATIS DALAM MODAL) */}
                    <div className="mb-6 p-3 bg-gray-100 rounded-lg border border-gray-200">
                        <p className="text-sm font-semibold">Tipe Surat Dipilih:</p>
                        <p className="text-base font-bold text-purple-700">
                            {isPaidDefault ? 
                                '💌 Balasan Psikolog (100 Koin)' : 
                                `📩 Surat Curhat Anonim`
                            }
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {isPaidDefault ? 
                                'Biaya akan dipotong dari saldo Anda. Balasan dalam 48 jam.' : 
                                'Gratis. Hasil dapat dilihat di daftar publik (tergantung pilihan di atas).'
                            }
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Mengirim...' : 'Kirim Surat'}
                    </button>
                </form>
            </div>
        </>
    );
};

export default SuratForm;