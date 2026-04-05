import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Target, TrendingUp, DollarSign, User, Clock, Lightbulb } from 'lucide-react';
import retirementAPI from '../services/api';
import { useProfileSync } from '../hooks/useProfileSync';

const RetirementPlanning = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Basic Information
    age: '',
    retirement_age: '',
    
    // Financial Information (Indian Context)
    annual_income: '',
    monthly_expenses: '',
    current_savings: '',
    monthly_savings: '',
    
    // Retirement Goals
    retirement_goal: '',
    expected_inflation: 6.0, // Indian inflation rate
    expected_returns: 8.0,   // Indian market returns
    
    // Indian Investment Options
    employer_pf: 12,        // Default EPF contribution
    epf_balance: '',
    ppf_balance: '',
    nps_balance: '',
    other_income: ''
  });

  const [errors, setErrors] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResults, setCalculationResults] = useState(null);
  const USER_ID = localStorage.getItem('incuverse_user_id') || 'user_demo_001';
const { forceSave } = useProfileSync(USER_ID, formData, setFormData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic Information Validation
    if (!formData.age || formData.age < 18 || formData.age > 100) {
      newErrors.age = 'Please enter a valid age (18-100)';
    }
    if (!formData.retirement_age || formData.retirement_age < 50 || formData.retirement_age > 100) {
      newErrors.retirement_age = 'Please enter a valid retirement age (50-100)';
    }
    if (formData.age && formData.retirement_age && parseInt(formData.retirement_age) <= parseInt(formData.age)) {
      newErrors.retirement_age = 'Retirement age must be greater than current age';
    }

    // Financial Information Validation
    if (!formData.annual_income || formData.annual_income < 0) {
      newErrors.annual_income = 'Please enter a valid annual income';
    }
    if (!formData.monthly_expenses || formData.monthly_expenses < 0) {
      newErrors.monthly_expenses = 'Please enter valid monthly expenses';
    }
    if (!formData.current_savings || formData.current_savings < 0) {
      newErrors.current_savings = 'Please enter valid current savings amount';
    }
    if (!formData.monthly_savings || formData.monthly_savings < 0) {
      newErrors.monthly_savings = 'Please enter valid monthly savings amount';
    }
    if (!formData.retirement_goal || formData.retirement_goal < 0) {
      newErrors.retirement_goal = 'Please enter a valid retirement goal';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsCalculating(true);
      try {
        // Call the backend API for analysis
        const analysisResult = await retirementAPI.analyzeRetirement(formData);
        const strategiesResult = await retirementAPI.getStrategies(formData);
        
        setCalculationResults({
          analysis: analysisResult,
          strategies: strategiesResult
        });

        // Save user plan to localStorage
        const newPlan = {
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          title: `Retirement Plan - ${new Date().toLocaleDateString()}`,
          monthlyIncome: parseFloat(formData.annual_income) / 12,
          retirementAge: parseInt(formData.retirement_age),
          targetCorpus: parseFloat(formData.retirement_goal),
          monthlySavings: parseFloat(formData.monthly_savings),
          currentAge: parseInt(formData.age),
          expectedReturns: parseFloat(formData.expected_returns),
          expectedInflation: parseFloat(formData.expected_inflation),
          status: 'Completed',
          result: analysisResult.projection?.readiness_percentage >= 100 ? 'Excellent' :
                  analysisResult.projection?.readiness_percentage >= 80 ? 'On Track' : 'Needs Adjustment',
          analysis: analysisResult,
          strategies: strategiesResult
        };

        // Get existing plans from localStorage
        const existingPlans = JSON.parse(localStorage.getItem('userRetirementPlans') || '[]');
        const updatedPlans = [newPlan, ...existingPlans].slice(0, 10); // Keep only last 10 plans
        localStorage.setItem('userRetirementPlans', JSON.stringify(updatedPlans));
        
        // Navigate to results page with data
        navigate('/results', { 
          state: { 
            formData, 
            analysis: analysisResult.analysis, 
            projection: analysisResult.projection,
            strategies: strategiesResult 
          } 
        });
      } catch (error) {
        console.error('Error calculating retirement plan:', error);
        alert('Error calculating retirement plan. Please try again.');
      } finally {
        setIsCalculating(false);
      }
    }
  };

  const handleReset = () => {
    setFormData({
      age: '',
      retirement_age: '',
      annual_income: '',
      monthly_expenses: '',
      current_savings: '',
      monthly_savings: '',
      retirement_goal: '',
      expected_inflation: 6.0,
      expected_returns: 8.0,
      employer_pf: 12,
      epf_balance: '',
      ppf_balance: '',
      nps_balance: '',
      other_income: ''
    });
    setErrors({});
    setCalculationResults(null);
  };

  const loadSampleData = () => {
    setFormData({
      age: 30,
      retirement_age: 60,
      annual_income: 1200000, // ₹12 LPA (Indian middle class)
      monthly_expenses: 60000, // ₹60k monthly expenses
      current_savings: 500000, // ₹5L current savings
      monthly_savings: 25000, // ₹25k monthly savings
      retirement_goal: 50000000, // ₹5 crores retirement goal
      expected_inflation: 6.0,
      expected_returns: 8.0,
      employer_pf: 12,
      epf_balance: 200000,
      ppf_balance: 100000,
      nps_balance: 50000,
      other_income: 0
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Calculator className="mr-3 text-primary-600" />
            FinAI - India
          </h1>
          <p className="text-gray-600">Enter your financial details to get AI-powered retirement recommendations tailored for Indian salaried professionals</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <User className="mr-3 text-primary-600" />
                    Basic Information
                  </h2>
                </div>
                <div className="card-body space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="age" className="form-label">
                        Current Age *
                      </label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        className={`form-input ${errors.age ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                        placeholder="Enter your current age"
                        min="18"
                        max="100"
                      />
                      {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="retirement_age" className="form-label">
                        Target Retirement Age *
                      </label>
                      <input
                        type="number"
                        id="retirement_age"
                        name="retirement_age"
                        value={formData.retirement_age}
                        onChange={handleChange}
                        className={`form-input ${errors.retirement_age ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                        placeholder="Enter retirement age"
                        min="50"
                        max="100"
                      />
                      {errors.retirement_age && <p className="text-red-500 text-sm mt-1">{errors.retirement_age}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <DollarSign className="mr-3 text-primary-600" />
                    Financial Information (₹)
                  </h2>
                </div>
                <div className="card-body space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="annual_income" className="form-label">
                        Annual Income (₹) *
                      </label>
                      <input
                        type="number"
                        id="annual_income"
                        name="annual_income"
                        value={formData.annual_income}
                        onChange={handleChange}
                        className={`form-input ${errors.annual_income ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                        placeholder="Enter your annual income"
                        min="0"
                      />
                      {errors.annual_income && <p className="text-red-500 text-sm mt-1">{errors.annual_income}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="monthly_expenses" className="form-label">
                        Monthly Expenses (₹) *
                      </label>
                      <input
                        type="number"
                        id="monthly_expenses"
                        name="monthly_expenses"
                        value={formData.monthly_expenses}
                        onChange={handleChange}
                        className={`form-input ${errors.monthly_expenses ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                        placeholder="Enter your monthly expenses"
                        min="0"
                      />
                      {errors.monthly_expenses && <p className="text-red-500 text-sm mt-1">{errors.monthly_expenses}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="current_savings" className="form-label">
                        Current Savings (₹) *
                      </label>
                      <input
                        type="number"
                        id="current_savings"
                        name="current_savings"
                        value={formData.current_savings}
                        onChange={handleChange}
                        className={`form-input ${errors.current_savings ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                        placeholder="Enter your current savings"
                        min="0"
                      />
                      {errors.current_savings && <p className="text-red-500 text-sm mt-1">{errors.current_savings}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="monthly_savings" className="form-label">
                        Monthly Savings (₹) *
                      </label>
                      <input
                        type="number"
                        id="monthly_savings"
                        name="monthly_savings"
                        value={formData.monthly_savings}
                        onChange={handleChange}
                        className={`form-input ${errors.monthly_savings ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                        placeholder="Enter your monthly savings"
                        min="0"
                      />
                      {errors.monthly_savings && <p className="text-red-500 text-sm mt-1">{errors.monthly_savings}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Retirement Goals */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Target className="mr-3 text-primary-600" />
                    Retirement Goals
                  </h2>
                </div>
                <div className="card-body space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="retirement_goal" className="form-label">
                        Target Retirement Corpus (₹) *
                      </label>
                      <input
                        type="number"
                        id="retirement_goal"
                        name="retirement_goal"
                        value={formData.retirement_goal}
                        onChange={handleChange}
                        className={`form-input ${errors.retirement_goal ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                        placeholder="Enter your retirement goal"
                        min="0"
                      />
                      {errors.retirement_goal && <p className="text-red-500 text-sm mt-1">{errors.retirement_goal}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="expected_returns" className="form-label">
                        Expected Annual Returns (%)
                      </label>
                      <input
                        type="number"
                        id="expected_returns"
                        name="expected_returns"
                        value={formData.expected_returns}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Expected returns"
                        min="0"
                        max="20"
                        step="0.1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expected_inflation" className="form-label">
                        Expected Inflation Rate (%)
                      </label>
                      <input
                        type="number"
                        id="expected_inflation"
                        name="expected_inflation"
                        value={formData.expected_inflation}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Expected inflation"
                        min="0"
                        max="10"
                        step="0.1"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="other_income" className="form-label">
                        Other Retirement Income (₹)
                      </label>
                      <input
                        type="number"
                        id="other_income"
                        name="other_income"
                        value={formData.other_income}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Pension, rental income, etc."
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={isCalculating}
                  className="btn btn-primary flex-1"
                >
                  {isCalculating ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2" />
                      Analyze Retirement Plan
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn-outline flex-1"
                >
                  <i className="fas fa-undo mr-2"></i>
                  Reset Form
                </button>
                <button
  type="button"
  onClick={async () => {
    const res = await forceSave();
    if (res?.success) alert('Profile saved to cloud ✓');
  }}
  className="btn btn-secondary flex-1"
>
  💾 Save Profile
</button>
                <button
                  type="button"
                  onClick={loadSampleData}
                  className="btn btn-secondary flex-1"
                >
                  <Lightbulb className="mr-2" />
                  Load Sample Data
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Tips */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Lightbulb className="mr-2 text-primary-600" />
                  Indian Retirement Tips
                </h3>
              </div>
              <div className="card-body">
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                    <span>Maximize EPF contributions for tax benefits and guaranteed returns</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                    <span>Consider PPF for long-term tax-free growth (15-year lock-in)</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                    <span>Use NPS for additional tax benefits under Section 80CCD</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                    <span>Diversify with SIPs in equity mutual funds for higher returns</span>
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                    <span>Plan for Indian inflation rates (typically 6-7% annually)</span>
                  </li>
                </ul>
              </div>
            </div>


            {/* Help & Support */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <i className="fas fa-question-circle text-primary-600 mr-2"></i>
                  AI Analysis
                </h3>
              </div>
              <div className="card-body">
                <p className="text-sm text-gray-600 mb-4">
                  FinAI will analyze your financial situation and provide personalized retirement recommendations tailored for Indian salaried professionals.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="fas fa-robot text-primary-600 mr-2"></i>
                    <span>FinAI-powered analysis</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="fas fa-chart-line text-primary-600 mr-2"></i>
                    <span>Indian market insights</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="fas fa-shield-alt text-primary-600 mr-2"></i>
                    <span>Tax optimization strategies</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetirementPlanning;
