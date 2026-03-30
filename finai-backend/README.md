# AI-Driven Retirement Planner Backend

A comprehensive FastAPI backend powered by LangChain for AI-driven retirement planning. This system analyzes user financial data, calculates retirement projections, and provides personalized AI-driven recommendations.

## 🚀 Features

- **Retirement Projection Calculations**: Compound interest-based retirement corpus projections
- **AI-Powered Analysis**: LangChain integration for intelligent financial insights
- **Personalized Strategies**: 3 actionable recommendations for improving retirement readiness
- **Simulation Engine**: What-if scenarios with modified parameters
- **Risk Assessment**: Comprehensive risk analysis and scoring
- **RESTful API**: Clean, documented API endpoints with automatic OpenAPI docs

## 📁 Project Structure

```
finai-backend/
├── chains/
│   ├── analysis_chain.py      # LangChain analysis chain
│   └── strategy_chain.py      # LangChain strategy recommendations
├── models/
│   └── user_input.py          # Pydantic models for data validation
├── utils/
│   └── formulas.py            # Financial calculation utilities
├── main.py                    # FastAPI application
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables
└── README.md                  # This file
```

## 🛠️ Installation

### Prerequisites

- Python 3.8 or higher
- OpenAI API key

### Setup

1. **Clone and navigate to the project:**
   ```bash
   cd finai-backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   # Edit .env file and add your OpenAI API key
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

## 🚀 Running the Application

### Development Server

```bash
# Start the development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Production Server

```bash
# Start the production server
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📚 API Endpoints

### 1. Health Check
```http
GET /health
```

### 2. Analyze Retirement Readiness
```http
POST /analyze
Content-Type: application/json

{
  "age": 35,
  "retirement_age": 65,
  "annual_income": 75000,
  "monthly_expenses": 4000,
  "current_savings": 50000,
  "monthly_savings": 1000,
  "retirement_goal": 1000000,
  "expected_inflation": 3.0,
  "expected_returns": 6.0
}
```

### 3. Get Strategy Recommendations
```http
POST /suggestions
Content-Type: application/json

{
  "age": 35,
  "retirement_age": 65,
  "annual_income": 75000,
  "monthly_expenses": 4000,
  "current_savings": 50000,
  "monthly_savings": 1000,
  "retirement_goal": 1000000
}
```

### 4. Run Simulations
```http
POST /simulate
Content-Type: application/json

{
  "user_input": {
    "age": 35,
    "retirement_age": 65,
    "annual_income": 75000,
    "monthly_expenses": 4000,
    "current_savings": 50000,
    "monthly_savings": 1000,
    "retirement_goal": 1000000
  },
  "modified_parameters": {
    "monthly_savings": 1500,
    "expected_returns": 7.0,
    "retirement_age": 67
  },
  "simulation_type": "what_if"
}
```

### 5. Get Sample Inputs
```http
GET /sample-inputs
```

## 🧪 Testing the API

### Using curl

1. **Test Health Check:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Test Analysis Endpoint:**
   ```bash
   curl -X POST "http://localhost:8000/analyze" \
        -H "Content-Type: application/json" \
        -d '{
          "age": 35,
          "retirement_age": 65,
          "annual_income": 75000,
          "monthly_expenses": 4000,
          "current_savings": 50000,
          "monthly_savings": 1000,
          "retirement_goal": 1000000,
          "expected_inflation": 3.0,
          "expected_returns": 6.0
        }'
   ```

3. **Test Strategy Recommendations:**
   ```bash
   curl -X POST "http://localhost:8000/suggestions" \
        -H "Content-Type: application/json" \
        -d '{
          "age": 35,
          "retirement_age": 65,
          "annual_income": 75000,
          "monthly_expenses": 4000,
          "current_savings": 50000,
          "monthly_savings": 1000,
          "retirement_goal": 1000000
        }'
   ```

4. **Test Simulation:**
   ```bash
   curl -X POST "http://localhost:8000/simulate" \
        -H "Content-Type: application/json" \
        -d '{
          "user_input": {
            "age": 35,
            "retirement_age": 65,
            "annual_income": 75000,
            "monthly_expenses": 4000,
            "current_savings": 50000,
            "monthly_savings": 1000,
            "retirement_goal": 1000000
          },
          "modified_parameters": {
            "monthly_savings": 1500,
            "expected_returns": 7.0
          }
        }'
   ```

### Using Python requests

```python
import requests
import json

# Base URL
base_url = "http://localhost:8000"

# Sample user input
user_data = {
    "age": 35,
    "retirement_age": 65,
    "annual_income": 75000,
    "monthly_expenses": 4000,
    "current_savings": 50000,
    "monthly_savings": 1000,
    "retirement_goal": 1000000,
    "expected_inflation": 3.0,
    "expected_returns": 6.0
}

# Test analysis
response = requests.post(f"{base_url}/analyze", json=user_data)
print("Analysis Result:", response.json())

# Test strategies
response = requests.post(f"{base_url}/suggestions", json=user_data)
print("Strategies:", response.json())

# Test simulation
simulation_data = {
    "user_input": user_data,
    "modified_parameters": {
        "monthly_savings": 1500,
        "expected_returns": 7.0
    }
}
response = requests.post(f"{base_url}/simulate", json=simulation_data)
print("Simulation:", response.json())
```

## 📊 Sample Inputs and Expected Outputs

### Sample Input
```json
{
  "age": 35,
  "retirement_age": 65,
  "annual_income": 75000,
  "monthly_expenses": 4000,
  "current_savings": 50000,
  "monthly_savings": 1000,
  "retirement_goal": 1000000,
  "expected_inflation": 3.0,
  "expected_returns": 6.0,
  "employer_match": 5.0,
  "social_security_estimate": 2000,
  "other_income": 0
}
```

### Expected Analysis Output
```json
{
  "success": true,
  "projection": {
    "current_age": 35,
    "retirement_age": 65,
    "years_to_retirement": 30,
    "current_savings": 50000,
    "monthly_savings": 1000,
    "annual_savings": 12000,
    "expected_returns": 6.0,
    "projected_corpus": 1200000,
    "retirement_goal": 1000000,
    "readiness_percentage": 120.0,
    "shortfall": 0,
    "surplus": 200000
  },
  "analysis": {
    "summary": "Excellent! You're projected to exceed your retirement goal by $200,000.",
    "readiness_score": 120.0,
    "corpus": 1200000,
    "confidence_level": "High",
    "key_insights": [
      "You're on track to exceed your retirement goal",
      "Long time horizon provides flexibility for investment growth",
      "Current monthly savings of $1,000 is contributing well to your goal"
    ],
    "risk_factors": [
      "Market volatility could impact returns",
      "Inflation risk over 30-year period",
      "Life changes could affect savings capacity"
    ]
  },
  "risk_assessment": {
    "risk_score": 2,
    "risk_level": "Low",
    "risk_factors": ["Long time horizon"],
    "recommendations": [
      "Maintain your current strategy",
      "Consider more aggressive investments if comfortable with risk",
      "Review and rebalance your portfolio regularly"
    ]
  },
  "ai_enabled": true
}
```

### Expected Strategy Output
```json
{
  "success": true,
  "strategies": [
    {
      "title": "Optimize Investment Allocation",
      "description": "Review and potentially adjust your investment allocation to maximize returns while managing risk. Consider diversifying across different asset classes.",
      "impact": "Medium to high impact on returns",
      "timeframe": "1-3 months",
      "difficulty": "Medium",
      "expected_benefit": "Potential 1-2% improvement in annual returns"
    },
    {
      "title": "Tax Optimization Strategy",
      "description": "Maximize tax-advantaged accounts like 401(k), IRA, and HSA. Consider Roth vs. traditional account strategies.",
      "impact": "Medium impact on after-tax returns",
      "timeframe": "1-6 months",
      "difficulty": "Medium",
      "expected_benefit": "Potential 10-20% improvement in after-tax retirement income"
    },
    {
      "title": "Portfolio Rebalancing",
      "description": "Implement regular portfolio rebalancing to maintain your target asset allocation and manage risk.",
      "impact": "Medium impact on risk management",
      "timeframe": "Immediate",
      "difficulty": "Easy",
      "expected_benefit": "Better risk-adjusted returns and reduced volatility"
    }
  ],
  "overall_priority": "Medium",
  "implementation_order": [
    "Portfolio Rebalancing",
    "Tax Optimization Strategy", 
    "Optimize Investment Allocation"
  ],
  "ai_enabled": true
}
```

## 🔧 Configuration

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required for AI features)
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8000)
- `DEBUG`: Debug mode (default: True)

### CORS Configuration

The API is configured to allow requests from:
- http://localhost:3000 (React dev server)
- http://127.0.0.1:3000

## 🚨 Troubleshooting

### Common Issues

1. **OpenAI API Key Error:**
   ```
   Error: OpenAI API key is required
   ```
   - Solution: Set your OpenAI API key in the `.env` file

2. **Import Errors:**
   ```
   ModuleNotFoundError: No module named 'langchain'
   ```
   - Solution: Install dependencies with `pip install -r requirements.txt`

3. **CORS Errors:**
   ```
   Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' has been blocked by CORS policy
   ```
   - Solution: The API is already configured for CORS, but ensure your frontend is running on the allowed origins

### Debug Mode

Enable debug mode by setting `DEBUG=True` in your `.env` file for detailed error messages.

## 📈 Performance Considerations

- **AI Features**: OpenAI API calls may take 2-5 seconds
- **Fallback Mode**: The API works without OpenAI API key but with limited AI features
- **Caching**: Consider implementing Redis caching for production use
- **Rate Limiting**: Implement rate limiting for production deployment

## 🔒 Security Notes

- Never commit your `.env` file to version control
- Use environment variables for all sensitive configuration
- Implement proper authentication for production use
- Consider API key rotation for OpenAI

## 📝 License

This project is for educational and development purposes. Please ensure you comply with OpenAI's usage policies when using their API.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation at `/docs`
3. Test with the provided sample inputs
4. Check server logs for detailed error messages
