import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API_URL_LOGIN = `${import.meta.env.VITE_API_URL}/users/login`;

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!email || !password) {
            setError('Email dan kata sandi wajib diisi.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(API_URL_LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // 1. Simpan token, username, dan ROLE
                localStorage.setItem('feellogyUserToken', data.token); 
                localStorage.setItem('feellogyUsername', data.username);
                localStorage.setItem('feellogyUserRole', data.role); 
                
                // 2. Cek Redirect Path (Digunakan untuk kembali ke halaman Dukungan)
                const redirectPath = localStorage.getItem('redirectAfterLogin'); 
                
                if (redirectPath) {
                    localStorage.removeItem('redirectAfterLogin');
                    navigate(redirectPath); // Redirect ke halaman /surat
                } else {
                    navigate('/'); // Default ke homepage
                }
                
                // 3. Force reload untuk memicu AuthContext dan Header agar update
                window.location.reload(); 
            } else {
                setError(data.message || 'Login gagal. Cek kembali kredensial Anda.');
            }
        } catch (err) {
            setError('Terjadi kesalahan jaringan.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg border border-purple-100">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-purple-700">
                            Masuk ke Feellogy
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Belum punya akun? <Link to="/register" className="font-medium text-purple-600 hover:text-purple-500">Daftar di sini</Link>
                        </p>
                    </div>
                    
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

                        <input 
                            id="email" name="email" type="email" 
                            placeholder="Alamat Email"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            className="appearance-none rounded relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white text-gray-800 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                            required
                        />
                        <input 
                            id="password" name="password" type="password" 
                            placeholder="Kata Sandi"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none rounded relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white text-gray-800 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                            required
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400"
                        >
                            {isLoading ? 'Memuat...' : 'Masuk'}
                        </button>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default LoginPage;