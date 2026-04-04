import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white shadow-soft border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                            <i className="fas fa-chart-line text-white text-sm"></i>
                        </div>
                        <span className="text-xl font-bold text-gray-900">FinAI</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/"
                            className={`nav-link ${isActive('/') ? 'active' : ''}`}
                        >
                            Home
                        </Link>
                        {isAuthenticated() ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/planning"
                                    className={`nav-link ${isActive('/planning') ? 'active' : ''}`}
                                >
                                    New Plan
                                </Link>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                            <i className="fas fa-user text-primary-600 text-sm"></i>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">
                                            {user?.firstName || 'User'}
                                        </span>
                                        
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="text-gray-600 hover:text-primary-600 transition-colors duration-200 font-medium"
                                    >
                                        <i className="fas fa-sign-out-alt mr-1"></i>
                                        Sign Out
                                    </button>
                                </div>
                            </>
                            ) : (
                                <>
                                    <Link
                                        to="/registration"
                                        className={`nav-link ${isActive('/registration') ? 'active' : ''}`}
                                    >
                                        Registration
                                    </Link>
                                    <Link
                                        to="/login"
                                        className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                                    >
                                        Login
                                    </Link>
                                </>
                            )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-600 hover:text-primary-600 focus:outline-none focus:text-primary-600"
                        >
                            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-100">
                            <Link
                                to="/"
                                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/') ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                                    }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Home
                            </Link>
                            {isAuthenticated() ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard') ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                                            }`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/planning"
                                        className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/planning') ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                                            }`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        New Plan
                                    </Link>
                                    <div className="border-t border-gray-200 pt-2 mt-2">
                                        <div className="flex items-center px-3 py-2">
                                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                                <i className="fas fa-user text-primary-600 text-sm"></i>
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">
                                                {user?.firstName || 'User'}
                                            </span>
                                            {user?.isDemo && (
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">
                                                    Demo
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setIsMenuOpen(false);
                                            }}
                                            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                                        >
                                            <i className="fas fa-sign-out-alt mr-2"></i>
                                            Sign Out
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/registration"
                                        className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/registration') ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                                            }`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Registration
                                    </Link>
                                    <Link
                                        to="/login"
                                        className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/login') ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                                            }`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;