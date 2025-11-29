import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${BASE_URL}/audio`;

// --- Utility Function: Ekstraksi ID Video YouTube ---
const getYouTubeVideoId = (url) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
    return match ? match[1] : null;
};

// --- Komponen Full Audio Player ---
const FullAudioPlayer = ({ episode, onClose }) => {
    if (!episode) return null;

    const videoId = getYouTubeVideoId(episode.audio_url);
    const isYouTube = !!videoId;
    
    // URL Embed YouTube dengan parameter autoplay, kontrol, dan menghilangkan info video
    const embedUrl = isYouTube 
        ? `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&showinfo=0&rel=0`
        : episode.audio_url;

    return (
        <div className="max-w-4xl mx-auto p-8 bg-gray-100 rounded-xl shadow-xl border-t-4 border-purple-600">
            
            {/* Bagian Atas: Detail Episode */}
            <div className="flex items-start space-x-6">
                
                {/* Ikon Podcast */}
                <div className="flex-shrink-0">
                    <svg className="w-16 h-16 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1z"></path></svg>
                </div>

                {/* Info Episode */}
                <div className="flex-grow">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{episode.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                        Durasi: {episode.duration} | Dengan: {episode.host || 'Tim Feellogy'}
                    </p>
                    <p className="text-base text-gray-700 mt-2">
                        {episode.description} 
                    </p>
                </div>
            </div>

            {/* Pemutar Audio/Video (Embed) */}
            <div className="mt-6">
                {isYouTube ? (
                    // 1. YouTube Embed (IFRAME)
                    <iframe 
                        className="w-full h-16 border-0 rounded-lg" 
                        src={embedUrl}
                        allow="autoplay; encrypted-media" 
                        allowFullScreen 
                        title={episode.title}
                        style={{minHeight: '64px'}}
                    ></iframe>
                ) : (
                    // 2. HTML5 Audio (Untuk file MP3 langsung)
                    <audio controls autoPlay src={embedUrl} className="w-full">
                        Browser Anda tidak mendukung elemen audio.
                    </audio>
                )}
            </div>
            
            {/* Tombol Tutup */}
            <div className="mt-4 text-right">
                <button 
                    onClick={onClose}
                    className="text-sm text-gray-500 hover:text-red-500"
                >
                    Tutup Player
                </button>
            </div>
        </div>
    );
};


// --- Komponen Daftar Episode Sederhana ---
const EpisodeListItem = ({ ep, onClick, isPlaying }) => (
    <div 
        key={ep._id} 
        className={`p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex justify-between items-center transition cursor-pointer ${isPlaying ? 'opacity-50' : 'hover:bg-gray-50'}`}
        onClick={() => onClick(ep)} 
    >
        <div>
            <h3 className="text-xl font-semibold text-gray-800">{ep.title}</h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ep.description}</p>
            <span className="text-xs text-purple-500 font-medium mt-1 block">Durasi: {ep.duration}</span>
        </div>
        
        <button 
            className={`px-4 py-2 text-white font-semibold rounded-full ml-4 ${isPlaying ? 'bg-gray-400 cursor-default' : 'bg-green-500 hover:bg-green-600'}`}
            disabled={isPlaying}
        >
            {isPlaying ? 'Memutar' : '▶️ Putar'}
        </button>
    </div>
);


// --- Halaman Utama Audio Diary ---
const AudioDiaryPage = () => {
    // Definisi State
    const [episodes, setEpisodes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentEpisode, setCurrentEpisode] = useState(null); 

    // Fungsi untuk mengambil semua episode
    const fetchEpisodes = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Gagal memuat episode podcast.');
            }
            setEpisodes(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Fungsi untuk memutar episode acak
    const playRandomEpisode = async () => {
        setCurrentEpisode(null); 
        try {
            const response = await fetch(`${API_URL}/random`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Gagal memuat episode acak.');
            }
            setCurrentEpisode(data.data); 
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            alert('Gagal memuat episode acak. Pastikan server berjalan dan ada episode di DB.');
        }
    };

    // --- Efek saat Komponen Dimuat ---
    useEffect(() => {
        fetchEpisodes();
        
        // --- Cek Local Storage untuk Episode Acak dari Homepage ---
        const storedEpisode = localStorage.getItem('randomEpisode');
        if (storedEpisode) {
            try {
                const episode = JSON.parse(storedEpisode);
                setCurrentEpisode(episode); // Set episode yang akan dimainkan
            } catch (e) {
                console.error("Error parsing stored episode:", e);
            } finally {
                localStorage.removeItem('randomEpisode'); // Hapus dari storage setelah digunakan
            }
        }
    }, []); 

    // Tentukan Judul Daftar Episode
    const listHeading = currentEpisode ? 'Episode Lainnya' : 'Episode Terbaru';

    // Tentukan margin atas untuk daftar episode
    const listMarginTop = currentEpisode ? 'mt-16' : 'mt-16'; 

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-6 py-12">
                
                {/* Bagian Judul Utama (Tetap Ditampilkan) */}
                <h1 className="text-4xl font-extrabold text-gray-800 mb-2 text-center">🎧 Audio Diary</h1>
                <p className="text-lg text-gray-500 mb-8 text-center max-w-3xl mx-auto">
                    Dengarkan percakapan hangat bersama psikolog tentang<br />kisah seputar penyembuhan mental di <b>Audio Diary</b>!
                </p>

                <div className="text-center mb-10">
                    <button 
                        onClick={playRandomEpisode}
                        className="px-6 py-3 bg-purple-500 text-white font-bold rounded-full hover:bg-purple-600 transition shadow-md"
                    >
                        Mulai Mendengarkan
                    </button>
                </div>
                
                {/* Conditional Full Player (Muncul di sini jika diputar) */}
                {currentEpisode && (
                    <div className="mb-10">
                        <FullAudioPlayer 
                            episode={currentEpisode} 
                            onClose={() => setCurrentEpisode(null)} 
                        />
                    </div>
                )}


                {/* Heading Daftar Episode (Konsisten) */}
                <h2 className={`text-3xl font-extrabold text-gray-800 ${listMarginTop} mb-6 text-center md:text-left`}>
                    {listHeading}
                </h2>
                
                {/* Daftar Episode */}
                <div className="max-w-4xl mx-auto">
                    {isLoading && <p className="text-center text-gray-500">Memuat episode...</p>}
                    {error && <p className="text-center text-red-500">Error: {error}</p>}

                    <div className="space-y-4">
                        {!isLoading && episodes.length === 0 && (
                            <p className="text-gray-500 italic text-center">Belum ada episode podcast yang tersedia.</p>
                        )}
                        
                        {episodes.map((ep) => (
                            <EpisodeListItem 
                                key={ep._id} 
                                ep={ep} 
                                onClick={setCurrentEpisode} 
                                isPlaying={currentEpisode && currentEpisode._id === ep._id}
                            />
                        ))}
                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
};

export default AudioDiaryPage;