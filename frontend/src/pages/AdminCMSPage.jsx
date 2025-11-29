// frontend/src/pages/AdminCMSPage.jsx

import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthContext from '../context/AuthContext'; 

// Placeholder Komponen untuk Halaman Admin
const DashboardSummary = () => (
    <div className="grid grid-cols-3 gap-6">
        <StatCard title="Total Surat Aktif" value="1,200" />
        <StatCard title="Pengguna Terdaftar" value="560" />
        <StatCard title="Surat Menunggu Balasan" value="12" />
    </div>
);
const StatCard = ({ title, value }) => (
    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800 mt-1">{value}</h3>
    </div>
);
const UserManagement = () => <div>Halaman Manajemen Pengguna (Buat Akun Psikolog/Admin)</div>;
const DeletedLogs = () => <div>Halaman Log Aksi Admin (Soft Delete Log)</div>;

const AdminCMSPage = () => {
    const { user, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('summary');
    
    // Periksa role user
    const userRole = user ? user.role : 'guest';
    const isSuperAdmin = userRole === 'admin'; // Asumsi 'admin' adalah super admin untuk saat ini

    useEffect(() => {
        if (!isAuthenticated || userRole === 'psikolog' || userRole === 'user') {
            // Jika bukan admin, tendang ke dashboard psikolog atau ke homepage
            navigate(isAuthenticated ? '/dashboard' : '/');
        }
    }, [isAuthenticated, userRole, navigate]);
    
    if (!isAuthenticated || !isSuperAdmin) {
        return null; // Tunda rendering sambil navigate
    }


    const renderContent = () => {
        switch (activeTab) {
            case 'summary':
                return <DashboardSummary />;
            case 'users':
                return <UserManagement />;
            case 'logs':
                return <DeletedLogs />;
            default:
                return <DashboardSummary />;
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
                        {['summary', 'users', 'logs'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`w-full text-left py-2 px-3 rounded-lg transition ${activeTab === tab ? 'bg-purple-100 text-purple-800 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)} Management
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