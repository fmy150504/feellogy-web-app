import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthContext from '../context/AuthContext'; 

const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL_QUESTIONS = `${BASE_URL}/quiz/questions`;
const API_URL_SUBMIT = `${BASE_URL}/quiz/submit`;
const API_URL_SAVE_RESULT = `${BASE_URL}/quiz/results`; 

// Warna kustom Anda
const GreenSolid = 'bg-[#AFC74F] text-white';
const PurpleSolid = 'bg-[#A88AEE] text-white';

// --- Daftar Fitur untuk Rekomendasi (Dipertahankan) ---
const ALL_RECOMMENDATIONS = [
    { title: "Surat Anonim", description: "Berbagi cerita tanpa nama. Ruang aman untuk berbagi perasaan tanpa dinilai.", icon: "📩", color: "bg-[#D9D9D9] text-[#450E50]", link: "/surat" },
    { title: "Audio Diary", description: "Dengarkan kisah-kisah dan obrolan seputar kesehatan mental untuk menemani healingmu.", icon: "🎧", color: "bg-[#D9D9D9] text-[#450E50]", link: "/audio" },
];

// Fungsi untuk memilih N item unik secara acak
const getRandomRecommendations = (n) => {
    const shuffled = [...ALL_RECOMMENDATIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
};

// ----------------------------------------------------------------------

// --- Komponen Tampilan Hasil Kuis (Gabungan 2 Blok) ---
const ResultDisplay = ({ result, isAuthenticated, navigate, questions, answers, saveHistoryAfterLogin }) => { 
    
    if (!result || !result.healing_prompt) return null;

    const [recommendations] = useState(() => getRandomRecommendations(2));

    const handleLoginNow = () => {
        const pendingResult = {
            totalScore: result.totalScore,
            stress_level: result.stress_level,
            answers: questions.map(q => ({
                question_id: q._id,
                selected_score: answers[q._id] || 0,
            })),
            message: result.message,
            tips_message: result.tips_message,
            healing_prompt: result.healing_prompt,
        };
        localStorage.setItem('pendingQuizResult', JSON.stringify(pendingResult));
        localStorage.setItem('redirectAfterLogin', '/quiz'); 
        navigate('/login');
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-10">

            {/* SKOR (HIJAU UTAMA) */}
            <div className={`p-10 rounded-2xl shadow-xl border-4 border-white ${GreenSolid} text-center`}>
                <h2 className="text-4xl font-extrabold mb-4 text-black">
                    Skor Kamu: {result.totalScore}
                </h2>

                <h3 className="text-2xl font-bold text-black mb-3">
                    {result.healing_prompt.title}
                </h3>

                <p className="text-xl font-semibold mb-4 text-black">
                    {result.message}
                </p>

                <p className="text-sm font-medium text-black max-w-2xl mx-auto leading-relaxed">
                    {result.healing_prompt.text}
                </p>

                <button 
                    onClick={() => window.location.reload()}
                    className="inline-block mt-6 px-6 py-3 bg-white text-green-800 font-semibold rounded-full hover:bg-gray-100 transition shadow"
                >
                    Ulangi Kuis
                </button>
            </div>

            {/* TIPS BOX */}
            <div className={`p-10 rounded-2xl shadow-xl border-4 border-white ${GreenSolid} text-center`}>
                <p className="text-xl font-bold text-black leading-relaxed">
                    {result.tips_message}
                </p>

                <p className="mt-5 text-sm font-semibold text-black">
                    Saran Lanjut: {result.healing_prompt.recommendation}
                </p>
            </div>

            {/* LOGIN BOX */}
            {!isAuthenticated && (
                <div className="p-6 rounded-xl bg-yellow-50 border border-yellow-300 max-w-xl mx-auto text-center shadow">
                    <p className="font-semibold text-gray-800 mb-3">
                        Ingin menyimpan hasil kuis ini?
                    </p>

                    <button
                        onClick={handleLoginNow}
                        className="px-5 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition font-semibold"
                    >
                        Login Sekarang
                    </button>
                </div>
            )}

            {/* REKOMENDASI */}
            <div className="text-center">
                <h3 className="inline-block px-6 py-2 bg-[#A88AEE] text-[#450E50] font-extrabold rounded-full shadow-md text-lg">
                    Rekomendasi Untukmu
                </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto">
                {recommendations.map((rec, index) => (
                    <Link 
                        key={index}
                        to={rec.link}
                        className={`p-6 rounded-xl shadow-lg transition transform hover:scale-[1.03] text-center ${rec.color}`}
                    >
                        <div className="text-4xl mb-2 text-purple-700">{rec.icon}</div>
                        <h4 className="font-bold text-lg text-purple-800 mb-1">{rec.title}</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {rec.description}
                        </p>
                    </Link>
                ))}
            </div>

        </div>
    );
};


const MindQuizPage = () => {
    // Tambahkan useContext dan useNavigate di komponen utama
    const { isAuthenticated, user } = useContext(AuthContext); 
    const navigate = useNavigate();
    
    const [questions, setQuestions] = useState([]); 
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); 
    const [quizResult, setQuizResult] = useState(null);
    const [isLoading, setIsLoading] = useState(true); 
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);


    // --- Logic Simpan History setelah Login (Dipanggil dari useEffect) ---
    const saveHistoryAfterLogin = async (resultData, token) => {
        try {
            const response = await fetch(API_URL_SAVE_RESULT, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    total_score: resultData.totalScore,
                    stress_level: resultData.stress_level,
                    answers: resultData.answers, 
                }),
            });
            if (response.ok) {
                console.log("History berhasil disimpan setelah login.");
                // Setelah menyimpan history, KITA AKAN LANGSUNG REDIRECT KE HISTORY PAGE (opsional)
                // navigate('/quiz-history'); // Dihapus karena tombol cek riwayat sudah tersedia
            }
        } catch (err) {
            console.error("Gagal menyimpan history kuis setelah redirect:", err);
            // Tambahkan logic untuk menampilkan error jika save gagal
        }
    };

    // --- FETCH PERTANYAAN DARI API (DB) ---
    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(API_URL_QUESTIONS); 
                const data = await response.json();
                
                if (!response.ok) throw new Error(data.message || 'Gagal memuat pertanyaan kuis.');
                
                setQuestions(data.data || []); 

            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuestions();
        
        // PENTING: Cek Local Storage setelah login untuk menyimpan hasil yang tertunda
        const pendingResult = localStorage.getItem('pendingQuizResult');
        if (isAuthenticated && pendingResult) {
             const result = JSON.parse(pendingResult);
             
             // Panggil fungsi save API secara otomatis
             saveHistoryAfterLogin(result, user.token);
             
             // Hapus hasil tertunda dan tampilkan result display
             localStorage.removeItem('pendingQuizResult');
             setQuizResult(result); // Tampilkan hasil segera setelah kembali dari login
        }
    }, [isAuthenticated, user?.token]); 
    
    
    const handleOptionChange = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: parseInt(value) })); 
    };

    // --- FUNGSI SUBMIT KE API ---
    const handleSubmitQuiz = async () => {
        setIsSubmitting(true);
        setError(null);
        
        if (Object.keys(answers).length !== questions.length) {
            alert('Mohon jawab semua pertanyaan terlebih dahulu.');
            setIsSubmitting(false);
            return;
        }

        const formattedAnswers = questions.map(q => ({
            question_id: q._id,
            selected_score: answers[q._id] || 0,
        }));

        try {
            const response = await fetch(API_URL_SUBMIT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: formattedAnswers }),
            });

            const data = await response.json();

            if (response.ok) {
                // Buat object result baru
                const newResult = {
                    totalScore: data.total_score,
                    message: data.level_message,
                    tips_message: data.tips_message, 
                    healing_prompt: data.healing_prompt,
                    stress_level: data.stress_level, // Diperlukan untuk history save
                    answers: formattedAnswers, // Diperlukan untuk history save
                };
                
                setQuizResult(newResult);
                
                // Jika user sudah login, simpan history segera
                if (isAuthenticated) {
                    // Hanya SAVE, tidak ada redirect otomatis di sini
                    saveHistoryAfterLogin(newResult, user.token); 
                } else {
                    // Jika anonim, simpan hasil di Local Storage sementara untuk prompt login
                    localStorage.setItem('pendingQuizResult', JSON.stringify(newResult));
                }

            } else {
                setError(data.message || 'Gagal memproses kuis.');
            }
        } catch (err) {
            setError('Terjadi kesalahan jaringan saat mengirim kuis.');
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleNext = () => {
        if (!answers[questions[currentQuestionIndex]._id]) {
            alert('Mohon pilih salah satu jawaban.');
            return;
        }
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            handleSubmitQuiz(); 
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Memuat kuis...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500">Error: {error}</p>
            </div>
        );
    }
    
    // Safety check jika questions array kosong setelah fetch
    if (questions.length === 0) {
        return (
            <div className="min-h-screen flex flex-col bg-white">
                <Header />
                <main className="flex-grow container mx-auto px-6 py-12 max-w-4xl text-center">
                    <h1 className="text-4xl font-extrabold font-serif text-[#450E50] mb-4">Mind Quiz</h1>
                    <p className="text-gray-600">Saat ini belum ada pertanyaan kuis yang tersedia di database. Mohon hubungi admin.</p>
                </main>
                <Footer />
            </div>
        );
    }


    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />
            <main className="flex-grow container mx-auto px-6 py-12 max-w-4xl">
                
                {/* Header Kuis */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold font-serif text-[#450E50] mb-2">Mind Quiz</h1>
                    <p className="text-lg font-sans text-[#450E50] mb-6">
                        Kenali diri dan ketahui tingkat stresmu Lebih<br/>dalam melalui Kuis Reflektif di <span className="font-bold">Mind Quiz</span>!
                    </p>
                    {/* Kotak Peringatan */}
                    {!quizResult && ( 
                        <div className="bg-red-400 border border-red-400 text-white px-4 py-3 rounded relative max-w-2xl mx-auto">
                            <span className="block sm:inline font-semibold">Jawablah dengan jujur sesuai apa yang kamu rasakan akhir-akhir ini.<br/>Tidak ada jawaban benar atau salah karena semua perasaan valid.</span>
                        </div>
                    )}
                </div>

                {/* --- Konten Kuis --- */}
                {!quizResult ? ( // Tampilkan kuis jika belum ada hasil
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                        {currentQuestion ? (
                            <>
                                {/* Kotak Pertanyaan (Hijau Solid) */}
                                <div className="bg-[#AFC74F] p-6 rounded-lg mb-6 text-center">
                                    <p 
                                        className="text-xl text-black"
                                        dangerouslySetInnerHTML={{ __html: currentQuestion.question_text }}
                                    ></p>
                                </div>

                                {/* Opsi Jawaban */}
                                <div className="space-y-4">
                                    {currentQuestion.options.map((option, optIndex) => (
                                        <label 
                                            key={optIndex} 
                                            className={`flex items-center p-4 rounded-xl cursor-pointer transition 
                                                        ${answers[currentQuestion._id] === option.score_value 
                                                            ? 'bg-[#A88AEE] border-purple-500 ring-2 ring-black-500' 
                                                            : 'bg-[#A88AEE] border-purple-300 hover:bg-purple-300'}`}
                                        >
                                            <input
                                                type="radio"
                                                name={`question-${currentQuestion._id}`}
                                                value={option.score_value}
                                                checked={answers[currentQuestion._id] === option.score_value}
                                                onChange={(e) => handleOptionChange(currentQuestion._id, e.target.value)}
                                                className="form-radio h-5 w-5 text-purple-600 border-gray-300 focus:ring-purple-500"
                                            />
                                            <span className="ml-4 text-lg font-medium text-white">{option.option_text}</span> 
                                        </label>
                                    ))}
                                </div>

                                {/* Tombol Navigasi */}
                                <div className="flex justify-between mt-8">
                                    <button
                                        onClick={handlePrevious}
                                        disabled={currentQuestionIndex === 0 || isSubmitting}
                                        className="px-8 py-3 bg-gray-200 text-gray-800 font-semibold rounded-full hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed shadow"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className={`px-8 py-3 ${answers[currentQuestion._id] ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'} text-white font-semibold rounded-full transition shadow`}
                                        disabled={!answers[currentQuestion._id] || isSubmitting} 
                                    >
                                        {isSubmitting ? 'Memproses...' : (isLastQuestion ? 'Selesai' : 'Next')}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className="text-center text-gray-600">Tidak ada pertanyaan kuis yang tersedia.</p>
                        )}
                    </div>
                ) : (
                    // --- Tampilan Hasil Kuis ---
                    <ResultDisplay 
                        result={quizResult} 
                        isAuthenticated={isAuthenticated}
                        navigate={navigate}
                        questions={questions}
                        answers={answers}
                        saveHistoryAfterLogin={saveHistoryAfterLogin}
                    />
                )}
                
                {/* --- TOMBOL RIWAYAT (Di Bawah Kotak Kuis/Hasil) --- */}
                {isAuthenticated && (
                    <div className="text-center mt-10">
                        <Link
                            to="/quiz-history"
                            className="inline-block px-8 py-3 bg-purple-100 text-purple-700 font-semibold rounded-full hover:bg-purple-200 transition shadow"
                        >
                            Cek Riwayat Kuis Saya
                        </Link>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default MindQuizPage;