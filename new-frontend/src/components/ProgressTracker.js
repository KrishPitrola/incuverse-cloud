import React from 'react';

const ProgressTracker = ({ 
  currentStep, 
  totalSteps, 
  steps = [], 
  className = '' 
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Progress: {currentStep} of {totalSteps} steps
        </span>
        <span className="text-sm text-gray-500">
          {Math.round(progressPercentage)}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      {steps.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`flex flex-col items-center ${
                  index < currentStep ? 'text-primary-600' : 
                  index === currentStep ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-1 ${
                  index < currentStep ? 'bg-primary-600 text-white' :
                  index === currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                  {index < currentStep ? '✓' : index + 1}
                </div>
                <span className="text-xs text-center max-w-16">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const RetirementProgress = ({ userPlans = [] }) => {
  const steps = [
    'Profile',
    'Income',
    'Goals',
    'Analysis',
    'Strategy'
  ];

  const currentStep = userPlans.length > 0 ? 5 : 0;
  const totalSteps = 5;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <i className="fas fa-chart-line text-primary-600 mr-2"></i>
          Retirement Planning Progress
        </h3>
      </div>
      <div className="card-body">
        <ProgressTracker 
          currentStep={currentStep}
          totalSteps={totalSteps}
          steps={steps}
        />
        
        {userPlans.length === 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <i className="fas fa-info-circle mr-2"></i>
              Complete your first retirement plan to unlock personalized insights and track your progress.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;
