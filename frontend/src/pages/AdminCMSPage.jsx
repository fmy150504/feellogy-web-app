import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthContext from '../context/AuthContext'; 
// Import komponen Admin
import LetterManagement from '../components/admin/LetterManagement'; 
import UserManagement from '../components/admin/UserManagement'; // <-- PASTIKAN INI DIIMPOR

const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL_SUMMARY = `${BASE_URL}/admin/summary`;

// --- Komponen Statistik Ringkasan ---
const StatCard = ({ title, value }) => (
    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800 mt-1">{value}</h3>
    </div>
);
const DashboardSummary = ({ summaryData }) => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Pengguna (Semua Role)" value={summaryData.totalUsers} />
            <StatCard title="Total Psikolog Aktif" value={summaryData.totalPsikologs} />
            <StatCard title="Surat Menunggu Balasan" value={summaryData.lettersWaiting} />
        </div>
        
        {/* Placeholder Log Terakhir */}
        <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-xl font-bold mb-3 text-gray-800">10 Aksi Log Terakhir</h3>
            <AdminLogs logs={summaryData.latestLogs} isSummary={true} />
        </div>
    </div>
);

// --- Komponen Log Aktivitas ---
const AdminLogs = ({ logs, isSummary = false }) => (
    <div className="space-y-4">
        {!isSummary && <h3 className="text-2xl font-bold text-gray-800 mb-4">Log Aksi Lengkap</h3>}
        {logs.length === 0 ? (
            <p className="text-gray-500 italic">Belum ada log aktivitas yang tercatat.</p>
        ) : (
            <div className="bg-white rounded-lg shadow border">
                {logs.map((log, index) => (
                    <div key={log._id || index} className="p-3 border-b text-sm">
                        <p className="font-semibold text-gray-900">{log.description}</p>
                        <span className="text-xs text-gray-500">
                            {new Date(log.createdAt).toLocaleString()} | Admin ID: {log.admin_id ? log.admin_id.substring(0, 5) : 'N/A'}...
                        </span>
                    </div>
                ))}
            </div>
        )}
    </div>
);


const AdminCMSPage = () => {
    const { user, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    
    // State CMS
    const [activeTab, setActiveTab] = useState('summary');
    const [summaryData, setSummaryData] = useState({ 
        totalUsers: 0, totalLetters: 0, lettersWaiting: 0, 
        latestLogs: [], totalPsikologs: 0 
    }); 
    const [isLoading, setIsLoading] = useState(true);
    
    const userRole = user ? user.role.toLowerCase().trim() : 'guest';
    const isSuperAdmin = userRole === 'admin'; 

    // --- Fetch Summary Data ---
    const fetchSummaryData = async () => {
        if (!isSuperAdmin) return;
        setIsLoading(true);
        try {
            const token = user.token;
            const response = await fetch(API_URL_SUMMARY, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (response.ok) {
                setSummaryData(data.data); 
            }
        } catch (err) {
            console.error("Failed to fetch admin summary:", err);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Callback setelah user baru dibuat
    const handleUserCreated = () => {
        fetchSummaryData(); 
        setActiveTab('summary'); 
    };

    // Pengecekan Akses dan Fetch Data Awal
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        
        // Pengalihan jika bukan Admin
        if (userRole !== 'admin') {
            navigate('/dashboard'); 
            return;
        }

        // Jika Admin, fetch data
        fetchSummaryData();
    }, [isAuthenticated, userRole, navigate]);
    
    // Tunda rendering jika belum login atau bukan admin (sebelum navigate)
    if (!isAuthenticated || userRole !== 'admin') {
        return <div className="min-h-screen flex items-center justify-center"><p>Memeriksa akses...</p></div>;
    }


    // Fungsi render konten tab
    const renderContent = () => {
        if (isLoading) return <p className="text-center mt-10">Memuat statistik...</p>;
        
        switch (activeTab) {
            case 'summary':
                return <DashboardSummary summaryData={summaryData} />;
            case 'users':
                // Memanggil UserManagement, yang berisi CreateUserForm dan daftar user
                return <UserManagement onUserCreated={handleUserCreated} />; 
            case 'letters': 
                // Memanggil LetterManagement untuk melihat semua surat (termasuk soft delete)
                return <LetterManagement />; 
            case 'logs':
                // Kirim data logs nyata ke komponen
                return <AdminLogs logs={summaryData.latestLogs} />; 
            default:
                return <DashboardSummary summaryData={summaryData} />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <div className="flex flex-grow">
                
                {/* Sidebar Menu */}
                <aside className="w-64 bg-white p-6 border-r shadow-md">
                    <h3 className="text-xl font-bold text-purple-700 mb-6">CMS Menu</h3>
                    <nav className="space-y-2">
                        {['summary', 'users', 'letters', 'logs'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`w-full text-left py-2 px-3 transition capitalize ${activeTab === tab ? 'bg-purple-100 text-purple-800 font-semibold' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                            >
                                {tab.replace('-', ' ')} Management
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-grow p-8">
                    <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Admin Dashboard</h1>
                    {renderContent()}
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default AdminCMSPage;