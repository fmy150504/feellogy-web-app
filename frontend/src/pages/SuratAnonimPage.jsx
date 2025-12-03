import React, { useState, useEffect, useContext } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SuratModal from '../components/SuratModal'; 
import AuthContext from '../context/AuthContext'; 
import LoginPromptModal from '../components/LoginPromptModal'; // Diperlukan untuk login gate

const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${BASE_URL}/surat`;
const LIMIT = 4; // Batas surat per halaman

// --- Komponen Kartu Surat (Daftar) ---
// Note: Komponen ini harus diperbarui agar mengambil supports array dari backend
const NewSuratCard = ({ surat, handleToggleSupport, isLiking, isAuthenticated, userId }) => {
    
    // Asumsi: Backend mengirim supports: array of User IDs
    const supportsArray = surat.supports || [];
    const isSupported = isAuthenticated && supportsArray.includes(userId); 
    const displayCount = supportsArray.length;
    
    const truncatedContent = surat.content.split(' ').slice(0, 50).join(' ') + (surat.content.split(' ').length > 50 ? '...' : '');

    return (
        <div className="bg-gray-100 p-4 rounded-xl shadow-md border border-gray-300 relative h-48 flex flex-col justify-between hover:shadow-lg transition">
            
            {/* Konten Surat */}
            <div className="text-gray-700 text-sm overflow-hidden flex-grow cursor-pointer">
                <h3 className="font-bold text-base mb-1 text-purple-700">{surat.title}</h3>
                <p className="line-clamp-3">{truncatedContent}</p>
            </div>
            
            {/* Tombol Dukungan di Kanan Bawah */}
            <div className="absolute right-3 bottom-3">
                <button
                    onClick={() => handleToggleSupport(surat._id)} 
                    // Styling: Ungu Solid jika sudah didukung (isSupported)
                    className={`flex items-center space-x-1 px-3 py-1 text-sm font-bold rounded-full shadow-lg transition 
                        ${isSupported ? 'bg-purple-700 text-white' : 'bg-purple-500 text-white hover:bg-purple-600'} 
                        disabled:opacity-50`}
                    disabled={isLiking}
                >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span>{displayCount} Dukungan</span>
                </button>
            </div>
        </div>
    );
};


// --- Komponen Kartu Pilihan Surat (Memunculkan Modal) ---
const ChoiceCard = ({ title, description, icon, type, onClick }) => (
    <div 
        onClick={() => onClick(type)}
        className="w-full p-8 bg-gray-100 rounded-xl shadow-xl border-2 border-gray-300 transition transform hover:shadow-2xl hover:scale-[1.02] cursor-pointer text-center"
    >
        <div className="flex justify-center mb-4">
            <div className="text-7xl text-purple-700">{icon}</div> 
        </div>
        <h3 className="text-2xl font-serif font-extrabold text-purple-700 mb-2">{title}</h3>
        <p className="text-base text-gray-700">{description}</p>
    </div>
);


// --- Halaman Utama Surat Anonim (Halaman Pilihan dan Daftar) ---
const SuratAnonimPage = () => {
    const [allSurat, setAllSurat] = useState([]); 
    const [isLoadingList, setIsLoadingList] = useState(true); 
    const [errorList, setErrorList] = useState(null);
    const [isLiking, setIsLiking] = useState(false);
    const [page, setPage] = useState(1); 

    // Auth & Modal States
    const { isAuthenticated, user } = useContext(AuthContext); 
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal Kirim Surat
    const [modalType, setModalType] = useState('anonim'); 
    const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false); // Modal Login Gate

    // --- LOGIC FETCH SURAT PUBLIK ---
    const fetchSurat = async () => {
        setIsLoadingList(true);
        setErrorList(null);
        try {
            const response = await fetch(`${API_URL}/published`); 
            if (!response.ok) {
                throw new Error('Gagal memuat daftar surat.');
            }
            const data = await response.json();
            
            // Sort berdasarkan supports.length (likes)
            const sortedSurat = data.data.sort((a, b) => {
                return (b.supports?.length || 0) - (a.supports?.length || 0);
            });

            setAllSurat(sortedSurat);
        } catch (err) {
            setErrorList(err.message);
        } finally {
            setIsLoadingList(false);
        }
    };
    
    // --- Logic Toggle Dukungan (Check Login) ---
    const handleToggleSupport = async (letterId) => {
        if (!isAuthenticated) {
            // 1. Jika belum login, tampilkan prompt login
            setIsLoginPromptOpen(true);
            return;
        }

        // 2. Jika sudah login, lanjutkan ke logic API
        setIsLiking(true);
        try {
            const token = user.token;
            // Gunakan endpoint support yang baru
            const response = await fetch(`${API_URL}/support/${letterId}`, { 
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();
            
            if (response.ok) {
                 fetchSurat(); // Refresh daftar untuk update hitungan
            } else {
                 alert(data.message || 'Gagal memberikan dukungan. Cek koneksi.');
            }
        } catch (error) {
            console.error('Error toggling support:', error);
        } finally {
            setIsLiking(false);
        }
    };
    
    useEffect(() => {
        fetchSurat(); 
        setPage(1); 
    }, []); 

    // Handler untuk membuka modal kirim surat
    const openModal = (type) => {
        setModalType(type);
        setIsModalOpen(true);
    };
    
    // Handler untuk menutup modal kirim surat
    const closeModal = () => {
        setIsModalOpen(false);
    };

    // --- Logika Pagination ---
    const startIndex = (page - 1) * LIMIT;
    const endIndex = page * LIMIT;
    const currentSuratPage = allSurat.slice(startIndex, endIndex);
    const totalPages = Math.ceil(allSurat.length / LIMIT);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-6 py-12 max-w-7xl">
                {/* Judul Halaman */}
                <h1 className="font-serif text-4xl font-extrabold text-[#450E50] mb-2 text-center">Surat Anonim</h1>
                <p className="text-lg text-[#450E50] font-sans mb-10 text-center">
                    Berbagi dan baca cerita tanpa nama karena<br />setiap perasaan butuh ruang untuk dimengerti
                </p>
                
                {/* --- 1. DAFTAR SURAT PUBLIK (Dipertahankan di ATAS) --- */}
                <section className="mb-16">
                    
                    {isLoadingList && <p className="text-center text-gray-500">Memuat surat...</p>}
                    {errorList && <p className="text-center text-red-500">Error: {errorList}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        
                        {!isLoadingList && currentSuratPage.length === 0 && allSurat.length === 0 && (
                            <p className="text-gray-500 italic md:col-span-2 text-center">Belum ada surat yang dipublikasikan.</p>
                        )}
                        {currentSuratPage.map((surat) => (
                            <NewSuratCard 
                                key={surat._id} 
                                surat={surat} 
                                handleToggleSupport={handleToggleSupport} // <-- Pass handler dukungan
                                isLiking={isLiking}
                                isAuthenticated={isAuthenticated}
                                userId={user?._id}
                            />
                        ))}
                    </div>
                    
                    {/* --- Kontrol Pagination --- */}
                    {allSurat.length > LIMIT && (
                        <div className="text-center mt-8 flex justify-center space-x-4">
                            
                            {/* Tombol Back */}
                            <button 
                                onClick={() => setPage(page => page - 1)}
                                disabled={page === 1}
                                className="px-6 py-2 border border-purple-500 text-purple-700 rounded-full hover:bg-purple-50 transition disabled:opacity-50 bg-white"
                            >
                                « Sebelumnya
                            </button>

                            {/* Tombol Next */}
                            <button 
                                onClick={() => setPage(page => page + 1)}
                                disabled={page >= totalPages}
                                className="px-6 py-2 border border-purple-500 text-purple-700 rounded-full hover:bg-purple-50 transition disabled:opacity-50 bg-white"
                            >
                                Selanjutnya »
                            </button>
                        </div>
                    )}
                </section>


                {/* ---------------------------------------------------- */}
                {/* --- 2. Kartu Pilihan (Memunculkan Modal) --- */}
                {/* ---------------------------------------------------- */}
                <section className="mt-16 pt-8 border-t border-gray-200">
                    <h2 className="text-4xl font-extrabold font-serif text-[#450E50] mb-2 text-center">Kirim Suratmu Disini</h2>
                    <p className="text-lg text-[#450E50] font-sans mb-10 text-center">
                        Pilih tipe layanan surat yang kamu butuhkan.
                    </p>
                    
                    <div className="flex flex-col md:flex-row justify-center space-y-6 md:space-y-0 md:space-x-8 max-w-5xl mx-auto">
                        
                        {/* Kartu 1: Surat Anonim (Gratis/Internal/Publik) */}
                        <ChoiceCard
                            title="Surat Anonim"
                            description="Berbagi cerita tanpa nama. Ruang aman untuk berbagi perasaan tanpa dinilai."
                            icon="📩" 
                            type="anonim" // Memilih opsi publik/internal gratis
                            onClick={openModal}
                        />

                        {/* Kartu 2: Surat Psikolog (Berbayar) */}
                        <ChoiceCard
                            title="Surat Psikolog"
                            description="Kirim ceritamu dan dapat jawaban dari psikolog. Pendampingan ringan untuk memahami emosimu."
                            icon="🧠" 
                            type="psikolog" // Memilih opsi berbayar
                            onClick={openModal}
                        />
                    </div>
                </section>
                
            </main>
            
            {/* Modal Kirim Surat */}
            <SuratModal 
                isOpen={isModalOpen} 
                onClose={closeModal} 
                formType={modalType} 
                fetchSurat={fetchSurat} 
            />

            {/* LOGIN PROMPT MODAL (Rendered di sini, logicnya di LoginPromptModal.jsx) */}
            <LoginPromptModal 
                isOpen={isLoginPromptOpen} 
                onClose={() => setIsLoginPromptOpen(false)} 
            />

            <Footer />
        </div>
    );
};

export default SuratAnonimPage;