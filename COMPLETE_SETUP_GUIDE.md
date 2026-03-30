# FinAI - Complete Retirement Planning System Setup Guide

## Architecture Overview
The system consists of three main components that work together:

1. **finai-backend** (Port 8000) - Main analysis backend with LangChain AI
2. **simulator** (Port 8001) - Python simulator for scenario analysis  
3. **frontend** (Port 3000) - React frontend interface

## Setup Instructions

### 1. Environment Setup

#### Install Python Dependencies
```bash
# For finai-backend
cd finai-backend
pip install -r requirements.txt

# For simulator
cd simulator
pip install fastapi uvicorn python-dotenv requests
```

#### Install Frontend Dependencies
```bash
cd new-frontend/Incuverse_NullPointerz
npm install
npm install chart.js
```

### 2. Environment Variables

Create `.env` files in both backend directories:

#### finai-backend/.env
```env
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
```

#### simulator/.env
```env
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
GEMINI_API_KEY=your_google_api_key_here
```

### 3. Running All Services

You'll need **3 terminal windows** running simultaneously:

#### Terminal 1: finai-backend (Main Analysis)
```bash
cd finai-backend
python main.py
# Runs on http://localhost:8000
```

#### Terminal 2: simulator (Scenario Analysis)
```bash
cd simulator
python main.py
# Runs on http://localhost:8001
```

#### Terminal 3: frontend
```bash
cd new-frontend/Incuverse_NullPointerz
npm start
# Runs on http://localhost:3000
```

### 4. API Configuration

The frontend needs to be configured to use both backends:

#### Update API Service
The API service should route requests to:
- **Analysis & Strategies**: `finai-backend` (port 8000)
- **Simulations**: `simulator` (port 8001)

## Data Flow

### 1. User Input → Analysis
```
Frontend → finai-backend → LangChain AI → Analysis Results
```

### 2. User Input → Simulation
```
Frontend → simulator → Python Calculations → Scenario Analysis
```

### 3. Complete Workflow
```
1. User fills retirement form
2. Frontend sends to finai-backend for analysis
3. User clicks "Run Simulation" 
4. Frontend sends to simulator for scenarios
5. Results displayed with charts and AI insights
```

## Service Endpoints

### finai-backend (Port 8000)
- `POST /analyze` - Analyze retirement readiness
- `POST /suggestions` - Get strategy recommendations
- `POST /simulate` - Basic simulation
- `GET /health` - Health check

### simulator (Port 8001)
- `POST /api/simulate-scenarios` - Advanced scenario analysis
- `GET /health` - Health check

## Testing the Integration

### 1. Test Backend Services
```bash
# Test finai-backend
curl http://localhost:8000/health

# Test simulator
curl http://localhost:8001/health
```

### 2. Test Frontend
1. Open http://localhost:3000
2. Navigate to Retirement Planning
3. Fill in sample data
4. Click "Analyze Retirement Plan"
5. Go to Results → Simulation tab
6. Click "Run AI Simulation"

## Troubleshooting

### Common Issues

#### Port Conflicts
- **finai-backend** should run on port 8000
- **simulator** should run on port 8001
- **frontend** should run on port 3000

#### API Connection Issues
- Check that both backends are running
- Verify CORS settings in both backends
- Check browser console for errors

#### Missing Dependencies
```bash
# Install missing Python packages
pip install fastapi uvicorn python-dotenv requests openai anthropic google-generativeai

# Install missing Node packages
npm install chart.js
```

### Debug Steps
1. Check all three services are running
2. Test API endpoints individually
3. Check browser console for errors
4. Verify environment variables are set
5. Test with sample data first

## Development Workflow

### 1. Start All Services
```bash
# Terminal 1
cd finai-backend && python main.py

# Terminal 2  
cd simulator && python main.py

# Terminal 3
cd new-frontend/Incuverse_NullPointerz && npm start
```

### 2. Development Tips
- Keep all three terminals open during development
- Use browser dev tools to debug API calls
- Check backend logs for errors
- Test with different user inputs

### 3. Production Deployment
- Use process managers like PM2 for Node.js
- Use Gunicorn for Python services
- Configure reverse proxy (nginx)
- Set up environment variables properly

## Features Available

### finai-backend Features
- ✅ LangChain AI analysis
- ✅ Retirement readiness calculation
- ✅ Strategy recommendations
- ✅ Risk assessment

### simulator Features  
- ✅ Multi-scenario analysis
- ✅ Interactive charts
- ✅ AI-powered insights
- ✅ Export functionality

### frontend Features
- ✅ User-friendly interface
- ✅ Interactive forms
- ✅ Results visualization
- ✅ Responsive design

## Next Steps

1. **Start all three services**
2. **Test the complete workflow**
3. **Customize scenarios as needed**
4. **Add additional features**
5. **Deploy to production**

The system is now ready for comprehensive retirement planning with AI-powered analysis and interactive scenario modeling!
