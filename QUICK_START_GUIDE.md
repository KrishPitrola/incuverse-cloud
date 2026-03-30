# FinAI - Quick Start Guide

## 🚀 Quick Setup (3 Services Required)

You need to run **3 services simultaneously** for the complete system:

### 1. finai-backend (Port 8000) - Main Analysis
```bash
cd finai-backend
python main.py
```

### 2. simulator (Port 8001) - Scenario Analysis  
```bash
cd simulator
python main.py
```

### 3. frontend (Port 3000) - React Interface
```bash
cd new-frontend/Incuverse_NullPointerz
npm start
```

## 🎯 Easy Startup Options

### Option 1: Use Startup Scripts
```bash
# Windows
start_all_services.bat

# Linux/Mac
./start_all_services.sh
```

### Option 2: Manual Startup (3 Terminals)
Open 3 terminal windows and run each service:

**Terminal 1:**
```bash
cd finai-backend
python main.py
```

**Terminal 2:**
```bash
cd simulator  
python main.py
```

**Terminal 3:**
```bash
cd new-frontend/Incuverse_NullPointerz
npm start
```

## 🔧 Prerequisites

### Install Dependencies
```bash
# Python dependencies
cd finai-backend && pip install -r requirements.txt
cd simulator && pip install fastapi uvicorn python-dotenv requests

# Frontend dependencies  
cd new-frontend/Incuverse_NullPointerz && npm install
```

### Environment Variables
Create `.env` files in both backend directories:

**finai-backend/.env:**
```env
OPENAI_API_KEY=your_key_here
```

**simulator/.env:**
```env
OPENAI_API_KEY=your_key_here
```

## 🧪 Testing the System

### 1. Check All Services
- finai-backend: http://localhost:8000/health
- simulator: http://localhost:8001/health  
- frontend: http://localhost:3000

### 2. Test Complete Workflow
1. Open http://localhost:3000
2. Go to Retirement Planning
3. Fill in sample data
4. Click "Analyze Retirement Plan"
5. Go to Results → Simulation tab
6. Click "Run AI Simulation"
7. View comprehensive analysis with charts

## 📊 What You'll Get

### Analysis Features (finai-backend)
- ✅ AI-powered retirement analysis
- ✅ LangChain insights and recommendations
- ✅ Risk assessment and readiness scoring

### Simulation Features (simulator)
- ✅ Multi-scenario analysis (Conservative, Balanced, Aggressive)
- ✅ Interactive charts and visualizations
- ✅ AI-powered recommendations
- ✅ Export functionality

### Frontend Features
- ✅ User-friendly interface
- ✅ Interactive forms and results
- ✅ Responsive design
- ✅ Real-time updates

## 🚨 Troubleshooting

### Port Conflicts
- **finai-backend**: Port 8000
- **simulator**: Port 8001  
- **frontend**: Port 3000

### Common Issues
1. **Services not starting**: Check dependencies are installed
2. **API errors**: Verify all 3 services are running
3. **CORS errors**: Check backend CORS settings
4. **Missing charts**: Ensure Chart.js is installed

### Debug Steps
1. Check all services are running on correct ports
2. Test API endpoints individually
3. Check browser console for errors
4. Verify environment variables

## 🎉 Success Indicators

When everything is working, you should see:
- ✅ All 3 services running without errors
- ✅ Frontend loads at http://localhost:3000
- ✅ Retirement form works and submits data
- ✅ Analysis results display with AI insights
- ✅ Simulation tab shows interactive charts
- ✅ Export functionality works

## 🔄 Development Workflow

1. **Start all services** (all 3 must run simultaneously)
2. **Make changes** to any component
3. **Test changes** in the frontend
4. **Debug issues** using browser dev tools
5. **Restart services** if needed

The system is now ready for comprehensive retirement planning with AI-powered analysis and interactive scenario modeling! 🎯💰📈
