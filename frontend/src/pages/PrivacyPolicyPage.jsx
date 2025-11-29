import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PrivacyPolicyPage = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-6 py-12 max-w-4xl">
                
                <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Kebijakan Privasi Feellogy</h1>

                <section className="mb-8 p-6 bg-white rounded-lg shadow-md">
                    
                    {/* 1. Informasi yang Kami Kumpulkan */}
                    <h2 className="text-2xl font-bold text-purple-700 mb-4">1. Informasi yang Kami Kumpulkan</h2>
                    <p className="text-gray-700 mb-4">
                        Feellogy mengumpulkan dua jenis informasi:
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-2">a. Informasi Anonim (Tanpa Identitas Pengguna)</h3>
                    <p className="text-gray-700 mb-3">
                        Untuk fitur Surat Anonim, pengguna dapat mengirim cerita tanpa mencantumkan nama, usia, atau informasi pribadi lainnya.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mb-4">
                        <li>Kami tidak mengumpulkan atau menyimpan identitas pengirim surat.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-800 mb-2">b. Informasi Akun Komunitas (Feelmates)</h3>
                    <p className="text-gray-700 mb-3">
                        Untuk bergabung dalam komunitas Feelmates, pengguna membuat akun dengan:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mb-6">
                        <li>Nama (Username)</li>
                        <li>Alamat Email</li>
                        <li>Data ini digunakan untuk mengelola akun pengguna dan menyediakan akses ke fitur komunitas.</li>
                    </ul>

                    {/* 2. Penggunaan Informasi */}
                    <h2 className="text-2xl font-bold text-purple-700 mt-6 mb-4">2. Penggunaan Informasi</h2>
                    <p className="text-gray-700 mb-3">
                        Informasi yang dikumpulkan digunakan untuk:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mb-4">
                        <li>Menyediakan layanan platform</li>
                        <li>Mengelola akun komunitas Feelmates</li>
                        <li>Memastikan keamanan dan kenyamanan dalam platform</li>
                    </ul>
                    <p className="text-gray-700">
                        Untuk Surat Anonim, konten cerita hanya akan dipublikasikan atas persetujuan pengguna.
                    </p>

                    {/* 3. Keamanan Data */}
                    <h2 className="text-2xl font-bold text-purple-700 mt-6 mb-4">3. Keamanan Data</h2>
                    <p className="text-gray-700 mb-3">
                        Feellogy berkomitmen untuk menjaga kerahasiaan informasi pengguna.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mb-4">
                        <li>Kami menerapkan langkah-langkah keamanan digital yang wajar untuk melindungi data dari akses tidak sah, perubahan, atau penyalahgunaan.</li>
                        <li>Namun, seluruh pengiriman data melalui internet memiliki risiko, dan Feellogy tidak dapat menjamin keamanan absolut.</li>
                    </ul>

                    {/* 4. Berbagi Informasi kepada Pihak Ketiga */}
                    <h2 className="text-2xl font-bold text-purple-700 mt-6 mb-4">4. Berbagi Informasi kepada Pihak Ketiga</h2>
                    <p className="text-gray-700 mb-3">
                        Feellogy tidak menjual, menyewakan, atau membagikan informasi pribadi pengguna kepada pihak ketiga.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mb-4">
                        <li>Pengecualian dilakukan untuk fitur Surat Anonim, di mana isi surat dapat diteruskan kepada pihak psikolog untuk proses konsultasi lebih lanjut, sesuai kebutuhan pengguna.</li>
                    </ul>

                    {/* 5. Hak Pengguna */}
                    <h2 className="text-2xl font-bold text-purple-700 mt-6 mb-4">5. Hak Pengguna</h2>
                    <p className="text-gray-700 mb-3">
                        Pengguna berhak untuk:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 mb-4">
                        <li>Meminta penghapusan akun Feelmates</li>
                        <li>Memperbarui data akun</li>
                        <li>Menarik persetujuan penggunaan data</li>
                        <li>Permintaan dapat dilakukan melalui kontak resmi Feellogy.</li>
                    </ul>
                    
                    {/* 6. Perubahan Kebijakan */}
                    <h2 className="text-2xl font-bold text-purple-700 mt-6 mb-4">6. Perubahan Kebijakan</h2>
                    <p className="text-gray-700">
                        Feellogy dapat memperbarui Kebijakan Privasi ini sewaktu-waktu. Perubahan akan diinformasikan melalui situs atau email pengguna.
                    </p>

                    <h2 className="text-2xl font-bold text-purple-700 mt-6 mb-4">7. Kontak</h2>
                    <p className="text-base text-gray-700">
                        Untuk pertanyaan terkait Kebijakan Privasi, pengguna dapat menghubungi Feellogy melalui:
                    </p>
                    <p className="text-lg font-bold text-purple-700 mt-2">
                        📩 <a href="mailto:feellogy@gmail.com" className="hover:underline">feellogy@gmail.com</a>
                    </p>
                </section>

                <section className="text-center mt-12">
                    <p className="text-sm text-gray-500">
                        Pembaruan terakhir: 19 November 2025
                    </p>
                </section>

            </main>
            <Footer />
        </div>
    );
};

export default PrivacyPolicyPage;