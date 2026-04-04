import React from 'react';
import { Link } from 'react-router-dom';

const OnboardingGuide = ({ userPlans = [] }) => {
  if (userPlans.length > 0) {
    return null; // Don't show onboarding if user has plans
  }

  return (
    <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="card-body">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="fas fa-rocket text-blue-600 text-xl"></i>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Welcome to FinAI! 🎉
            </h3>
            <p className="text-gray-700 mb-4">
              You're all set to start planning your retirement! Our AI-powered platform will help you create personalized retirement strategies tailored for Indian professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/planning" className="btn btn-primary">
                <i className="fas fa-calculator mr-2"></i>
                Start Planning
              </Link>
              <button className="btn btn-outline">
                <i className="fas fa-info-circle mr-2"></i>
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingGuide;
