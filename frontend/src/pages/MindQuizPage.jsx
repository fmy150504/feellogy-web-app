import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthContext from '../context/AuthContext'; 

const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL_QUESTIONS = `${BASE_URL}/quiz/questions`;
const API_URL_SUBMIT = `${BASE_URL}/quiz/submit`;

// Warna kustom Anda
const GreenSolid = 'bg-[#AFC74F] text-white';
const PurpleSolid = 'bg-[#A88AEE] text-white';

// --- Daftar Fitur untuk Rekomendasi (Diperlukan untuk ResultDisplay) ---
const ALL_RECOMMENDATIONS = [
    { title: "Surat Anonim", description: "Berbagi cerita tanpa nama. Ruang aman untuk berbagi perasaan tanpa dinilai.", icon: "✉️", color: "bg-[#D9D9D9]", link: "/surat" },
    { title: "Audio Diary", description: "Dengarkan kisah-kisah dan obrolan seputar kesehatan mental untuk menemani healingmu.", icon: "🎧", color: "bg-[#D9D9D9]", link: "/audio" },
];

// Fungsi untuk memilih N item unik secara acak
const getRandomRecommendations = (n) => {
    const shuffled = [...ALL_RECOMMENDATIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
};

// ----------------------------------------------------------------------

// --- Komponen Tampilan Hasil Kuis (Gabungan 2 Blok) ---
const ResultDisplay = ({ result }) => {
    
    // Safety check untuk mencegah TypeError
    if (!result || !result.healing_prompt) {
         return (
             <div className="w-full max-w-2xl mx-auto text-center p-6 bg-red-50 rounded-xl">
                 <p className="text-red-700">Terjadi kesalahan dalam memproses hasil. Data kuis tidak lengkap.</p>
                 <button onClick={() => window.location.reload()} className="mt-4 text-purple-600 underline">Coba Lagi</button>
             </div>
        );
    }
    
    // Pilih 2 rekomendasi unik secara acak saat komponen dimuat
    const [recommendations] = useState(() => getRandomRecommendations(2));

    // Teks Tips Statis (Kotak Hijau Tips)
    const ResetTipsBox = (
        <div className={`p-8 rounded-xl shadow-lg border-4 border-white ${GreenSolid} text-center mt-8 max-w-2xl mx-auto`}>
             <p className="text-xl text-black"> 
                 {/* Menggunakan tips_message dari backend */}
                 {result.tips_message || "Teks motivasi tidak tersedia."} 
             </p>
        </div>
    );
    
    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Blok 1: Skor dan Pesan (HIJAU SKOR) */}
            <div className={`p-8 rounded-xl shadow-lg border-4 border-white ${GreenSolid} text-center`}>
                <h2 className="text-4xl font-sans mb-2 text-black underline">
                Skor Kamu: {result.totalScore}
                </h2>
                <h3 className="text-2xl font-bold text-black mb-3">
                    {result.healing_prompt.title}
                </h3>
                <p className={`text-xl mb-2 text-black`}> 
                    {result.message}
                </p>
                
                <button 
                    onClick={() => window.location.reload()} // Ulangi Kuis
                    className="inline-block mt-4 px-6 py-2 bg-white text-green-800 font-semibold rounded-full hover:bg-gray-100 transition shadow-md"
                >
                    Ulangi Kuis
                </button>
            </div>

            {/* Blok 2: Tips Statis (HIJAU TIPS) */}
            {ResetTipsBox}

            {/* Blok 3: Rekomendasi Konten */}
            <div className="text-center mt-12 mb-8">
                 <h3 className="inline-block px-6 py-2 bg-[#D8C7FF] text-[#4B0082] font-semibold rounded-full shadow-md text-lg">
                    Rekomendasi Untukmu
                 </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
                {recommendations.map((rec, index) => (
                    <Link 
                        key={index}
                        to={rec.link}
                        className={`p-6 rounded-xl shadow-lg transition transform hover:scale-[1.03] text-center ${rec.color} text-purple-800`}
                    >
                        <div className="text-4xl mb-2 text-purple-700">{rec.icon}</div>
                        <h4 className="font-bold text-lg text-purple-800 mb-1">{rec.title}</h4>
                        <p className="text-sm text-gray-700">{rec.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};


const MindQuizPage = () => {
    const [questions, setQuestions] = useState([]); 
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); 
    const [quizResult, setQuizResult] = useState(null);
    const [isLoading, setIsLoading] = useState(true); 
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);


    // --- FETCH PERTANYAAN DARI API (DB) ---
    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(API_URL_QUESTIONS); 
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Gagal memuat pertanyaan kuis.');
                }
                
                setQuestions(data.data || []); 

            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuestions();
    }, []); 

    const handleOptionChange = (questionId, value) => {
        // Simpan nilai sebagai integer
        setAnswers(prev => ({ ...prev, [questionId]: parseInt(value) })); 
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
                // Backend sudah menghitung total score, message, dan tips_message
                setQuizResult({
                    totalScore: data.total_score,
                    message: data.level_message,
                    tips_message: data.tips_message, 
                    healing_prompt: data.healing_prompt // Mengambil prompt object penuh (title, text, recommendation)
                });
            } else {
                setError(data.message || 'Gagal memproses kuis.');
            }
        } catch (err) {
            setError('Terjadi kesalahan jaringan saat mengirim kuis.');
        } finally {
            setIsSubmitting(false);
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
                    <h1 className="text-4xl font-extrabold text-purple-700 mb-4">Mind Quiz</h1>
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
                    <h1 className="text-4xl font-extrabold text-purple-700 mb-2">Mind Quiz</h1>
                    <p className="text-lg text-gray-700 mb-6">
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
                    <ResultDisplay result={quizResult} />
                )}
            </main>
            <Footer />
        </div>
    );
};

export default MindQuizPage;