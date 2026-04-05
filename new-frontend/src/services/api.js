// API service for connecting with the FinAI backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';
const SIMULATOR_BASE_URL = process.env.REACT_APP_SIMULATOR_URL || 'http://localhost:8000';

class RetirementAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.simulatorURL = SIMULATOR_BASE_URL;
  }

  async makeRequest(endpoint, options = {}, useSimulator = false) {
    const base = useSimulator ? this.simulatorURL : this.baseURL;
    const url = `${base}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`Making request to: ${url}`);
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

  // Analyze user's retirement plan → 8001
  async analyzeRetirement(userData) {
    console.log('Original userData:', userData);

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
      other_income: parseFloat(userData.other_income) || 0,
    };

    console.log('Processed data:', processedData);

    if (
      !processedData.age ||
      !processedData.retirement_age ||
      !processedData.annual_income ||
      !processedData.monthly_expenses ||
      !processedData.monthly_savings ||
      !processedData.retirement_goal
    ) {
      throw new Error('Please fill in all required fields');
    }

    return this.makeRequest('/analyze', {
      method: 'POST',
      body: JSON.stringify(processedData),
    });
  }

  // Get strategy recommendations → 8001
  async getStrategies(userData) {
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
      other_income: parseFloat(userData.other_income) || 0,
    };

    return this.makeRequest('/suggestions', {
      method: 'POST',
      body: JSON.stringify(processedData),
    });
  }

  // Simulate different scenarios → 8000
  async simulateScenario(userData) {
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
          monthly_savings: parseFloat(userData.monthly_savings) * 0.8 || 0,
        },
        {
          name: 'Balanced Plan',
          retirement_age: parseInt(userData.retirement_age) || 60,
          monthly_savings: parseFloat(userData.monthly_savings) || 0,
        },
        {
          name: 'Aggressive Plan',
          retirement_age: parseInt(userData.retirement_age) - 2 || 58,
          monthly_savings: parseFloat(userData.monthly_savings) * 1.2 || 0,
        },
      ],
      ai_model: 'huggingface',
    };

    return this.makeRequest('/api/simulate-scenarios', {
      method: 'POST',
      body: JSON.stringify(processedData),
    }, true); // true = use simulator (8000)
  }

  // Get detailed scenario analysis → 8000
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
          monthly_savings: parseFloat(userData.monthly_savings) * 0.8 || 0,
        },
        {
          name: 'Balanced Plan',
          retirement_age: parseInt(userData.retirement_age) || 60,
          monthly_savings: parseFloat(userData.monthly_savings) || 0,
        },
        {
          name: 'Aggressive Plan',
          retirement_age: parseInt(userData.retirement_age) - 2 || 58,
          monthly_savings: parseFloat(userData.monthly_savings) * 1.2 || 0,
        },
      ],
      ai_model: 'huggingface',
    };

    return this.makeRequest('/api/simulate-scenarios', {
      method: 'POST',
      body: JSON.stringify(processedData),
    }, true); // true = use simulator (8000)
  }

  // Generate PDF report → 8001
  async generateReport(formData, projection, simulationResults) {
    const payload = {
      user_data: {
        age: parseInt(formData.age) || 0,
        retirement_age: parseInt(formData.retirement_age) || 0,
        monthly_income: formData.annual_income
          ? Math.round(parseFloat(formData.annual_income) / 12)
          : parseFloat(formData.monthly_income) || 0,
        monthly_expense: parseFloat(formData.monthly_expenses) || 0,
        existing_savings: parseFloat(formData.current_savings) || 0,
        risk_profile: formData.risk_tolerance || formData.risk_profile || 'moderate',
      },
      scenario_results: simulationResults?.scenarios?.map(s => ({
        scenario_name: s.name,
        projected_corpus: s.total_corpus,
        monthly_sip: s.monthly_savings,
        xirr: 10.0,
        feasibility: s.corpus_ratio >= 1.0 ? 'Feasible' : 'Needs Review',
      })) || [{
        scenario_name: 'Base Case',
        projected_corpus: projection?.projected_corpus || 0,
        monthly_sip: parseFloat(formData.monthly_savings) || 0,
        xirr: 10.0,
        feasibility: (projection?.readiness_percentage || 0) >= 80 ? 'Feasible' : 'Needs Review',
      }],
      user_id: `user_${Date.now()}`,
    };

    return this.makeRequest('/api/generate-report', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Health check → 8001
  async healthCheck() {
    return this.makeRequest('/health');
  }
}

const retirementAPI = new RetirementAPI();
export default retirementAPI;