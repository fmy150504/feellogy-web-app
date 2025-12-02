import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import CreateUserForm from './CreateUserForm'; // Import form pembuatan user

const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL_USERS_ALL = `${BASE_URL}/admin/users/all`;
const API_URL_USERS_SUSPEND = `${BASE_URL}/admin/users/suspend`;
const API_URL_USERS_DELETE = `${BASE_URL}/admin/users`; // Base URL for DELETE

// --- Komponen User List Item ---
const UserListItem = ({ user, token, fetchUsers }) => {
    
    const toggleSuspension = async (status) => {
        const action = status ? 'menangguhkan' : 'mengaktifkan kembali';
        if (!window.confirm(`Apakah Anda yakin ingin ${action} akun ${user.username}?`)) return;

        try {
            const response = await fetch(`${API_URL_USERS_SUSPEND}/${user._id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ status: status })
            });

            if (response.ok) {
                alert(`User ${user.username} berhasil di${action}kan.`);
                fetchUsers();
            } else {
                alert('Gagal mengubah status.');
            }
        } catch (err) {
            alert('Error koneksi.');
        }
    };
    
    const deleteUser = async () => {
        if (!window.confirm(`PERINGATAN: Apakah Anda yakin menghapus akun ${user.username} secara PERMANEN?`)) return;

        try {
            const response = await fetch(`${API_URL_USERS_DELETE}/${user._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert(`Akun ${user.username} berhasil dihapus permanen.`);
                fetchUsers();
            } else {
                alert('Gagal menghapus akun.');
            }
        } catch (err) {
            alert('Error koneksi.');
        }
    };


    return (
        <div className={`p-4 border-b flex justify-between items-center ${user.is_suspended ? 'bg-red-50' : 'bg-white'}`}>
            <div>
                <p className="font-semibold text-gray-900">{user.username} 
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full capitalize ${user.role === 'admin' ? 'bg-purple-200' : user.role === 'psikolog' ? 'bg-green-200' : 'bg-blue-200'}`}>
                        {user.role}
                    </span>
                    {user.is_suspended && <span className="ml-2 text-xs text-red-600 font-bold">(SUSPENDED)</span>}
                </p>
                <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            
            <div className="space-x-2 text-sm flex items-center">
                {/* Tombol Suspend/Unsuspend */}
                <button
                    onClick={() => toggleSuspension(!user.is_suspended)}
                    className={`px-3 py-1 rounded text-white ${user.is_suspended ? 'bg-orange-500 hover:bg-orange-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                >
                    {user.is_suspended ? 'Aktifkan' : 'Tangguhkan'}
                </button>
                
                {/* Tombol Hapus Permanen */}
                <button
                    onClick={deleteUser}
                    className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                >
                    Hapus
                </button>
            </div>
        </div>
    );
};


// --- Komponen User Management Utama ---
const UserManagement = ({ onUserCreated }) => {
    const { user } = useContext(AuthContext);
    const [allUsers, setAllUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAllUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = user.token;
            const response = await fetch(API_URL_USERS_ALL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (response.ok) {
                setAllUsers(data.data);
            } else {
                throw new Error(data.message || 'Gagal memuat pengguna.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (user && user.token) {
            fetchAllUsers();
        }
    }, [user]);

    if (error) return <p className="text-red-500 mt-4">Error: {error}</p>;
    
    return (
        <div className="space-y-6">
            <CreateUserForm onUserCreated={() => { onUserCreated(); fetchAllUsers(); }} />
            
            <div className="p-6 bg-white rounded-lg shadow border">
                <h3 className="text-xl font-bold mb-4">Daftar Semua Pengguna ({allUsers.length})</h3>
                {isLoading ? (
                    <p>Memuat daftar pengguna...</p>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {allUsers.map(u => (
                            <UserListItem 
                                key={u._id} 
                                user={u} 
                                token={user.token} 
                                fetchUsers={fetchAllUsers} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;