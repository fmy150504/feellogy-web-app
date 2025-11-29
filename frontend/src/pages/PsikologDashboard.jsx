import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthContext from '../context/AuthContext'; 
import ReplyForm from '../components/ReplyForm'; 

const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL_INTERNAL_LETTERS = `${BASE_URL}/psikolog/letters-internal`; 

const PsikologDashboard = () => {
    const { user, isAuthenticated } = useContext(AuthContext); 
    const navigate = useNavigate();
    
    const userRole = user ? user.role.toLowerCase().trim() : 'guest'; 
    const isPsikologOnly = userRole === 'psikolog';

    const [suratInternal, setSuratInternal] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAllInternal, setShowAllInternal] = useState(false); 
    const [activeReplyId, setActiveReplyId] = useState(null);
    // STATE BARU untuk Notifikasi Sukses
    const [successMessage, setSuccessMessage] = useState(null); 

    // Fungsi untuk mengambil semua surat yang ditujukan untuk Tim Ahli
    const fetchInternalLetters = async () => {
        if (!user || !isAuthenticated) return;
        
        setIsLoading(true);
        setError(null);

        try {
            const token = user.token;
            const response = await fetch(API_URL_INTERNAL_LETTERS, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Gagal memuat daftar surat internal.');
            }
            
            setSuratInternal(data.data || []);
            
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Handler yang dipanggil dari ReplyForm setelah sukses
    const handleReplySuccess = (message) => {
        setSuccessMessage(message); 
        fetchInternalLetters(); // Refresh data
    };
    
    // Efek untuk navigasi Admin/Guest dan fetch data
    useEffect(() => {
        if (!isAuthenticated) return;

        // LOGIKA PENGALIHAN ADMIN
        if (userRole === 'admin') {
            navigate('/admin'); 
            return;
        }

        if (isPsikologOnly) {
             fetchInternalLetters();
        }
    }, [isAuthenticated, userRole, navigate]); 


    // --- Pemfilteran Data di Frontend ---
    const paidWaitingLetters = suratInternal.filter(s => s.status === 'paid_waiting');
    const nonPaidInternalLetters = suratInternal.filter(s => s.status === 'internal');
    const paidWaitingCount = paidWaitingLetters.length; 
    
    const listToDisplay = showAllInternal ? nonPaidInternalLetters : nonPaidInternalLetters.slice(0, 5); 


    // Tampilan jika tidak memiliki akses atau belum login
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">Silakan <Link to="/login" className="font-bold text-purple-600">Login</Link> untuk mengakses Dashboard.</p>
            </div>
        );
    }
    
    if (!isPsikologOnly) { 
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">Anda tidak memiliki izin (bukan Psikolog) untuk mengakses halaman ini.</p>
            </div>
        );
    }
    if (userRole === 'admin') return null; 


    // Tampilan Dashboard Psikolog (Jika isPsikologOnly = true)
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-6 py-12 max-w-6xl">
                
                <h1 className="text-4xl font-extrabold text-purple-700 mb-8">Dashboard Psikolog</h1>

                {/* --- NOTIFIKASI SUKSES --- */}
                {successMessage && (
                    <div className="bg-green-100 border border-green-300 text-green-800 p-4 rounded-lg mb-6 flex justify-between items-center">
                        <p className="font-semibold">{successMessage}</p>
                        <button onClick={() => setSuccessMessage(null)} className="bg-white text-green-700 hover:text-green-900 font-bold ml-4">
                            &times;
                        </button>
                    </div>
                )}
                
                {/* --- 1. SURAT BERBAYAR (HARUS DIRESPON) --- */}
                <section className="mb-10 p-6 rounded-lg border-2 border-red-200 bg-red-50">
                    <h2 className="text-2xl font-bold text-red-700 mb-4">Surat Berbayar Menunggu Balasan ({paidWaitingLetters.length})</h2>
                    
                    {/* Warning Box 48 Jam */}
                    {paidWaitingCount > 0 && (
                        <div className="bg-yellow-100 p-3 rounded mb-4 text-sm text-yellow-800">
                            PENTING: Terdapat <span className="font-bold">{paidWaitingCount} surat berbayar</span> menunggu balasan. Batas waktu <span className="font-bold">48 jam</span> atau koin dikembalikan!
                        </div>
                    )}
                    
                    {error && <p className="text-red-500 mb-4">Error Memuat Data: {error}</p>}
                    
                    {/* Daftar Surat Berbayar */}
                    {isLoading ? (
                        <p>Memuat surat berbayar...</p>
                    ) : (
                        <div className="space-y-4">
                            {paidWaitingLetters.length === 0 ? (
                                <p className="text-gray-500 italic">Tidak ada surat berbayar yang menunggu balasan saat ini. Semuanya sudah aman.</p>
                            ) : (
                                paidWaitingLetters.map(surat => (
                                    <div key={surat._id} className="p-4 border rounded-lg bg-white hover:shadow-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{surat.title}</h3>
                                                <p className="text-sm text-gray-600 mb-2 max-w-lg overflow-hidden whitespace-nowrap text-overflow-ellipsis">{surat.content.substring(0, 100)}...</p>
                                                <span className="text-xs text-gray-500">Dikirim: {new Date(surat.sent_at).toLocaleString()}</span>
                                            </div>
                                            
                                            {/* LOGIKA TOMBOL BALAS / TUTUP FORM */}
                                            {activeReplyId === surat._id ? (
                                                <button 
                                                    type="button" 
                                                    onClick={() => setActiveReplyId(null)}
                                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                                                >
                                                    Tutup Form
                                                </button>
                                            ) : (
                                                <button 
                                                    type="button" 
                                                    onClick={() => setActiveReplyId(surat._id)}
                                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                                                >
                                                    Balas Sekarang
                                                </button>
                                            )}
                                        </div>
                                        
                                        {/* Tampilkan Form Balasan jika ID cocok */}
                                        {activeReplyId === surat._id && (
                                            <ReplyForm 
                                                suratId={surat._id} 
                                                onSuccess={handleReplySuccess} // Kirim pesan sukses ke parent
                                                userToken={user.token} 
                                                onCancel={() => setActiveReplyId(null)} 
                                            />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </section>


                {/* --- 2. SURAT INTERNAL (NON-BERBAYAR, UNTUK DILIHAT) --- */}
                <section className="mt-10 p-6 rounded-lg border-2 border-blue-200 bg-blue-50">
                    <h2 className="text-2xl font-bold text-blue-700 mb-4">Wadah Curhat Tim Ahli (Non-Berbayar) ({nonPaidInternalLetters.length} Surat)</h2> 
                    
                    {/* Daftar Surat Non-Berbayar */}
                    <div className="space-y-4">
                        {nonPaidInternalLetters.length === 0 ? (
                            <p className="text-gray-500 italic">Tidak ada surat internal non-berbayar.</p>
                        ) : (
                            <>
                                {listToDisplay.map(surat => (
                                    <div key={surat._id} className="p-4 border rounded-lg bg-white flex justify-between items-center">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{surat.title}</h3>
                                            <p className="text-sm text-gray-600 truncate max-w-lg">{surat.content}</p>
                                            <span className="text-xs text-gray-500">Dikirim: {new Date(surat.sent_at).toLocaleString()}</span>
                                        </div>
                                        <span className="text-sm text-gray-500">Dibaca</span>
                                    </div>
                                ))}

                                {/* Tombol Tampilkan/Sembunyikan Lebih Banyak */}
                                {nonPaidInternalLetters.length > listToDisplay.length && (
                                    <div className="text-center pt-4">
                                        <button 
                                            onClick={() => setShowAllInternal(!showAllInternal)}
                                            className="text-sm text-purple-600 hover:underline"
                                        >
                                            {showAllInternal ? 'Sembunyikan' : `Lihat Semua (${nonPaidInternalLetters.length})`}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
};

export default PsikologDashboard;