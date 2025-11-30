import React, { useState, useContext } from 'react';
import AuthContext from '../../context/AuthContext'; 

const API_URL_CREATE_USER = `${import.meta.env.VITE_API_URL}/admin/users`;

const CreateUserForm = ({ onUserCreated }) => {
    const { user } = useContext(AuthContext); // Untuk mendapatkan token
    
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('psikolog'); // Default: Psikolog
    
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [isError, setIsError] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        setIsError(false);

        const token = user?.token;

        if (!token) {
            setMessage('Error: Sesi admin berakhir. Mohon login ulang.');
            setIsError(true);
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(API_URL_CREATE_USER, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ username, email, password, role }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setUsername('');
                setEmail('');
                setPassword('');
                onUserCreated(); // Callback untuk refresh data (jika ada)
            } else {
                setMessage(data.message || 'Gagal membuat akun.');
                setIsError(true);
            }
        } catch (err) {
            setMessage('Terjadi kesalahan jaringan/server.');
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Buat Akun Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {message && (
                    <div className={`p-3 rounded text-sm ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message}
                    </div>
                )}

                <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={isLoading}
                >
                    <option value="psikolog">Psikolog</option>
                    <option value="admin">Admin</option>
                    <option value="user">Pengguna Biasa (User)</option>
                </select>

                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 border rounded" required disabled={isLoading} />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded" required disabled={isLoading} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded" required disabled={isLoading} />
                
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                >
                    {isLoading ? 'Membuat Akun...' : 'Buat Akun'}
                </button>
            </form>
        </div>
    );
};

export default CreateUserForm;