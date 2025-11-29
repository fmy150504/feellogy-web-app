import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AboutPage = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-6 py-12 max-w-5xl"> {/* Max width diperlebar */}
                
                <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Tentang Kami</h1>

                {/* Paragraf Pembuka Utama */}
                <p className="text-lg text-gray-700 leading-relaxed mb-16 text-center max-w-3xl mx-auto">
                    Feellogy adalah media reflektif yang berfokus pada isu kesehatan mental. Kami hadir
                    sebagai ruang aman bagi siapa pun yang ingin memahami diri, mengekspresikan
                    perasaan, atau sekadar menemukan kedamaian melalui cerita. Dengan pendekatan yang
                    empatik dan bertanggung jawab, Feellogy berupaya menghubungkan <em className="font-semibold text-purple-700">Feelmates</em> melalui
                    konten yang dekat dan <em className="font-semibold text-purple-700">relateable</em> dengan pengguna. Kami percaya bahwa setiap
                    perasaan layak diakui, setiap cerita layak didengar, dan setiap perjalanan pemulihan
                    layak dipenuhi dukungan. Melalui tiga fitur utama kami—<b>Surat Anonim, Audio Diary, dan
                    Mind Quiz</b>, Feellogy ingin membantu pengguna mengenali emosi, berbagi pengalaman
                    secara aman, dan memahami kondisi mental dengan lebih baik.
                </p>

                {/* Bagian Filosofi & Komunitas (Two Columns) */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {/* Blok Filosofi Media */}
                    <div className="bg-[#A98EFA] p-8 rounded-xl shadow-lg flex flex-col justify-center items-center text-center">
                        <h2 className="text-3xl font-extrabold text-white mb-4">Filosofi Media</h2>
                        <p className="text-lg text-white leading-relaxed italic max-w-sm">
                            Slogan <em className="font-serif font-bold text-yellow-100">The Science of Feelings, The Art of Healing</em> mencerminkan tujuan utama
                            Feellogy dengan menggabungkan
                            pengetahuan (<em className="font-serif font-bold text-yellow-100">science</em>) dan kepekaan
                            emosional (<em className="font-serif font-bold text-yellow-100">art</em>)
                        </p>
                    </div>

                    {/* Blok Komunitas Kami */}
                    <div className="bg-[#AEE26C] p-8 rounded-xl shadow-lg flex flex-col justify-center items-center text-center">
                        <h2 className="text-3xl font-extrabold text-white mb-4">Komunitas Kami</h2>
                        <p className="text-lg text-white leading-relaxed max-w-sm">
                            Audiens Feellogy disebut <em className="font-semibold text-purple-900">Feelmates</em>,
                            gabungan dari perasaan (<em className="font-semibold text-purple-900">feel</em>) dan
                            teman (<em className="font-semibold text-purple-900">mates</em>). <em className="font-semibold text-purple-900">Feelmates</em> adalah
                            komunitas sebagai ruang aman untuk
                            berbagi perasaan dan pengalaman
                        </p>
                    </div>
                </section>

                {/* Slogan Tambahan di Bagian Bawah */}
                <section className="text-center mt-12 mb-16">
                    <p className="text-3xl font-serif font-extrabold text-gray-800 opacity-80">
                        The Science of Feelings <br/> The Art of Healing
                    </p>
                </section>

            </main>
            <Footer />
        </div>
    );
};

export default AboutPage;