import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Target, 
  AlertCircle, 
  CheckCircle, 
  DollarSign, 
  Calendar,
  BarChart3,
  Lightbulb,
  ArrowLeft,
  RefreshCw,
  Download,
  Share2,
  FileText,
  MessageCircle
} from 'lucide-react';
import retirementAPI from '../services/api';
import Chart from 'chart.js/auto';
import PDFReportGenerator from '../components/PDFReportGenerator';
import DemoChatbot, { ChatButton } from '../components/DemoChatbot';

// Add custom styles for sliders
const sliderStyles = `
  .slider {
    -webkit-appearance: none;
    appearance: none;
    height: 8px;
    border-radius: 5px;
    outline: none;
    transition: all 0.3s ease;
  }
  
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
  }
  
  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
  
  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }
  
  .slider::-moz-range-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = sliderStyles;
  document.head.appendChild(styleSheet);
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formData, analysis, strategies, projection } = location.state || {};
  
  const [isLoading, setIsLoading] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [simulationParams, setSimulationParams] = useState({
    monthlySavings: 25000,
    retirementAge: 60,
    conservativeMultiplier: 0.8,
    aggressiveMultiplier: 1.2
  });
  const chartRefs = useRef({});
  const updateTimeoutRef = useRef(null);

  // If no data is passed, redirect back to planning
  useEffect(() => {
    if (!formData || !analysis || !projection) {
      navigate('/planning');
    }
  }, [formData, analysis, projection, navigate]);

  // Cleanup charts and timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(chartRefs.current).forEach(chart => {
        if (chart) chart.destroy();
      });
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // Show loading state if data is not ready
  if (!formData || !analysis || !projection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900">Loading results...</h3>
        </div>
      </div>
    );
  }

  // Debug log to help with troubleshooting
  console.log('Results component rendered with:', {
    hasFormData: !!formData,
    hasAnalysis: !!analysis,
    hasProjection: !!projection,
    showChat,
    isGeneratingPDF
  });

  // Test PDFReportGenerator availability
  console.log('PDFReportGenerator available:', !!PDFReportGenerator);
  console.log('DemoChatbot available:', !!DemoChatbot);

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '₹0';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.0%';
    }
    return `${value.toFixed(1)}%`;
  };

  const getReadinessColor = (percentage) => {
    if (percentage === undefined || percentage === null || isNaN(percentage)) {
      return 'text-gray-600';
    }
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReadinessStatus = (percentage) => {
    if (percentage === undefined || percentage === null || isNaN(percentage)) {
      return 'Calculating...';
    }
    if (percentage >= 100) return 'Excellent';
    if (percentage >= 80) return 'Good';
    if (percentage >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  const runSimulation = async (customParams = null) => {
    if (!formData) return;
    
    setIsLoading(true);
    setIsUpdating(false);
    try {
      // Use custom parameters if provided, otherwise use current simulation params
      const params = customParams || simulationParams;
      
      // Create modified form data with simulation parameters
      const modifiedFormData = {
        ...formData,
        monthly_savings: params.monthlySavings,
        retirement_age: params.retirementAge
      };
      
      const result = await retirementAPI.simulateScenario(modifiedFormData);
      setSimulationResults(result);
      
      // Render charts after a short delay to ensure DOM is ready
      setTimeout(() => {
        if (result.chart_data) {
          renderCharts(result.chart_data);
        }
      }, 100);
    } catch (error) {
      console.error('Error running simulation:', error);
      alert('Error running simulation. Please try again.');
    } finally {
      setIsLoading(false);
      setIsUpdating(false);
    }
  };

  const handleParameterChange = (param, value) => {
    const newParams = { ...simulationParams, [param]: value };
    setSimulationParams(newParams);
    
    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Set loading state
    setIsUpdating(true);
    
    // Debounce the simulation update
    updateTimeoutRef.current = setTimeout(() => {
      runSimulation(newParams);
    }, 500); // 500ms delay for debouncing
  };

  const handleSliderChange = (param, value) => {
    handleParameterChange(param, parseInt(value));
  };

  // Generate and download PDF report
  const handleGeneratePDF = async () => {
    console.log('PDF generation started...');
    setIsGeneratingPDF(true);
    try {
      console.log('Calling PDFReportGenerator.downloadReport with:', {
        formData: !!formData,
        analysis: !!analysis,
        projection: !!projection,
        strategies: !!strategies,
        simulationResults: !!simulationResults
      });
      
      await PDFReportGenerator.downloadReport(
        formData,
        analysis,
        projection,
        strategies,
        simulationResults
      );
      
      console.log('PDF generation completed successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const renderCharts = (chartData) => {
    // Destroy existing charts
    Object.values(chartRefs.current).forEach(chart => {
      if (chart) chart.destroy();
    });
    chartRefs.current = {};

    // 1. Corpus Comparison Chart
    const corpusCtx = document.getElementById('corpusChart');
    if (corpusCtx) {
      chartRefs.current.corpus = new Chart(corpusCtx, {
        type: 'bar',
        data: {
          labels: chartData.labels,
          datasets: [{
            label: 'Final Corpus (₹ Cr)',
            data: chartData.corpus_values.map(v => v / 10000000),
            backgroundColor: chartData.colors,
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => '₹' + ctx.parsed.y.toFixed(2) + ' Cr'
              }
            }
          },
          scales: {
            y: { 
              beginAtZero: true,
              title: { display: true, text: 'Corpus (₹ Crores)' }
            }
          }
        }
      });
    }

    // 2. Adequacy Chart
    const adequacyCtx = document.getElementById('adequacyChart');
    if (adequacyCtx) {
      chartRefs.current.adequacy = new Chart(adequacyCtx, {
        type: 'bar',
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: 'Final Corpus',
              data: chartData.corpus_values.map(v => v / 10000000),
              backgroundColor: '#10b981'
            },
            {
              label: 'Required Corpus',
              data: chartData.required_corpus.map(v => v / 10000000),
              backgroundColor: '#ef4444'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: ctx => ctx.dataset.label + ': ₹' + ctx.parsed.y.toFixed(2) + ' Cr'
              }
            }
          },
          scales: {
            y: { 
              beginAtZero: true,
              title: { display: true, text: 'Amount (₹ Crores)' }
            }
          }
        }
      });
    }

    // 3. Monthly Pension Chart
    const pensionCtx = document.getElementById('pensionChart');
    if (pensionCtx) {
      chartRefs.current.pension = new Chart(pensionCtx, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: [{
            label: 'Monthly Pension (₹)',
            data: chartData.monthly_pension,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: ctx => '₹' + ctx.parsed.y.toLocaleString('en-IN') + '/month'
              }
            }
          },
          scales: {
            y: { 
              beginAtZero: true,
              title: { display: true, text: 'Monthly Amount (₹)' }
            }
          }
        }
      });
    }

    // 4. Wealth Creation Chart
    const wealthCtx = document.getElementById('wealthChart');
    if (wealthCtx) {
      chartRefs.current.wealth = new Chart(wealthCtx, {
        type: 'bar',
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: 'Your Investment',
              data: chartData.total_invested.map(v => v / 10000000),
              backgroundColor: '#f59e0b'
            },
            {
              label: 'Returns Generated',
              data: chartData.wealth_created.map(v => v / 10000000),
              backgroundColor: '#10b981'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                label: ctx => ctx.dataset.label + ': ₹' + ctx.parsed.y.toFixed(2) + ' Cr'
              }
            }
          },
          scales: {
            x: { stacked: true },
            y: { 
              stacked: true,
              beginAtZero: true,
              title: { display: true, text: 'Amount (₹ Crores)' }
            }
          }
        }
      });
    }
  };

  if (!formData || !analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
          <p className="mt-1 text-sm text-gray-500">Please go back and complete the retirement planning form.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/planning')}
              className="btn btn-primary"
            >
              <ArrowLeft className="mr-2" />
              Back to Planning
            </button>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <BarChart3 className="mr-3 text-primary-600" />
                FinAI Analysis Results
              </h1>
              <p className="text-gray-600">FinAI-powered insights for your retirement planning</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleGeneratePDF}
                disabled={isGeneratingPDF}
                className="btn btn-primary"
              >
                {isGeneratingPDF ? (
                  <RefreshCw className="mr-2 animate-spin" />
                ) : (
                  <FileText className="mr-2" />
                )}
                {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Report'}
              </button>
              <button
                onClick={() => {
                  console.log('Chat button clicked, current showChat:', showChat);
                  setShowChat(!showChat);
                  console.log('Chat state changed to:', !showChat);
                }}
                className="btn btn-secondary"
              >
                <MessageCircle className="mr-2" />
                {showChat ? 'Close Chat' : 'Open Chat'}
              </button>
              <button
                onClick={() => navigate('/planning')}
                className="btn btn-outline"
              >
                <ArrowLeft className="mr-2" />
                Back to Planning
              </button>
              <button
                onClick={() => {
                  console.log('Test PDF button clicked');
                  // Simple test to verify PDFReportGenerator works
                  try {
                    const testData = {
                      age: 30,
                      retirement_age: 60,
                      monthly_savings: 25000,
                      retirement_goal: 50000000
                    };
                    PDFReportGenerator.downloadReport(testData, {summary: 'Test analysis'}, {readiness_percentage: 75, projected_corpus: 40000000}, {strategies: []}, null);
                  } catch (error) {
                    console.error('Test PDF failed:', error);
                  }
                }}
                className="btn btn-outline"
              >
                Test PDF
              </button>
              <button
                onClick={runSimulation}
                disabled={isLoading}
                className="btn btn-secondary"
              >
                {isLoading ? (
                  <RefreshCw className="mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2" />
                )}
                Run Simulation
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analysis'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analysis
            </button>
            <button
              onClick={() => setActiveTab('strategies')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'strategies'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Strategies
            </button>
            <button
              onClick={() => setActiveTab('simulation')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'simulation'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Simulation
            </button>
          </nav>
        </div>

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card">
                <div className="card-body text-center">
                  <div className={`text-3xl font-bold ${getReadinessColor(projection?.readiness_percentage)}`}>
                    {formatPercentage(projection?.readiness_percentage)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Readiness Score</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {getReadinessStatus(projection?.readiness_percentage)}
                  </div>
                </div>
              </div>
              
              <div className="card">
                <div className="card-body text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(projection?.projected_corpus)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Projected Corpus</div>
                  <div className="text-xs text-gray-500 mt-1">At retirement</div>
                </div>
              </div>
              
              <div className="card">
                <div className="card-body text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(formData.retirement_goal)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Target Goal</div>
                  <div className="text-xs text-gray-500 mt-1">Your target</div>
                </div>
              </div>
              
              <div className="card">
                <div className="card-body text-center">
                  <div className={`text-3xl font-bold ${
                    (projection?.projected_corpus || 0) >= (formData.retirement_goal || 0) ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(Math.abs((projection?.projected_corpus || 0) - (formData.retirement_goal || 0)))}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {(projection?.projected_corpus || 0) >= (formData.retirement_goal || 0) ? 'Surplus' : 'Shortfall'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {(projection?.projected_corpus || 0) >= (formData.retirement_goal || 0) ? 'Above target' : 'Below target'}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Target className="mr-3 text-primary-600" />
                  FinAI Analysis Summary
                </h2>
              </div>
              <div className="card-body">
                <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
              </div>
            </div>

            {/* Key Insights */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Lightbulb className="mr-3 text-primary-600" />
                  Key Insights
                </h2>
              </div>
              <div className="card-body">
                <ul className="space-y-4">
                  {analysis.key_insights?.map((insight, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Risk Factors */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <AlertCircle className="mr-3 text-primary-600" />
                  Risk Factors
                </h2>
              </div>
              <div className="card-body">
                <ul className="space-y-4">
                  {analysis.risk_factors?.map((risk, index) => (
                    <li key={index} className="flex items-start">
                      <AlertCircle className="text-yellow-500 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Strategies Tab */}
        {activeTab === 'strategies' && strategies && (
          <div className="space-y-8">
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="mr-3 text-primary-600" />
                  FinAI-Recommended Strategies
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  Priority: <span className="font-medium text-primary-600">{strategies.overall_priority}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {strategies.strategies?.map((strategy, index) => (
                <div key={index} className="card hover-lift">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900">{strategy.title}</h3>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        strategy.expected_impact === 'High' ? 'bg-red-100 text-red-800' :
                        strategy.expected_impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {strategy.expected_impact} Impact
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        strategy.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        strategy.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {strategy.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="card-body">
                    <p className="text-gray-700 mb-4">{strategy.description}</p>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Expected Benefits:</h4>
                      <p className="text-sm text-gray-600">{strategy.expected_benefits}</p>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Timeframe:</h4>
                      <p className="text-sm text-gray-600">{strategy.timeframe}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Implementation Steps:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                        {strategy.implementation_steps?.map((step, stepIndex) => (
                          <li key={stepIndex}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Implementation Order */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Calendar className="mr-3 text-primary-600" />
                  Recommended Implementation Order
                </h2>
              </div>
              <div className="card-body">
                <ol className="space-y-3">
                  {strategies.implementation_order?.map((strategyTitle, index) => (
                    <li key={index} className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="ml-3 text-gray-700">{strategyTitle}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Simulation Tab */}
        {activeTab === 'simulation' && (
          <div className="space-y-8">
            {/* Interactive Controls */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="mr-3 text-primary-600" />
                  Interactive Retirement Simulator
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  Adjust the sliders below to see how different parameters affect your retirement plan in real-time.
                </p>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Monthly Savings Slider */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-lg font-medium text-gray-900">
                        Monthly Savings (₹)
                      </label>
                      <span className="text-2xl font-bold text-primary-600">
                        {formatCurrency(simulationParams.monthlySavings)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="10000"
                        max="100000"
                        step="1000"
                        value={simulationParams.monthlySavings}
                        onChange={(e) => handleSliderChange('monthlySavings', e.target.value)}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((simulationParams.monthlySavings - 10000) / (100000 - 10000)) * 100}%, #e5e7eb ${((simulationParams.monthlySavings - 10000) / (100000 - 10000)) * 100}%, #e5e7eb 100%)`
                        }}
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>₹10,000</span>
                        <span>₹100,000</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Conservative: {formatCurrency(simulationParams.monthlySavings * simulationParams.conservativeMultiplier)}</p>
                      <p>Aggressive: {formatCurrency(simulationParams.monthlySavings * simulationParams.aggressiveMultiplier)}</p>
                    </div>
                  </div>

                  {/* Retirement Age Slider */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-lg font-medium text-gray-900">
                        Retirement Age
                      </label>
                      <span className="text-2xl font-bold text-primary-600">
                        {simulationParams.retirementAge} years
                      </span>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="40"
                        max="65"
                        step="1"
                        value={simulationParams.retirementAge}
                        onChange={(e) => handleSliderChange('retirementAge', e.target.value)}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #10b981 0%, #10b981 ${((simulationParams.retirementAge - 50) / (70 - 50)) * 100}%, #e5e7eb ${((simulationParams.retirementAge - 50) / (70 - 50)) * 100}%, #e5e7eb 100%)`
                        }}
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>40 years</span>
                        <span>65 years</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Years to save: {simulationParams.retirementAge - formData.age}</p>
                      <p>Conservative: {simulationParams.retirementAge + 2} years</p>
                      <p>Aggressive: {simulationParams.retirementAge - 2} years</p>
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleParameterChange('monthlySavings', 35000)}
                    className="btn btn-outline btn-sm"
                  >
                    Conservative Savings
                  </button>
                  <button
                    onClick={() => handleParameterChange('monthlySavings', 30000)}
                    className="btn btn-outline btn-sm"
                  >
                    Aggressive Savings
                  </button>
                  <button
                    onClick={() => handleParameterChange('monthlySavings', 20000)}
                    className="btn btn-outline btn-sm"
                  >
                    Balanced Savings
                  </button>
                  
                  <button
                    onClick={() => {
                      setSimulationParams({
                        monthlySavings: parseInt(formData.monthly_savings) || 25000,
                        retirementAge: parseInt(formData.retirement_age) || 60,
                        conservativeMultiplier: 0.8,
                        aggressiveMultiplier: 1.2
                      });
                      runSimulation();
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    Reset to Original
                  </button>
                </div>
              </div>
            </div>

            {/* Simulation Results */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="mr-3 text-primary-600" />
                  Real-Time Simulation Results
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  Results update automatically as you adjust the parameters above.
                </p>
              </div>
              <div className="card-body">
                {!simulationResults ? (
                  <div className="text-center py-8">
                    <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No simulation data</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Adjust the sliders above or click "Run Simulation" to generate analysis.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={runSimulation}
                        disabled={isLoading}
                        className="btn btn-primary"
                      >
                        {isLoading ? (
                          <RefreshCw className="mr-2 animate-spin" />
                        ) : (
                          <BarChart3 className="mr-2" />
                        )}
                        Run AI Simulation
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Current Parameters Display */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">Current Simulation Parameters</h3>
                        {isUpdating && (
                          <div className="flex items-center text-sm text-blue-600">
                            <RefreshCw className="mr-2 animate-spin" />
                            Updating...
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary-600">{formatCurrency(simulationParams.monthlySavings)}</div>
                          <div className="text-sm text-gray-600">Monthly Savings</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{simulationParams.retirementAge}</div>
                          <div className="text-sm text-gray-600">Retirement Age</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{simulationParams.retirementAge - formData.age}</div>
                          <div className="text-sm text-gray-600">Years to Save</div>
                        </div>
                      </div>
                    </div>

                    {/* AI Analysis Summary */}
                    {simulationResults.ai_comparison && (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-l-4 border-primary-600">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <Lightbulb className="mr-2 text-primary-600" />
                          FinAI Analysis Summary
                        </h3>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {simulationResults.ai_comparison}
                        </p>
                      </div>
                    )}

                    {/* Recommendations */}
                    {simulationResults.recommendations && simulationResults.recommendations.length > 0 && (
                      <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <Target className="mr-2 text-yellow-600" />
                          Actionable Recommendations
                        </h3>
                        <ul className="space-y-2">
                          {simulationResults.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                              <span className="text-gray-700">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Scenario Comparison Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {simulationResults.scenarios?.map((scenario, index) => (
                        <div key={index} className={`card hover-lift ${scenario.name === simulationResults.best_scenario ? 'ring-2 ring-primary-500' : ''}`}>
                          <div className="card-header">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-gray-900">{scenario.name}</h3>
                              {scenario.name === simulationResults.best_scenario && (
                                <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
                                  RECOMMENDED
                                </span>
                              )}
                            </div>
                            <div className="mt-2">
                              <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full`} style={{backgroundColor: scenario.color + '20', color: scenario.color}}>
                                {scenario.lifestyle}
                              </span>
                            </div>
                          </div>
                          <div className="card-body">
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-sm text-gray-600">Retirement Age</div>
                                  <div className="text-lg font-semibold text-gray-900">{scenario.retirement_age}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-600">Years to Save</div>
                                  <div className="text-lg font-semibold text-gray-900">{scenario.years_to_retirement}</div>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Monthly Savings:</span>
                                  <span className="font-medium">{formatCurrency(scenario.monthly_savings)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Final Corpus:</span>
                                  <span className="font-medium">{formatCurrency(scenario.total_corpus)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Monthly Pension:</span>
                                  <span className="font-medium">{formatCurrency(scenario.monthly_pension)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Adequacy Ratio:</span>
                                  <span className={`font-medium ${scenario.corpus_ratio >= 1.0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {scenario.corpus_ratio}x
                                  </span>
                                </div>
                              </div>

                              <div className="pt-3 border-t">
                                <div className="text-sm text-gray-600 mb-2">Wealth Creation</div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Total Invested:</span>
                                    <span>{formatCurrency(scenario.total_invested)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Returns Generated:</span>
                                    <span className="text-green-600">{formatCurrency(scenario.wealth_created)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Scenario Comparison Table */}
                    <div className="card">
                      <div className="card-header">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <TrendingUp className="mr-2 text-primary-600" />
                          Detailed Scenario Comparison
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Compare all scenarios side by side with key metrics
                        </p>
                      </div>
                      <div className="card-body">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scenario</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retirement Age</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Savings</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Corpus</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Pension</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adequacy</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lifestyle</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {simulationResults.scenarios?.map((scenario, index) => (
                                <tr key={index} className={scenario.name === simulationResults.best_scenario ? 'bg-primary-50' : ''}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="text-sm font-medium text-gray-900">{scenario.name}</div>
                                      {scenario.name === simulationResults.best_scenario && (
                                        <span className="ml-2 bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
                                          BEST
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{scenario.retirement_age}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(scenario.monthly_savings)}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(scenario.total_corpus)}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(scenario.monthly_pension)}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`text-sm font-medium ${scenario.corpus_ratio >= 1.0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {scenario.corpus_ratio}x
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full`} style={{backgroundColor: scenario.color + '20', color: scenario.color}}>
                                      {scenario.lifestyle}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Charts Section */}
                    {simulationResults.chart_data && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">Visual Analysis</h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleGeneratePDF}
                              disabled={isGeneratingPDF}
                              className="btn btn-primary btn-sm"
                            >
                              {isGeneratingPDF ? (
                                <RefreshCw className="mr-1 animate-spin" />
                              ) : (
                                <FileText className="mr-1" />
                              )}
                              {isGeneratingPDF ? 'Generating...' : 'PDF Report'}
                            </button>
                            <button
                              onClick={() => {
                                const dataStr = JSON.stringify(simulationResults, null, 2);
                                const dataBlob = new Blob([dataStr], {type: 'application/json'});
                                const url = URL.createObjectURL(dataBlob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = 'retirement-simulation-results.json';
                                link.click();
                                URL.revokeObjectURL(url);
                              }}
                              className="btn btn-outline btn-sm"
                            >
                              <Download className="mr-1" />
                              Export Data
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Corpus Comparison Chart */}
                          <div className="card">
                            <div className="card-header">
                              <h4 className="text-md font-semibold text-gray-900">Retirement Corpus Comparison</h4>
                            </div>
                            <div className="card-body">
                              <div className="h-64">
                                <canvas id="corpusChart"></canvas>
                              </div>
                            </div>
                          </div>

                          {/* Adequacy Chart */}
                          <div className="card">
                            <div className="card-header">
                              <h4 className="text-md font-semibold text-gray-900">Corpus vs Required Amount</h4>
                            </div>
                            <div className="card-body">
                              <div className="h-64">
                                <canvas id="adequacyChart"></canvas>
                              </div>
                            </div>
                          </div>

                          {/* Monthly Pension Chart */}
                          <div className="card">
                            <div className="card-header">
                              <h4 className="text-md font-semibold text-gray-900">Monthly Pension Projection</h4>
                            </div>
                            <div className="card-body">
                              <div className="h-64">
                                <canvas id="pensionChart"></canvas>
                              </div>
                            </div>
                          </div>

                          {/* Wealth Creation Chart */}
                          <div className="card">
                            <div className="card-header">
                              <h4 className="text-md font-semibold text-gray-900">Wealth Creation Breakdown</h4>
                            </div>
                            <div className="card-body">
                              <div className="h-64">
                                <canvas id="wealthChart"></canvas>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3">
          {/* PDF Download Button */}
          <div className="relative">
            <button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              className="w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-700 transform hover:scale-110 transition-all duration-300 animate-float"
              title="Download PDF Report"
              style={{ zIndex: 1000 }}
            >
              {isGeneratingPDF ? (
                <RefreshCw className="animate-spin text-xl" />
              ) : (
                <FileText className="text-xl" />
              )}
            </button>
            {/* Debug indicator */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
          </div>
          
          {/* Chat Button */}
          {!showChat && (
            <div className="relative">
              <button
                onClick={() => {
                  console.log('Floating chat button clicked');
                  setShowChat(true);
                }}
                className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-green-700 transform hover:scale-110 transition-all duration-300 animate-float"
                title="Chat with FinAI Assistant"
                style={{ zIndex: 1000 }}
              >
                <MessageCircle className="w-6 h-6" />
              </button>
              {/* Debug indicator */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Chatbot Component */}
      {showChat && (
        <div>
          {console.log('Rendering DemoChatbot with showChat:', showChat)}
          <DemoChatbot 
            userContext={{ formData, analysis, projection }} 
            onClose={() => {
              console.log('Chatbot onClose called');
              setShowChat(false);
            }} 
          />
        </div>
      )}
    </div>
  );
};

export default Results;