// frontend/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

import { AuthProvider } from './context/AuthContext';

import SuratAnonimPage from './pages/SuratAnonimPage.jsx';
import AudioDiaryPage from './pages/AudioDiaryPage.jsx';
import MindQuizPage from './pages/MindQuizPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx';
import PsikologDashboard from './pages/PsikologDashboard.jsx';
import AdminCMSPage from './pages/AdminCMSPage.jsx';
import BuyCoinsPage from './pages/BuyCoinsPage.jsx';
import SentLettersPage from './pages/SentLettersPage.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Route untuk Homepage */}
          <Route path="/" element={<App />} />

          {/* Route Surat Anonim */}
          <Route path="/surat" element={<SuratAnonimPage />} />

          {/* Route Audio Diary */}
          <Route path="/audio" element={<AudioDiaryPage />} />

          {/* Route Mind Quiz */}
          <Route path="/quiz" element={<MindQuizPage />} />

          {/* Route Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Route Register */}
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Route About */}
          <Route path="/about" element={<AboutPage />} />
            
          {/* Route Privacy and Policy */}
          <Route path="/privacy" element={<PrivacyPolicyPage />} />

          {/* Route Dashboard Psikolog */}
          <Route path="/dashboard" element={<PsikologDashboard />} />

          {/* Route Dashboard Admin */}
          <Route path="/admin" element={<AdminCMSPage />} />

          {/* Route Topup */}
          <Route path="/buy-coins" element={<BuyCoinsPage />} />

          {/* Route Halaman Pesan Terkirim */}
          <Route path="/sent" element={<SentLettersPage />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);