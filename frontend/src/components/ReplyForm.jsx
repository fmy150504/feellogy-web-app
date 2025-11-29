import React, { useState } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL;
// Endpoint untuk mengirim balasan (Contoh: POST /api/psikolog/reply-letter/:suratId)
const API_URL_REPLY = `${BASE_URL}/psikolog/reply-letter`; 

const ReplyForm = ({ suratId, onSuccess, userToken, onCancel }) => {
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (replyContent.trim().length < 50) {
            setError('Isi balasan minimal 50 karakter.');
            return;
        }
        
        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_URL_REPLY}/${suratId}`, {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`, 
                },
                body: JSON.stringify({ 
                    reply_content: replyContent 
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal mengirim balasan surat.');
            }

            // Balasan berhasil: Kirim pesan sukses ke parent
            onSuccess(data.message); 
            
            // Bersihkan form dan tutup
            setReplyContent('');
            onCancel(); 

        } catch (err) {
            console.error('Reply Error:', err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="font-semibold mb-2 text-purple-700">Tulis Balasan</h4>
            <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows="5"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                placeholder="Tulis balasan profesional Anda di sini (minimal 50 karakter)..."
                disabled={isSubmitting}
            ></textarea>
            
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <div className="flex justify-end space-x-2 mt-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                    disabled={isSubmitting}
                >
                    Batal
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-400"
                    disabled={isSubmitting || replyContent.trim().length < 50}
                >
                    {isSubmitting ? 'Mengirim...' : 'Kirim Balasan'}
                </button>
            </div>
        </form>
    );
};

export default ReplyForm;