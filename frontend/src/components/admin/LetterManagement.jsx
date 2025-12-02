import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext'; 

const BASE_URL = import.meta.env.VITE_API_URL;
// Endpoint untuk mendapatkan SEMUA surat (yang baru kita buat)
const API_URL_ALL_LETTERS = `${BASE_URL}/admin/letters/all`; 
// Endpoint untuk Soft Delete
const API_URL_DELETE = `${BASE_URL}/admin/letters/delete`;

const LetterManagement = () => {
    const { user } = useContext(AuthContext);
    const [allLetters, setAllLetters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAllLetters = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = user.token;
            const response = await fetch(API_URL_ALL_LETTERS, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await response.json(); 

            if (response.ok) {
                 setAllLetters(data.data);
            } else {
                 throw new Error(data.message || 'Gagal memuat semua surat.');
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        // Cek user agar tidak crash jika user object belum dimuat
        if (user && user.token) { 
             fetchAllLetters();
        }
    }, [user]);

    // --- Soft Delete Handler ---
    const handleDelete = async (letterId) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus surat ini (Soft Delete)? Aksi ini akan dicatat.")) return;

        try {
            const token = user.token;
            const response = await fetch(`${API_URL_DELETE}/${letterId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('Surat berhasil di-soft delete! Aksi telah dicatat.');
                fetchAllLetters(); // Refresh daftar
            } else {
                const data = await response.json();
                alert('Gagal menghapus: ' + data.message);
            }
        } catch (err) {
            alert('Gagal menghapus surat karena masalah koneksi.');
        }
    };

    if (isLoading) return <p>Memuat data surat...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;

    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-4">Manajemen Semua Surat ({allLetters.length})</h3>
            <div className="bg-white rounded-lg shadow border">
                
                <div className="p-3 border-b text-sm font-bold flex justify-between">
                    <span>Judul & Status</span>
                    <span>Aksi</span>
                </div>

                {allLetters.length === 0 ? (
                    <p className="p-4 text-gray-500 italic">Tidak ada surat dalam database.</p>
                ) : (
                    allLetters.map(letter => (
                        <div key={letter._id} className={`p-4 border-b flex justify-between items-center ${letter.is_deleted ? 'bg-red-50 opacity-60' : ''}`}>
                            <div>
                                <p className="font-semibold text-gray-900">{letter.title}</p>
                                <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${letter.status === 'paid_waiting' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                    Status: {letter.status}
                                </span>
                                {letter.is_deleted && <span className="ml-2 text-xs text-red-500 font-bold"> (DIHAPUS)</span>}
                            </div>
                            
                            <button
                                onClick={() => handleDelete(letter._id)}
                                disabled={letter.is_deleted}
                                className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
                            >
                                Delete
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LetterManagement;