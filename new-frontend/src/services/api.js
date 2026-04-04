// API service for connecting with the FinAI backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const SIMULATOR_BASE_URL = process.env.REACT_APP_SIMULATOR_URL || 'http://localhost:8001';

class RetirementAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`Making request to: ${url}`);
      console.log('Request config:', config);
      
      const response = await fetch(url, config);
      
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error response:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Analyze user's retirement plan
  async analyzeRetirement(userData) {
    console.log('Original userData:', userData);
    
    // Convert string values to appropriate types for backend
    const processedData = {
      age: parseInt(userData.age) || 0,
      retirement_age: parseInt(userData.retirement_age) || 0,
      annual_income: parseFloat(userData.annual_income) || 0,
      monthly_expenses: parseFloat(userData.monthly_expenses) || 0,
      current_savings: parseFloat(userData.current_savings) || 0,
      monthly_savings: parseFloat(userData.monthly_savings) || 0,
      retirement_goal: parseFloat(userData.retirement_goal) || 0,
      expected_inflation: parseFloat(userData.expected_inflation) || 6.0,
      expected_returns: parseFloat(userData.expected_returns) || 8.0,
      employer_pf: parseFloat(userData.employer_pf) || 0,
      epf_balance: parseFloat(userData.epf_balance) || 0,
      ppf_balance: parseFloat(userData.ppf_balance) || 0,
      nps_balance: parseFloat(userData.nps_balance) || 0,
      other_income: parseFloat(userData.other_income) || 0
    };
    
    console.log('Processed data:', processedData);
    
    // Validate required fields
    if (!processedData.age || !processedData.retirement_age || !processedData.annual_income || 
        !processedData.monthly_expenses || !processedData.monthly_savings || !processedData.retirement_goal) {
      throw new Error('Please fill in all required fields');
    }
    
    return this.makeRequest('/analyze', {
      method: 'POST',
      body: JSON.stringify(processedData),
    });
  }

  // Get strategy recommendations
  async getStrategies(userData) {
    // Convert string values to appropriate types for backend
    const processedData = {
      age: parseInt(userData.age) || 0,
      retirement_age: parseInt(userData.retirement_age) || 0,
      annual_income: parseFloat(userData.annual_income) || 0,
      monthly_expenses: parseFloat(userData.monthly_expenses) || 0,
      current_savings: parseFloat(userData.current_savings) || 0,
      monthly_savings: parseFloat(userData.monthly_savings) || 0,
      retirement_goal: parseFloat(userData.retirement_goal) || 0,
      expected_inflation: parseFloat(userData.expected_inflation) || 6.0,
      expected_returns: parseFloat(userData.expected_returns) || 8.0,
      employer_pf: parseFloat(userData.employer_pf) || 0,
      epf_balance: parseFloat(userData.epf_balance) || 0,
      ppf_balance: parseFloat(userData.ppf_balance) || 0,
      nps_balance: parseFloat(userData.nps_balance) || 0,
      other_income: parseFloat(userData.other_income) || 0
    };
    
    return this.makeRequest('/suggestions', {
      method: 'POST',
      body: JSON.stringify(processedData),
    });
  }

  // Simulate different scenarios using the enhanced Python simulator
  async simulateScenario(userData) {
    // Convert string values to appropriate types for backend
    const processedData = {
      user_id: 'user_' + Date.now(),
      current_age: parseInt(userData.age) || 0,
      current_savings: parseFloat(userData.current_savings) || 0,
      monthly_income: parseFloat(userData.annual_income) / 12 || 0,
      fixed_expenses: parseFloat(userData.monthly_expenses) * 0.7 || 0,
      variable_expenses: parseFloat(userData.monthly_expenses) * 0.3 || 0,
      scenarios: [
        {
          name: 'Conservative Plan',
          retirement_age: parseInt(userData.retirement_age) + 2 || 62,
          monthly_savings: parseFloat(userData.monthly_savings) * 0.8 || 0
        },
        {
          name: 'Balanced Plan', 
          retirement_age: parseInt(userData.retirement_age) || 60,
          monthly_savings: parseFloat(userData.monthly_savings) || 0
        },
        {
          name: 'Aggressive Plan',
          retirement_age: parseInt(userData.retirement_age) - 2 || 58,
          monthly_savings: parseFloat(userData.monthly_savings) * 1.2 || 0
        }
      ],
      ai_model: 'huggingface'
    };
    
    // Use simulator backend for scenario analysis
    const url = `${SIMULATOR_BASE_URL}/api/simulate-scenarios`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(processedData),
    };

    try {
      console.log(`Making request to: ${url}`);
      console.log('Request config:', config);
      
      const response = await fetch(url, config);
      
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error response:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error(`API Error (simulator):`, error);
      throw error;
    }
  }

  // Get detailed scenario analysis with charts
  async getScenarioAnalysis(userData) {
    const processedData = {
      user_id: 'user_' + Date.now(),
      current_age: parseInt(userData.age) || 0,
      current_savings: parseFloat(userData.current_savings) || 0,
      monthly_income: parseFloat(userData.annual_income) / 12 || 0,
      fixed_expenses: parseFloat(userData.monthly_expenses) * 0.7 || 0,
      variable_expenses: parseFloat(userData.monthly_expenses) * 0.3 || 0,
      scenarios: [
        {
          name: 'Conservative Plan',
          retirement_age: parseInt(userData.retirement_age) + 2 || 62,
          monthly_savings: parseFloat(userData.monthly_savings) * 0.8 || 0
        },
        {
          name: 'Balanced Plan', 
          retirement_age: parseInt(userData.retirement_age) || 60,
          monthly_savings: parseFloat(userData.monthly_savings) || 0
        },
        {
          name: 'Aggressive Plan',
          retirement_age: parseInt(userData.retirement_age) - 2 || 58,
          monthly_savings: parseFloat(userData.monthly_savings) * 1.2 || 0
        }
      ],
      ai_model: 'huggingface'
    };
    
    return this.makeRequest('/api/simulate-scenarios', {
      method: 'POST',
      body: JSON.stringify(processedData),
    });
  }

  // Health check
  async healthCheck() {
    return this.makeRequest('/health');
  }
}

// Create and export a singleton instance
const retirementAPI = new RetirementAPI();
export default retirementAPI;
