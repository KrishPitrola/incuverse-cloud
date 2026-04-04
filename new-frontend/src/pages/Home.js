import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentFeature, setCurrentFeature] = useState(0);

    useEffect(() => {
        setIsVisible(true);
        const interval = setInterval(() => {
            setCurrentFeature((prev) => (prev + 1) % 3);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const features = [
        {
            icon: 'fa-piggy-bank',
            title: 'Smart Savings',
            description: 'AI-driven recommendations for optimal savings strategies',
            color: 'from-blue-500 to-blue-600'
        },
        {
            icon: 'fa-chart-pie',
            title: 'Portfolio Analysis',
            description: 'Optimized investment strategies tailored to your goals',
            color: 'from-green-500 to-green-600'
        },
        {
            icon: 'fa-shield-alt',
            title: 'Secure Future',
            description: 'Protected retirement planning with bank-level security',
            color: 'from-purple-500 to-purple-600'
        }
    ];

    return (
        <div className="min-h-screen overflow-hidden">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary-50 via-white to-blue-50 py-20 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
                    <div className="absolute top-40 left-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="inline-block mb-6">
                            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary-100 text-primary-800 animate-bounce">
                                <i className="fas fa-robot mr-2"></i>
                                Powered by Advanced AI Technology
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in-up">
                            Smart Retirement Planning with{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600 animate-gradient-x">
                                AI
                            </span>
                        </h1>

                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
                            Plan your perfect retirement with our AI-powered platform. Get personalized
                            recommendations, track your progress, and secure your financial future with confidence.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
                            
                            <Link
                                to="/registration"
                                className="btn btn-secondary text-lg px-8 py-4 transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
                            >
                                <i className="fas fa-rocket mr-2"></i>
                                Get Started
                            </Link><Link
                                to="/login"
                                className="btn btn-primary text-lg px-8 py-4 transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
                            >
                                <i className="fas fa-play mr-2"></i>
                                Login
                            </Link>
                            
                        </div>
                    </div>

                    {/* Floating Cards Animation */}
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`card p-6 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-xl ${currentFeature === index
                                    ? 'animate-pulse shadow-lg'
                                    : 'opacity-70 hover:opacity-100'
                                    }`}
                                style={{
                                    animationDelay: `${index * 200}ms`,
                                    transform: currentFeature === index ? 'scale(1.05)' : 'scale(1)'
                                }}
                            >
                                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4 animate-spin-slow`}>
                                    <i className={`fas ${feature.icon} text-white text-2xl`}></i>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-white relative overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary-200 to-blue-200 transform rotate-12 scale-150"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">
                            Why Choose Our Platform?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
                            Experience the future of retirement planning with cutting-edge AI technology
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: 'fa-robot',
                                title: 'AI-Powered Analysis',
                                description: 'Advanced algorithms analyze your financial data to provide personalized retirement strategies.',
                                color: 'from-blue-500 to-blue-600',
                                delay: '0ms'
                            },
                            {
                                icon: 'fa-mobile-alt',
                                title: 'Mobile Friendly',
                                description: 'Access your retirement plan anywhere, anytime with our responsive design.',
                                color: 'from-green-500 to-green-600',
                                delay: '200ms'
                            },
                            {
                                icon: 'fa-lock',
                                title: 'Secure & Private',
                                description: 'Your financial data is encrypted and protected with bank-level security.',
                                color: 'from-purple-500 to-purple-600',
                                delay: '400ms'
                            },
                            {
                                icon: 'fa-chart-line',
                                title: 'Real-time Tracking',
                                description: 'Monitor your progress with live updates and performance analytics.',
                                color: 'from-orange-500 to-orange-600',
                                delay: '600ms'
                            }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="card p-6 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-xl group animate-fade-in-up"
                                style={{ animationDelay: feature.delay }}
                            >
                                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-4 transform group-hover:rotate-12 transition-transform duration-300`}>
                                    <i className={`fas ${feature.icon} text-white text-2xl`}></i>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                                <div className="mt-4 w-full h-1 bg-gradient-to-r from-transparent via-primary-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Why Choose Our Platform?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Experience the future of retirement planning with cutting-edge AI technology
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="card p-6 text-center">
                            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-robot text-white text-xl"></i>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
                            <p className="text-gray-600 text-sm">
                                Advanced algorithms analyze your financial data to provide personalized retirement strategies.
                            </p>
                        </div>

                        <div className="card p-6 text-center">
                            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-mobile-alt text-white text-xl"></i>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile Friendly</h3>
                            <p className="text-gray-600 text-sm">
                                Access your retirement plan anywhere, anytime with our responsive design.
                            </p>
                        </div>

                        <div className="card p-6 text-center">
                            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-lock text-white text-xl"></i>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Private</h3>
                            <p className="text-gray-600 text-sm">
                                Your financial data is encrypted and protected with bank-level security.
                            </p>
                        </div>

                        <div className="card p-6 text-center">
                            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-chart-line text-white text-xl"></i>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Tracking</h3>
                            <p className="text-gray-600 text-sm">
                                Monitor your progress with live updates and performance analytics.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Stats Section */}
            <section className="py-20 bg-gradient-to-r from-primary-600 to-blue-700 relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary-600 to-blue-700"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-black opacity-10"></div>
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-white opacity-10 rounded-full animate-pulse"></div>
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white opacity-10 rounded-full animate-pulse animation-delay-2000"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fade-in-up">
                            Trusted by Thousands
                        </h2>
                        <p className="text-xl text-primary-100 mb-8 animate-fade-in-up animation-delay-200">
                            Join our growing community of smart investors planning their future
                        </p>
                    </div>

                    {/* Animated Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        {[
                            { number: '50K+', label: 'Active Users', icon: 'fa-users' },
                            { number: '₹2.5Cr+', label: 'Assets Managed', icon: 'fa-rupee-sign' },
                            { number: '99.9%', label: 'Uptime', icon: 'fa-shield-alt' }
                        ].map((stat, index) => (
                            <div
                                key={index}
                                className="text-center animate-fade-in-up"
                                style={{ animationDelay: `${index * 200}ms` }}
                            >
                                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition-transform duration-300">
                                    <i className={`fas ${stat.icon} text-white text-2xl`}></i>
                                </div>
                                <div className="text-4xl font-bold text-white mb-2 animate-count-up">
                                    {stat.number}
                                </div>
                                <div className="text-primary-100 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="text-center animate-fade-in-up animation-delay-400">
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            Ready to Secure Your Retirement?
                        </h3>
                        <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
                            Join thousands of users who trust our AI-powered platform for their financial future.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/login"
                                className="btn bg-white text-primary-600 hover:bg-gray-50 text-lg px-8 py-4 transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
                            >
                                <i className="fas fa-play mr-2"></i>
                                Try Demo Now
                            </Link>
                            <Link
                                to="/registration"
                                className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-4 transform hover:scale-105 transition-all duration-300"
                            >
                                <i className="fas fa-rocket mr-2"></i>
                                Start Planning Today
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 to-gray-800"></div>
                    <div className="absolute top-10 right-10 w-32 h-32 bg-primary-600 opacity-10 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-10 left-10 w-24 h-24 bg-blue-600 opacity-10 rounded-full animate-pulse animation-delay-2000"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="animate-fade-in-up">
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center animate-pulse-glow">
                                    <i className="fas fa-chart-line text-white text-sm"></i>
                                </div>
                                <span className="text-xl font-bold">FinAI</span>
                            </div>
                            <p className="text-gray-400 mb-4">
                                Empowering your financial future with AI-driven retirement planning.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors duration-300">
                                    <i className="fab fa-facebook-f"></i>
                                </a>
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors duration-300">
                                    <i className="fab fa-twitter"></i>
                                </a>
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors duration-300">
                                    <i className="fab fa-linkedin-in"></i>
                                </a>
                            </div>
                        </div>
                        <div className="animate-fade-in-up animation-delay-200">
                            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2">
                                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center"><i className="fas fa-home mr-2"></i>Home</Link></li>
                                <li><Link to="/registration" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center"><i className="fas fa-user-plus mr-2"></i>Register</Link></li>
                                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center"><i className="fas fa-sign-in-alt mr-2"></i>Login</Link></li>
                                <li><Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center"><i className="fas fa-chart-pie mr-2"></i>Dashboard</Link></li>
                            </ul>
                        </div>
                        <div className="animate-fade-in-up animation-delay-400">
                            <h4 className="text-lg font-semibold mb-4">Support</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center"><i className="fas fa-question-circle mr-2"></i>Help Center</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center"><i className="fas fa-envelope mr-2"></i>Contact Us</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center"><i className="fas fa-shield-alt mr-2"></i>Privacy Policy</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center"><i className="fas fa-file-contract mr-2"></i>Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center animate-fade-in-up animation-delay-600">
                        <p className="text-gray-400">&copy; 2024 FinAI. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <div className="flex flex-col space-y-3">
                    <Link
                        to="/dashboard"
                        className="w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-700 transform hover:scale-110 transition-all duration-300 animate-float"
                        title="Quick Start Planning"
                    >
                        <i className="fas fa-rocket text-xl"></i>
                    </Link>
                    <Link
                        to="/login"
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary-600 shadow-lg hover:bg-primary-50 transform hover:scale-110 transition-all duration-300 animate-float animation-delay-200"
                        title="Login"
                    >
                        <i className="fas fa-sign-in-alt"></i>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
