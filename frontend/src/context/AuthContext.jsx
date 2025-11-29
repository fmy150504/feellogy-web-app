import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Ambil data dari localStorage saat inisialisasi
    const [user, setUser] = useState(null);

useEffect(() => {
        const token = localStorage.getItem('feellogyUserToken');
        const username = localStorage.getItem('feellogyUsername');
        const role = localStorage.getItem('feellogyUserRole');
        
        if (token && username && role && role !== 'undefined') { 
            // Lakukan pembersihan role saat memuat dari Local Storage
            const cleanRole = role.toLowerCase().trim(); 
            setUser({ username, token, role: cleanRole }); 
        }
    }, []);

    const login = (userData) => {
        localStorage.setItem('feellogyUserToken', userData.token);
        localStorage.setItem('feellogyUsername', userData.username);
        localStorage.setItem('feellogyUserRole', userData.role);

        setUser({ username: userData.username, token: userData.token, role: userData.role });
    };

    const logout = () => {
        localStorage.removeItem('feellogyUserToken');
        localStorage.removeItem('feellogyUsername');
        localStorage.removeItem('feellogyUserRole');

        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;