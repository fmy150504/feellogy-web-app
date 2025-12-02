import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import useWalletBalance from "../hooks/useWalletBalance";
import LogoImage from "../assets/feellogy.png";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const Header = () => {
    const { user, logout, isAuthenticated } = useContext(AuthContext);
    const { balance } = useWalletBalance();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const cleanedRole = user ? user.role.toLowerCase().trim() : "user";
    const dashboardUrl = cleanedRole === "admin" ? "/admin" : "/dashboard";

    const handleLogout = () => {
        logout();
        navigate("/");
        window.location.reload();
    };

    const navItems = [
        { to: "/about", label: "Tentang" },
        { to: "/surat", label: "Surat Anonim" },
        { to: "/audio", label: "Audio Diary" },
        { to: "/quiz", label: "Mind Quiz" },
        { to: "/sent", label: "Kotak Keluar" },
    ];

    return (
        <header className="bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="flex items-center">
                    <img
                        src={LogoImage}
                        alt="Feellogy Logo"
                        className="h-9 w-auto"
                    />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className="text-sm font-medium text-gray-700 hover:text-purple-600 transition"
                        >
                            {item.label}
                        </Link>
                    ))}

                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/buy-coins"
                                className="px-3 py-1 text-sm bg-purple-100 text-purple-700 font-semibold rounded-full border border-purple-200"
                            >
                                💰 {balance === null ? "..." : `${balance} Koin`}
                            </Link>

                            {(cleanedRole === "admin" || cleanedRole === "psikolog") && (
                                <Link
                                    to={dashboardUrl}
                                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Dashboard
                                </Link>
                            )}

                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            Masuk
                        </Link>
                    )}
                </nav>

                {/* Mobile Icons */}
                <div className="md:hidden flex items-center gap-3">

                    {isAuthenticated && (
                        <Link
                            to="/buy-coins"
                            className="px-3 py-1 text-sm bg-purple-100 text-purple-700 font-semibold rounded-full border border-purple-200"
                        >
                            💰 {balance === null ? "..." : `${balance} Koin`}
                        </Link>
                    )}

                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="bg-white p-2 text-gray-700"
                    >
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    <div className="fixed top-0 right-0 w-72 h-full bg-white shadow-xl z-50 p-6 flex flex-col">
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="bg-white p-2 text-gray-600"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <nav className="flex flex-col mt-6 space-y-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className="text-lg text-gray-700 hover:text-purple-600"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}

                            <div className="pt-4 border-t mt-4 space-y-3">

                                {isAuthenticated ? (
                                    <>

                                        {(cleanedRole === "admin" || cleanedRole === "psikolog") && (
                                            <Link
                                                to={dashboardUrl}
                                                className="block text-center px-4 py-2 bg-green-600 text-white rounded-lg"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                Dashboard
                                            </Link>
                                        )}

                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg"
                                        >
                                            Logout
                                        </button>

                                        <p className="text-center text-sm text-gray-500">
                                            Halo, {user.username}
                                        </p>
                                    </>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="block text-center px-4 py-2 bg-purple-600 text-white rounded-lg"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Masuk
                                    </Link>
                                )}
                            </div>
                        </nav>
                    </div>
                </>
            )}
        </header>
    );
};

export default Header;
