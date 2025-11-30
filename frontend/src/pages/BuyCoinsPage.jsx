import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthContext from '../context/AuthContext'; 

const BASE_URL = import.meta.env.VITE_API_URL;
// Endpoint untuk mendapatkan saldo (Contoh: GET /api/wallet/balance)
const API_URL_BALANCE = `${BASE_URL}/wallet/balance`; 
// Endpoint untuk memproses pembelian (Contoh: POST /api/wallet/purchase)
const API_URL_PURCHASE = `${BASE_URL}/wallet/purchase`; 

const COIN_PACKAGES = [
    { id: 100, coins: 100, price: 10000, label: "Rp10.000" },
    { id: 275, coins: 275, price: 25000, label: "Rp25.000" },
    { id: 600, coins: 600, price: 50000, label: "Rp50.000 (Hemat)" },
    { id: 1000, coins: 1000, price: 70000, label: "Rp70.000 (Best Deal)" },
];

const BuyCoinsPage = () => {
    const { user, isAuthenticated } = useContext(AuthContext);
    const [balance, setBalance] = useState(null);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // --- Fungsi Mendapatkan Saldo ---
    const fetchBalance = async () => {
        if (!isAuthenticated) return;
        
        try {
            const token = user.token;
            const response = await fetch(API_URL_BALANCE, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (response.ok) {
                setBalance(data.balance);
            } else {
                setBalance(0); // Default 0 jika API gagal/wallet belum ada
            }
        } catch (err) {
            console.error("Failed to fetch balance:", err);
            setBalance(0);
        }
    };
    
    // --- Fungsi Memproses Pembayaran (Dummy) ---
    const handlePurchase = async () => {
        if (!selectedPackage) {
            setError('Mohon pilih paket koin terlebih dahulu.');
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        
        try {
            const token = user.token;
            
            // --- Implementasi Pembayaran Dummy (Diperlukan integrasi Midtrans/Xendit nyata) ---
            // Karena kita belum mengintegrasikan payment gateway, kita simulasikan sukses
            
            // Logika nyata: POST ke backend untuk membuat order ID dan memotong uang
            const response = await fetch(API_URL_PURCHASE, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ package_id: selectedPackage.id })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(data.message); // <-- Gunakan pesan sukses dari backend
                
                // [PENTING] Update state balance dengan new_balance dari respons backend
                setBalance(data.new_balance); // <-- PERUBAHAN DI SINI
                
                // fetchBalance(); // Tidak perlu lagi memanggil ini jika setBalance(data.new_balance) dilakukan
            } else {
                setError(data.message || 'Pembayaran gagal diproses di server.');
            }

        } catch (err) {
            setError('Terjadi kesalahan jaringan atau pembayaran gagal.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchBalance();
        }
    }, [isAuthenticated]);

    // Tampilan jika belum login
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">Silakan <Link to="/login" className="font-bold text-purple-600">Login</Link> untuk membeli koin.</p>
            </div>
        );
    }
    
    const isReadyToPurchase = selectedPackage && !isLoading;

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-6 py-12 max-w-2xl">
                
                <h1 className="text-4xl font-extrabold text-purple-700 mb-8 text-center">🛒 Beli Koin Feellogy</h1>

                {/* Saldo Saat Ini */}
                <div className="p-4 bg-purple-50 rounded-lg shadow-md mb-6 flex justify-between items-center border border-purple-200">
                    <h2 className="text-xl font-bold text-gray-700">Saldo saat ini:</h2>
                    <span className="text-3xl font-extrabold text-purple-600">
                        {balance === null ? 'Memuat...' : `${balance} Koin`}
                    </span>
                </div>

                {/* Pilih Paket */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Pilih Paket Koin</h3>
                    
                    {error && <div className="p-3 mb-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
                    {success && <div className="p-3 mb-3 bg-green-100 text-green-700 rounded text-sm">{success}</div>}

                    <div className="space-y-4">
                        {COIN_PACKAGES.map(pkg => (
                            <div 
                                key={pkg.id}
                                onClick={() => setSelectedPackage(pkg)}
                                className={`p-4 border rounded-lg cursor-pointer transition flex justify-between items-center ${selectedPackage && selectedPackage.id === pkg.id ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600' : 'border-gray-300 hover:bg-gray-50'}`}
                            >
                                <span className="font-semibold text-lg">{pkg.coins} Koin</span>
                                <span className="font-bold text-purple-700">{pkg.label}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handlePurchase}
                        disabled={!isReadyToPurchase || isLoading}
                        className="w-full mt-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition disabled:bg-gray-400"
                    >
                        {isLoading ? 'Memproses Pembayaran...' : `Lanjutkan Pembayaran (${selectedPackage ? selectedPackage.price : 'Pilih Paket'})`}
                    </button>
                    
                    {/* Informasi Layanan */}
                    <p className="text-xs text-gray-500 mt-4 text-center">
                        Koin dapat digunakan untuk layanan Surat Psikolog. Koin tidak dapat diuangkan kembali.
                    </p>
                </div>
                
            </main>
            <Footer />
        </div>
    );
};

export default BuyCoinsPage;