// frontend/src/components/Footer.jsx (Kode Final yang Direvisi)

import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        // Footer full-width dengan background ungu (#A98EFA)
        <footer className="bg-[#A98EFA] py-8 mt-12">
            <div className="container mx-auto px-6 max-w-7xl">
                
                {/* Layout menu: Ganti justify-between menjadi justify-center
                   dan tambahkan space-x-10 untuk jarak minimal yang nyaman */}
                <div className="flex flex-col md:flex-row justify-center items-center text-white space-y-4 md:space-y-0 md:space-x-10">
                    
                    {/* Menu 1 */}
                    <Link to="/about" className="hover:underline text-base font-medium text-white">Tentang Kami</Link>
                    
                    {/* Menu 2 */}
                    <a 
                        href="https://www.instagram.com/feellogy.id?igsh=MTFncno0ZjEwbzR3cA%3D%3D&utm_source=qr" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline text-base font-medium text-white"
                    >
                        Media Sosial
                    </a>

                    {/* Menu 3 */}
                    <Link to="/privacy" className="hover:underline text-base font-medium text-white">Kebijakan Privasi</Link>

                </div>

                <div className="text-center mt-6 text-sm text-white opacity-80">
                    &copy; {new Date().getFullYear()} Feellogy. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;