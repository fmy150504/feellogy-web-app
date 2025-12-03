import React, { useState } from 'react'; // <-- Tambahkan useState
import { Link, useNavigate } from 'react-router-dom'; // <-- Tambahkan useNavigate
import Header from '../components/Header';
import Footer from '../components/Footer';

const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL_RANDOM = `${BASE_URL}/audio/random`;

// --- Komponen Kotak Fitur (Diperbarui dengan styling solid) ---
const FeatureBox = ({ title, description, icon, color, link }) => (
    // Styling solid, border putih tebal, alignment rata kiri
    <Link 
        to={link} 
        className={`p-6 rounded-xl shadow-lg transition transform hover:scale-[1.03] ${color} flex flex-col justify-start text-left h-full border-4 border-white`}
    >
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="font-semibold text-xl mb-1 text-white">{title}</h3>
        <p className="text-sm mt-1 text-white opacity-90">{description}</p>
    </Link>
);

const HomePage = () => {
    const navigate = useNavigate();
    const [isFetching, setIsFetching] = useState(false);
    
    // Warna Solid Feellogy
    const GreenSolid = "bg-[#AFC74F]"; 
    const PurpleSolid = "bg-[#A88AEE]";
    
    // Data Fitur (Hanya 3, Healing Prompt Dihapus)
    const featureData = [
        {
            title: "Surat Anonim",
            description: "Berbagi dan baca cerita tanpa nama karena setiap perasaan butuh ruang untuk dimengerti.",
            icon: "💌",
            color: GreenSolid,
            link: "/surat"
        },
        {
            title: "Audio Diary",
            description: "Dengarkan kisah-kisah dan obrolan seputar kesehatan mental untuk menemani healingmu.",
            icon: "🎧",
            color: PurpleSolid,
            link: "/audio"
        },
        {
            title: "Mind Quiz",
            description: "Kuis reflektif untuk mengenali suasana hati dan memahami apa yang kamu rasakan.",
            icon: "🧠",
            color: GreenSolid,
            link: "/quiz"
        },
    ];


    // Fungsionalitas Tombol "Mulai Mendengar"
    const handleStartListening = async () => {
        setIsFetching(true);
        try {
            const response = await fetch(API_URL_RANDOM);
            const data = await response.json();
            
            if (response.ok && data.data) {
                // Simpan episode acak di localStorage
                localStorage.setItem('randomEpisode', JSON.stringify(data.data));
            } 
            // Navigasi ke halaman Audio Diary (Walaupun fetch gagal, agar user bisa melihat daftar)
            navigate('/audio'); 

        } catch (err) {
            alert('Gagal memuat episode acak. Pastikan Backend berjalan!');
            navigate('/audio');
        } finally {
            setIsFetching(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            
            <main className="flex-grow py-12">
                
                {/* Hero Section */}
                <section className="text-center mb-20 pt-16 container mx-auto max-w-4xl px-6">
                    <h1 className="text-6xl font-serif font-extrabold text-[#450E50] mb-4">
                        The Science of Feelings<br />The Art of Healing
                    </h1>
                    <p className="font-sans text-xl text-gray-500 max-w-2xl mx-auto mb-8">
                        Feellogy adalah media reflektif yang berfokus pada isu kesehatan mental. Kami menghadirkan ruang aman untuk berbagi, memahami diri, dan tumbuh bersama.
                    </p>
                    
                    {/* Tombol Mulai Mendengar (Play Random Audio) */}
                    <button 
                        onClick={handleStartListening} // <-- Fungsionalitas Tombol
                        className="px-8 py-3 bg-[#A88AEE] text-white font-bold rounded-full hover:bg-purple-400 transition shadow-md disabled:opacity-50"
                        disabled={isFetching}
                    >
                        {isFetching ? 'Memuat...' : 'Mulai Mendengar'}
                    </button>
                </section>
                
                {/* Fitur Utama (Grid 3 Kolom) */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 container mx-auto max-w-7xl px-6">
                    {featureData.map((feature, index) => (
                        <FeatureBox key={index} {...feature} />
                    ))}
                </section>
                
                {/* Komunitas (Background Dihapus) */}
                <section className="text-center mt-20 container mx-auto max-w-4xl">
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">
                        Bergabung dengan Feelmates
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">
                        Bergabung dengan WhatsApp Channel kami agar<br/>tidak terlewat pembaruan dari kami seputar Feellogy!
                    </p>
                    <a 
                        href="https://www.whatsapp.com/channel/0029Vb7HF5T90x2xLpmgud3z" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-8 py-3 bg-green-300 text-green-800 font-bold rounded-full hover:bg-green-400 transition shadow-md"
                    >
                        Gabung Sekarang
                    </a>
                </section>

            </main>

            <Footer />
        </div>
    );
};

export default HomePage;