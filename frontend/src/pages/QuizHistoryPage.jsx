import React, { useState, useEffect, useContext } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthContext from '../context/AuthContext'; 
import { Link } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL_HISTORY = `${BASE_URL}/quiz/history`;

const QuizHistoryPage = () => {
    const { isAuthenticated, user } = useContext(AuthContext);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHistory = async () => {
        if (!isAuthenticated || !user?.token) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL_HISTORY, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal memuat riwayat kuis.');
            }
            setHistory(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchHistory();
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">Silakan <Link to="/login" className="font-bold text-purple-600">Login</Link> untuk melihat riwayat kuis Anda.</p>
            </div>
        );
    }
    
    // Tampilan Utama Riwayat Kuis
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-6 py-12 max-w-4xl">
                <h1 className="text-4xl font-extrabold text-purple-700 mb-8 text-center">Riwayat Mind Quiz Anda</h1>

                {isLoading ? (
                    <p className="text-center text-gray-600">Memuat riwayat...</p>
                ) : error ? (
                    <p className="text-center text-red-500">Error: {error}</p>
                ) : history.length === 0 ? (
                    <p className="text-center text-gray-500 italic">Anda belum pernah menyimpan hasil kuis.</p>
                ) : (
                    <div className="space-y-4">
                        {history.map((result) => (
                            <div key={result._id} className="p-4 bg-white rounded-lg shadow flex justify-between items-center border-l-4 border-purple-500">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        Hasil Tes: {result.stress_level}
                                    </h3>
                                    <p className="text-sm text-gray-600">Skor Total: {result.total_score}</p>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {new Date(result.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default QuizHistoryPage;