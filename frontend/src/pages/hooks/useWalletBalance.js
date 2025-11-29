import { useState, useEffect, useContext } from 'react';
import AuthContext from '../../context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL_BALANCE = `${BASE_URL}/wallet/balance`;

const useWalletBalance = () => {
    const { user, isAuthenticated } = useContext(AuthContext);
    const [balance, setBalance] = useState(null);

    const fetchBalance = async () => {
        if (!isAuthenticated) {
            setBalance(null);
            return;
        }

        try {
            const token = user.token;
            const response = await fetch(API_URL_BALANCE, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok) {
                setBalance(data.balance);
            } else {
                setBalance(0);
            }
        } catch (err) {
            console.error("Error fetching balance:", err);
            setBalance(0);
        }
    };

    useEffect(() => {
        fetchBalance();
        // Set interval untuk refresh saldo setiap 30 detik (opsional)
        const interval = setInterval(fetchBalance, 30000); 
        return () => clearInterval(interval);
    }, [isAuthenticated, user?.token]); // Re-fetch jika status login berubah

    return { balance, fetchBalance };
};

export default useWalletBalance;