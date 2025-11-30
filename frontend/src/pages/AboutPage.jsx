import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LogoImage from '../assets/logo-feellogy.png'; 

const AboutPage = () => {
    // Warna Primer Teks Ungu di Mockup
    const PURPLE_TEXT = 'text-[#7C5892]'; 
    const PURPLE_EMPHASIS = 'font-bold text-[#7C5892]';
    const PURPLE_LINE = 'border-t-2 border-[#7C5892]';

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-6 py-12 max-w-5xl"> 
                
                {/* Logo & Header Utama (Konteks) */}
                <div className="text-center mb-12 pt-4">
                    {/* Logo Ilustrasi: Ubah dari w-24 h-24 menjadi w-40 h-40 */}
                    <div className="mx-auto mb-4 w-40 h-40"> 
                        {/* Gantikan h-8 dengan w-full h-full agar mengisi container */}
                        <img src={LogoImage} alt="Feellogy Logo" className="w-full h-full object-contain" />
                    </div>
                    
                    <h1 className={`text-5xl font-extrabold ${PURPLE_TEXT} mb-4`}>Tentang Kami</h1>
                    
                    <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
                        Feellogy adalah media reflektif berbasis kesehatan mental yang menyediakan ruang aman untuk memahami diri dan mengekspresikan perasaan.
                    </p>
                </div>

                {/* --- 1. SLOGAN dan FILOSOFI --- */}
                <section className="py-3 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    
                    {/* Blok Slogan (Kiri) - Mengambil 2/3 Lebar */}
                    <div className="text-left md:text-center p-2 md:col-span-2">
                        <p className="text-lg text-justify text-gray-800 leading-relaxed">
                            Slogan <em className={PURPLE_EMPHASIS}>The Science of Feelings, The Art of Healing</em> mencerminkan tujuan utama Feellogy dengan menggabungkan pengetahuan (<em className="italic">science</em>) dan kepekaan emosional (<em className="italic">art</em>)
                        </p>
                    </div>

                    {/* Blok Judul (Kanan) - Mengambil 1/3 Lebar */}
                    <div className="text-center md:text-right p-2 md:col-span-1">
                        <h2 className={`text-right text-4xl font-extrabold ${PURPLE_TEXT}`}>Filosofi Media</h2>
                    </div>
                </section>

                {/* Garis pemisah berwarna ungu di mockup */}
                <hr className="border-t-8 border-purple-500 my-8"/> 

                {/* --- 2. VISI MEDIA --- */}
                <section className="py-3 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    
                    {/* Blok Slogan (Kiri) - Mengambil 1/3 Lebar */}
                    <div className="text-left md:text-center p-2 md:col-span-1"> 
                        <h2 className={`text-4xl text-left font-extrabold ${PURPLE_TEXT} mb-4`}>Visi Media</h2>
                    </div>

                    {/* Blok Judul (Kanan) - Mengambil 2/3 Lebar */}
                    <div className="text-left md:text-right p-2 md:col-span-2">
                        <p className="text-lg text-justify text-gray-800 leading-relaxed">
                            Mewujudkan ruang aman yang membantu setiap orang memahami, merawat, dan mengekspresikan emosinya secara sehat melalui konten reflektif dan dukungan yang manusiawi.
                        </p>
                    </div>
                </section>

                {/* Garis pemisah berwarna hijau di mockup */}
                <hr className="border-t-8 border-green-500 my-8"/> 

                {/* --- 3. MISI MEDIA --- */}
                <section className="py-3 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    
                    {/* Blok Slogan (Kiri) - Mengambil 2/3 Lebar */}
                    <div className="text-left md:text-center p-2 md:col-span-2">
                        <ul className="list-decimal list-inside text-gray-800 space-y-2 text-lg leading-relaxed text-left">
                            <li>Menciptakan ruang aman untuk berbagi dan memahami perasaan.</li>
                            <li>Menyediakan konten reflektif yang membantu mengenali emosi.</li>
                            <li>Memberikan dukungan mental yang ringan dan terjangkau.</li>
                        </ul>
                    </div>

                    {/* Blok Judul (Kanan) - Mengambil 1/3 Lebar */}
                    <div className="text-left md:text-right p-2 md:col-span-1">
                        <h2 className={`text-right text-4xl font-extrabold ${PURPLE_TEXT} mb-4`}>Misi Media</h2>
                    </div>
                </section>

                {/* --- 4. HASHTAG DAN Slogan Bawah --- */}
                <section className="text-center mt-12">
                    <h2 className={`text-4xl font-extrabold ${PURPLE_TEXT} mb-4`}>
                        #FeelWithFeellogy
                    </h2>
                    <p className="text-lg text-gray-700">
                        Tempat di mana setiap perasaan didengar,<br/>tanpa nama dan tanpa penilaian
                    </p>
                </section>

            </main>
            <Footer />
        </div>
    );
};

export default AboutPage;