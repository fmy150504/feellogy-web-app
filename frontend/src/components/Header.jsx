// frontend/src/components/Header.jsx (Revisi Total)

import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext'; 
import useWalletBalance from '../pages/hooks/useWalletBalance'; // <-- IMPORT HOOK BARU
// Asumsi logo ada di frontend/src/assets/logo.png atau sejenisnya
import LogoImage from '../assets/logo.png'; 
// GANTILAH 'feellogy-logo.png' dengan nama file yang sesuai

const Header = () => {
    const { user, logout, isAuthenticated } = useContext(AuthContext);
    const { balance } = useWalletBalance(); // <-- PANGGIL HOOK SALDO
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
        window.location.reload(); 
    };
    
    const linkClasses = "text-sm font-medium text-[#4B0082] hover:text-purple-600 transition whitespace-nowrap"; 
    
    const cleanedRole = user ? user.role.toLowerCase().trim() : 'user';
    const dashboardUrl = (cleanedRole === 'admin') ? '/admin' : '/dashboard';

    return (
        <header className="py-6 px-4 sm:px-6 bg-white border-b border-gray-100">
            {/* Batasan Konten Tengah */}
            <div className="container mx-auto max-w-7xl flex justify-between items-center"> 
                
                {/* Logo Feellogy (GANTI DENGAN GAMBAR) */}
                <Link to="/" className="flex items-center mr-4 sm:mr-8">
                    {/* 

[Image of Feellogy logo icon and text in purple]
 */}
                    <img src={LogoImage} alt="Feellogy Logo" className="h-8" /> 
                </Link>

                {/* Navigasi Kanan */}
                <nav className="flex items-center space-x-4 sm:space-x-8 overflow-x-auto pb-1">
                    {/* Link Navigasi Utama */}
                    <Link to="/about" className={linkClasses}>Tentang Kami</Link>
                    <Link to="/surat" className={linkClasses}>Surat Anonim</Link>
                    <Link to="/audio" className={linkClasses}>Audio Diary</Link>
                    <Link to="/quiz" className={linkClasses}>Mind Quiz</Link>
                    
                    {isAuthenticated ? (
                        <>
                            {/* --- 1. Tombol Saldo/Top Up --- */}
                            <Link 
                                to="/buy-coins" 
                                className="flex items-center px-3 py-1 text-sm bg-purple-100 text-purple-700 font-bold rounded-full border border-purple-300 whitespace-nowrap hover:bg-purple-200 transition"
                            >
                                💰 {balance === null ? 'Loading...' : `${balance} Koin`}
                            </Link>

                            {/* --- 2. Tombol Dashboard --- */}
                            {(cleanedRole === 'psikolog' || cleanedRole === 'admin') && (
                                <Link 
                                    to={dashboardUrl}
                                    className="px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition shadow-sm whitespace-nowrap"
                                >
                                    Dashboard
                                </Link>
                            )}
                            
                            {/* --- 3. Tombol Logout --- */}
                            <button 
                                onClick={handleLogout}
                                className="px-5 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        // Tampilan jika belum login
                        <Link 
                            to="/login" 
                            className="px-5 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition shadow-sm whitespace-nowrap"
                        >
                            Masuk
                        </Link>
                    )}
                </nav>

            </div>
        </header>
    );
};

export default Header;