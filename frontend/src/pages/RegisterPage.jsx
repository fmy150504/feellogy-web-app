import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API_URL_REGISTER = `${import.meta.env.VITE_API_URL}/users/register`;

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        if (!username || !email || !password) {
            setError('Semua kolom wajib diisi.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(API_URL_REGISTER, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Register sukses: Simpan username/email (role default: user)
                localStorage.setItem('feellogyUsername', data.username);
                localStorage.setItem('feellogyUserRole', data.role); // Role default: user
                
                setSuccessMessage('Registrasi berhasil! Anda akan diarahkan ke halaman masuk.');
                
                // Mengarahkan ke halaman login setelah registrasi (sesuai permintaan)
                setTimeout(() => {
                    navigate('/login'); 
                }, 1500); 
            } else {
                setError(data.message || 'Registrasi gagal.');
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
                            Gabung dengan Feelmates
                        </h2>
                    </div>
                    
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
                        {successMessage && <div className="p-3 bg-green-100 text-green-700 rounded text-sm">{successMessage}</div>}

                        <input 
                            id="username" name="username" type="text" 
                            placeholder="Nama Panggilan/Username"
                            value={username} onChange={(e) => setUsername(e.target.value)}
                            className="appearance-none rounded relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white text-gray-800 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                            required
                        />
                        <input 
                            id="email" name="email" type="email" 
                            placeholder="Alamat Email"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            className="appearance-none rounded relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white text-gray-800 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                            required
                        />
                        <input 
                            id="password" name="password" type="password" 
                            placeholder="Kata Sandi (Min. 6 Karakter)"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none rounded relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white text-gray-800 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                            required
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400"
                        >
                            {isLoading ? 'Mendaftar...' : 'Daftar Sekarang'}
                        </button>
                    </form>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Sudah punya akun? <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500">Masuk di sini</Link>
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default RegisterPage;