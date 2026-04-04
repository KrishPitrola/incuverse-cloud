import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CardSkeleton } from '../components/LoadingSpinner';
import { RetirementProgress } from '../components/ProgressTracker';
import OnboardingGuide from '../components/OnboardingGuide';
import DemoChatbot, { ChatButton } from '../components/DemoChatbot';
import PDFReportGenerator from '../components/PDFReportGenerator';

const Dashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [userPlans, setUserPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showChat, setShowChat] = useState(false);

    // Load user's retirement planning history from localStorage
    useEffect(() => {
        const loadUserPlans = () => {
            try {
                const savedPlans = localStorage.getItem('userRetirementPlans');
                if (savedPlans) {
                    const plans = JSON.parse(savedPlans);
                    setUserPlans(plans);
                } else {
                    // Initialize with empty array if no plans exist
                    setUserPlans([]);
                }
            } catch (error) {
                console.error('Error loading user plans:', error);
                setUserPlans([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserPlans();
    }, []);

    // Use only user's actual plans - no static data
    const planningHistory = userPlans;

    // Export user data - now with PDF option
    const handleExportData = async (format = 'json') => {
        if (format === 'pdf') {
            // Generate PDF report for the most recent plan
            const latestPlan = planningHistory[0];
            if (latestPlan) {
                try {
                    await PDFReportGenerator.downloadReport(
                        latestPlan.formData,
                        latestPlan.analysis,
                        latestPlan.projection,
                        latestPlan.strategies,
                        latestPlan.simulationResults
                    );
                } catch (error) {
                    console.error('Error generating PDF:', error);
                    alert('Error generating PDF report. Please try again.');
                }
            } else {
                alert('No retirement plans found. Please create a plan first.');
            }
        } else {
            // Original JSON export functionality
            const exportData = {
                user: user,
                plans: planningHistory,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `retirement-data-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
        }
    };

    // Generate dynamic activity based on user plans
    const generateRecentActivity = () => {
        if (planningHistory.length === 0) {
            return [
                {
                    id: 1,
                    type: 'welcome',
                    title: 'Welcome to FinAI!',
                    description: 'Complete your first retirement plan to get started',
                    date: 'Just now',
                    icon: 'fa-rocket'
                }
            ];
        }

        const activities = [];
        
        // Add activities for each plan
        planningHistory.slice(0, 3).forEach((plan, index) => {
            activities.push({
                id: `plan-${plan.id}`,
                type: 'calculation',
                title: 'Retirement Plan Created',
                description: `${plan.title} with ₹${(plan.targetCorpus / 10000000).toFixed(1)} Cr target`,
                date: plan.date,
                icon: 'fa-calculator'
            });
        });

        // Add welcome activity if no plans
        if (activities.length === 0) {
            activities.push({
                id: 'welcome',
                type: 'welcome',
                title: 'Welcome to FinAI!',
                description: 'Start planning your retirement to see activity here',
                date: 'Just now',
                icon: 'fa-rocket'
            });
        }

        return activities;
    };

    const recentActivity = generateRecentActivity();

    // Calculate dynamic stats based on user data
    const calculateStats = () => {
        const totalPlans = planningHistory.length;
        const avgMonthlySIP = planningHistory.length > 0 
            ? Math.round(planningHistory.reduce((sum, plan) => sum + (plan.monthlyIncome || 0), 0) / planningHistory.length)
            : 0;
        const avgTargetCorpus = planningHistory.length > 0 
            ? Math.round(planningHistory.reduce((sum, plan) => sum + (plan.targetCorpus || 0), 0) / planningHistory.length)
            : 0;
        const successRate = planningHistory.length > 0 
            ? Math.round((planningHistory.filter(plan => plan.result === 'Excellent' || plan.result === 'On Track').length / planningHistory.length) * 100)
            : 0;

        return {
            totalPlans,
            avgMonthlySIP,
            avgTargetCorpus,
            successRate
        };
    };

    const stats = calculateStats();

    const quickStats = [
        {
            title: 'Total Plans',
            value: stats.totalPlans.toString(),
            change: stats.totalPlans > 0 ? 'Active plans' : 'No plans yet',
            icon: 'fa-chart-line',
            color: 'blue'
        },
        {
            title: 'Avg. Monthly Income',
            value: stats.avgMonthlySIP > 0 ? `₹${stats.avgMonthlySIP.toLocaleString('en-IN')}` : '₹0',
            change: stats.avgMonthlySIP > 0 ? 'Based on your plans' : 'Start planning',
            icon: 'fa-piggy-bank',
            color: 'green'
        },
        {
            title: 'Avg. Target Corpus',
            value: stats.avgTargetCorpus > 0 ? `₹${(stats.avgTargetCorpus / 10000000).toFixed(1)} Cr` : '₹0 Cr',
            change: stats.avgTargetCorpus > 0 ? 'Your goals' : 'Set your goals',
            icon: 'fa-bullseye',
            color: 'purple'
        },
        {
            title: 'Success Rate',
            value: `${stats.successRate}%`,
            change: stats.successRate > 0 ? 'Plan performance' : 'Start planning',
            icon: 'fa-trophy',
            color: 'orange'
        }
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <CardSkeleton key={index} />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <CardSkeleton />
                        <CardSkeleton />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Welcome back, {user?.firstName || 'User'}!
                            </h1>
                            <p className="text-gray-600">Your retirement planning dashboard</p>
                        </div>
                        <div className="flex space-x-3">
                            <Link to="/planning" className="btn btn-primary">
                                <i className="fas fa-plus mr-2"></i>
                                New Plan
                            </Link>
                            <div className="relative group">
                                <button 
                                    onClick={() => handleExportData('json')}
                                    className="btn btn-outline"
                                >
                                    <i className="fas fa-download mr-2"></i>
                                    Export Data
                                </button>
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    <div className="py-1">
                                        <button
                                            onClick={() => handleExportData('json')}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <i className="fas fa-file-code mr-2"></i>
                                            Export as JSON
                                        </button>
                                        <button
                                            onClick={() => handleExportData('pdf')}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <i className="fas fa-file-pdf mr-2"></i>
                                            Export as PDF Report
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {quickStats.map((stat, index) => (
                        <div key={index} className="card">
                            <div className="card-body">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                        <p className="text-sm text-green-600">{stat.change}</p>
                                    </div>
                                    <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                                        <i className={`fas ${stat.icon} text-${stat.color}-600 text-xl`}></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="mb-8">
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                        {[
                            { id: 'overview', label: 'Overview', icon: 'fa-chart-pie' },
                            { id: 'history', label: 'Planning History', icon: 'fa-history' },
                            { id: 'activity', label: 'Recent Activity', icon: 'fa-clock' },
                            { id: 'profile', label: 'Profile', icon: 'fa-user' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <i className={`fas ${tab.icon} mr-2`}></i>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Onboarding Guide for New Users */}
                        <OnboardingGuide userPlans={userPlans} />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Current Plan Summary */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {planningHistory.length > 0 ? 'Latest Retirement Plan' : 'Start Your Retirement Planning'}
                                </h3>
                            </div>
                            <div className="card-body">
                                {planningHistory.length > 0 ? (
                                    <div className="space-y-4">
                                        {(() => {
                                            const latestPlan = planningHistory[0];
                                            return (
                                                <>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600">Target Corpus</span>
                                                        <span className="font-semibold text-gray-900">
                                                            ₹{(latestPlan.targetCorpus / 10000000).toFixed(1)} Cr
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600">Monthly Income</span>
                                                        <span className="font-semibold text-gray-900">
                                                            ₹{latestPlan.monthlyIncome?.toLocaleString('en-IN') || 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600">Retirement Age</span>
                                                        <span className="font-semibold text-gray-900">
                                                            {latestPlan.retirementAge} years
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600">Status</span>
                                                        <span className={`font-semibold ${
                                                            latestPlan.result === 'Excellent' ? 'text-green-600' :
                                                            latestPlan.result === 'On Track' ? 'text-blue-600' :
                                                            'text-yellow-600'
                                                        }`}>
                                                            {latestPlan.result}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                                                        <div 
                                                            className={`h-2 rounded-full ${
                                                                latestPlan.result === 'Excellent' ? 'bg-green-600' :
                                                                latestPlan.result === 'On Track' ? 'bg-blue-600' :
                                                                'bg-yellow-600'
                                                            }`}
                                                            style={{ 
                                                                width: latestPlan.result === 'Excellent' ? '100%' :
                                                                       latestPlan.result === 'On Track' ? '75%' : '50%'
                                                            }}
                                                        ></div>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <i className="fas fa-chart-line text-primary-600 text-2xl"></i>
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">No Plans Yet</h4>
                                        <p className="text-gray-600 mb-4">Start planning your retirement to see personalized insights here.</p>
                                        <Link to="/planning" className="btn btn-primary">
                                            <i className="fas fa-plus mr-2"></i>
                                            Create Your First Plan
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Progress Tracker */}
                        <RetirementProgress userPlans={userPlans} />
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-lg font-semibold text-gray-900">Planning History</h3>
                        </div>
                        <div className="card-body">
                            {planningHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {planningHistory.map((plan) => (
                                        <div key={plan.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{plan.title}</h4>
                                                    <p className="text-sm text-gray-600">Created on {plan.date}</p>
                                                    <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                                                        <span>Income: ₹{plan.monthlyIncome?.toLocaleString('en-IN') || 'N/A'}</span>
                                                        <span>Retirement: {plan.retirementAge} years</span>
                                                        <span>Target: ₹{(plan.targetCorpus / 10000000).toFixed(1)} Cr</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${plan.result === 'Excellent' ? 'bg-green-100 text-green-800' :
                                                        plan.result === 'On Track' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {plan.result}
                                                    </span>
                                                    <div className="mt-2">
                                                        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                                                            View Details
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i className="fas fa-history text-gray-400 text-2xl"></i>
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Planning History</h4>
                                    <p className="text-gray-600 mb-6">You haven't created any retirement plans yet. Start planning to see your history here.</p>
                                    <Link to="/planning" className="btn btn-primary">
                                        <i className="fas fa-plus mr-2"></i>
                                        Create Your First Plan
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                        </div>
                        <div className="card-body">
                            {recentActivity.length > 0 ? (
                                <div className="space-y-4">
                                    {recentActivity.map((activity) => (
                                        <div key={activity.id} className="flex items-start space-x-3">
                                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <i className={`fas ${activity.icon} text-primary-600`}></i>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900">{activity.title}</h4>
                                                <p className="text-sm text-gray-600">{activity.description}</p>
                                                <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i className="fas fa-clock text-gray-400 text-2xl"></i>
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Recent Activity</h4>
                                    <p className="text-gray-600 mb-4">Start creating retirement plans to see your activity here.</p>
                                    <Link to="/planning" className="btn btn-primary">
                                        <i className="fas fa-plus mr-2"></i>
                                        Create Your First Plan
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* User Profile */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                            </div>
                            <div className="card-body">
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                                        <i className="fas fa-user text-primary-600 text-2xl"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{user?.firstName} {user?.lastName || 'User'}</h4>
                                        <p className="text-gray-600">{user?.email || 'user@example.com'}</p>
                                        <p className="text-sm text-gray-500">Member since {new Date().getFullYear()}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Email Verified</span>
                                        <span className="text-green-600 font-medium">✓ Verified</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Account Status</span>
                                        <span className="text-green-600 font-medium">Active</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Last Login</span>
                                        <span className="text-gray-900">Today</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Settings */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
                            </div>
                            <div className="card-body">
                                <div className="space-y-4">
                                    <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Personal Information</h4>
                                                <p className="text-sm text-gray-600">Update your profile details</p>
                                            </div>
                                            <i className="fas fa-chevron-right text-gray-400"></i>
                                        </div>
                                    </button>
                                    <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Security Settings</h4>
                                                <p className="text-sm text-gray-600">Change password and security</p>
                                            </div>
                                            <i className="fas fa-chevron-right text-gray-400"></i>
                                        </div>
                                    </button>
                                    <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Notifications</h4>
                                                <p className="text-sm text-gray-600">Manage your notification preferences</p>
                                            </div>
                                            <i className="fas fa-chevron-right text-gray-400"></i>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Chatbot Components */}
            {!showChat && <ChatButton onClick={() => setShowChat(true)} />}
            {showChat && <DemoChatbot userContext={userPlans} onClose={() => setShowChat(false)} />}
        </div>
    );
};

export default Dashboard;