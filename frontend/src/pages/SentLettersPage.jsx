import React, { useState, useEffect, useContext } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

const API_URL_SENT = `${import.meta.env.VITE_API_URL}/surat/sent`;

// --- Komponen Card Surat Terkirim ---
const SentLetterCard = ({ letter }) => {
    const isAnswered = letter.status === 'paid_answered';
    const isWaiting = letter.status === 'paid_waiting';
    const isInternal = letter.status === 'internal';

    // Menentukan status visual
    let statusClass, statusText;
    if (isAnswered) {
        statusClass = 'bg-green-100 text-green-700';
        statusText = 'Dibalas Psikolog';
    } else if (isWaiting) {
        statusClass = 'bg-yellow-100 text-yellow-700';
        statusText = 'Menunggu Balasan (48 Jam)';
    } else if (isInternal) {
        statusClass = 'bg-blue-100 text-blue-700';
        statusText = 'Tersimpan (Tim Ahli)';
    } else {
        statusClass = 'bg-gray-100 text-gray-500';
        statusText = 'Status Lain';
    }

    return (
        <div className="p-5 bg-white rounded-lg shadow border border-gray-200">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-purple-700">{letter.title}</h3>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusClass}`}>
                    {statusText}
                </span>
            </div>

            <p className="text-sm text-gray-600 mb-4">
                Dikirim: {new Date(letter.sent_at).toLocaleString()}
            </p>

            {/* Balasan Psikolog (Hanya Tampilkan Jika Sudah Dibalas) */}
            {isAnswered && letter.reply_text && (
                <div className="mt-4 p-4 bg-purple-50 border-l-4 border-purple-600 rounded-lg">
                    <h4 className="font-bold text-purple-700 mb-2">Balasan dari Psikolog:</h4>
                    <p className="text-gray-800 italic whitespace-pre-wrap">
                        {letter.reply_text}
                    </p>
                    <span className="text-xs text-gray-500 block mt-2">
                        Dibalas pada: {new Date(letter.answered_at).toLocaleString()}
                    </span>
                </div>
            )}
            
            {/* Isi Surat Asli */}
            <details className="mt-4 text-sm">
                <summary className="font-semibold text-gray-700 cursor-pointer hover:text-purple-600">
                    Lihat Isi Surat Asli Anda
                </summary>
                <p className="mt-2 p-3 bg-gray-50 rounded-md whitespace-pre-wrap text-gray-800">
                    {letter.content}
                </p>
            </details>
        </div>
    );
};


const SentLettersPage = () => {
    const { isAuthenticated, user } = useContext(AuthContext);
    const [letters, setLetters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSentLetters = async () => {
        if (!isAuthenticated || !user) return;

        setIsLoading(true);
        setError(null);
        try {
            const token = user.token;
            const response = await fetch(API_URL_SENT, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal memuat data surat.');
            }
            setLetters(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchSentLetters();
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">Silakan <Link to="/login" className="font-bold text-purple-600">Login</Link> untuk melihat surat terkirim.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-6 py-12 max-w-4xl">
                <h1 className="text-4xl font-extrabold text-purple-700 mb-8 text-center">Kotak Keluar Saya</h1>

                {isLoading ? (
                    <p className="text-center text-gray-600">Memuat surat terkirim...</p>
                ) : error ? (
                    <p className="text-center text-red-500">Error: {error}</p>
                ) : letters.length === 0 ? (
                    <p className="text-center text-gray-500 italic">Anda belum pernah mengirim surat apa pun.</p>
                ) : (
                    <div className="space-y-6">
                        {letters.map(letter => (
                            <SentLetterCard key={letter._id} letter={letter} />
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default SentLettersPage;