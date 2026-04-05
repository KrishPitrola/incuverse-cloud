"""
FastAPI backend for AI-Driven Retirement Planner.
Provides endpoints for retirement analysis, strategy recommendations, simulations, and report generation.
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Import our custom modules
from models.user_input import (
    UserInput, AnalysisResult, StrategyResponse, 
    SimulationRequest, SimulationResult, RetirementProjection
)
from utils.formulas import retirement_projection, simulate_scenario, calculate_risk_score
from chains.simple_analysis import create_analysis_chain
from chains.simple_strategy import create_strategy_chain

# Import PDF and S3 utilities
from utils.pdf_generator import generate_retirement_report
from utils.s3_uploader import upload_report_to_s3

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="FinAI API",
    description="A comprehensive retirement planning API powered by LangChain and OpenAI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],  # React dev server + catch-all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for chains (initialized on startup)
analysis_chain = None
strategy_chain = None

# ── Request / Response models for Reports ─────────────────────────────────────

class UserData(BaseModel):
    age:              int   = Field(..., ge=18, le=100)
    retirement_age:   int   = Field(..., ge=30, le=80)
    monthly_income:   float = Field(..., ge=0)
    monthly_expense:  float = Field(..., ge=0)
    existing_savings: float = Field(0, ge=0)
    risk_profile:     str   = Field("moderate")


class ScenarioResult(BaseModel):
    scenario_name:    str
    projected_corpus: float
    monthly_sip:      float
    xirr:             float
    feasibility:      str


class GenerateReportRequest(BaseModel):
    user_data:        UserData
    scenario_results: List[ScenarioResult]
    user_id:          str = Field(..., min_length=1)


class GenerateReportResponse(BaseModel):
    success:      bool
    download_url: str

# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    """Initialize the LangChain components on startup."""
    global analysis_chain, strategy_chain
    
    try:
        # Check if OpenAI API key is available
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            print("Warning: OPENAI_API_KEY not found. AI features will be limited.")
            return
        
        # Initialize the chains
        analysis_chain = create_analysis_chain(openai_api_key)
        strategy_chain = create_strategy_chain(openai_api_key)
        print("LangChain components initialized successfully.")
        
    except Exception as e:
        print(f"Error initializing LangChain components: {e}")
        print("AI features will be limited. Please check your OpenAI API key.")

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "FinAI API",
        "version": "1.0.0",
        "status": "active",
        "endpoints": {
            "analyze": "/analyze - Analyze retirement readiness",
            "suggestions": "/suggestions - Get strategy recommendations", 
            "simulate": "/simulate - Run retirement simulations",
            "generate_report": "/api/generate-report - Generate PDF report",
            "health": "/health - Health check"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "ai_enabled": analysis_chain is not None and strategy_chain is not None,
        "timestamp": "2024-01-01T00:00:00Z"
    }

@app.post("/analyze", response_model=Dict[str, Any])
async def analyze_retirement(user_input: UserInput):
    """
    Analyze user's retirement readiness and provide AI-driven insights.
    """
    try:
        # Calculate retirement projection
        projection = retirement_projection(user_input)
        
        # Get AI analysis if available
        if analysis_chain:
            try:
                # Pass projection data to analysis for optimized insights
                projection_data = {
                    'readiness_percentage': projection.readiness_percentage,
                    'projected_corpus': projection.projected_corpus,
                    'retirement_goal': projection.retirement_goal,
                    'shortfall': projection.shortfall,
                    'surplus': projection.surplus,
                    'years_to_retirement': projection.years_to_retirement
                }
                analysis_result = analysis_chain.analyze_retirement_plan(user_input, projection_data)
            except Exception as e:
                print(f"AI analysis failed: {e}")
                # Fallback to basic analysis
                analysis_result = AnalysisResult(
                    summary=f"Your retirement readiness is {projection.readiness_percentage:.1f}%",
                    readiness_score=projection.readiness_percentage,
                    corpus=projection.projected_corpus,
                    confidence_level="Medium",
                    key_insights=["Basic analysis completed"],
                    risk_factors=["Standard market risks apply"]
                )
        else:
            # Fallback when AI is not available
            analysis_result = AnalysisResult(
                summary=f"Your retirement readiness is {projection.readiness_percentage:.1f}%",
                readiness_score=projection.readiness_percentage,
                corpus=projection.projected_corpus,
                confidence_level="Medium",
                key_insights=["Basic analysis completed"],
                risk_factors=["Standard market risks apply"]
            )
        
        # Get strategy recommendations
        if strategy_chain:
            try:
                # Pass projection data to strategy generation for optimized recommendations
                projection_data = {
                    'readiness_percentage': projection.readiness_percentage,
                    'projected_corpus': projection.projected_corpus,
                    'retirement_goal': projection.retirement_goal,
                    'shortfall': projection.shortfall,
                    'surplus': projection.surplus,
                    'years_to_retirement': projection.years_to_retirement
                }
                strategy_response = strategy_chain.generate_strategies(user_input, analysis_result, projection_data)
            except Exception as e:
                print(f"Strategy generation failed: {e}")
                # Fallback strategies
                strategy_response = StrategyResponse(
                    strategies=[],
                    overall_priority="Medium",
                    implementation_order=[]
                )
        else:
            # Fallback strategies
            strategy_response = StrategyResponse(
                strategies=[],
                overall_priority="Medium", 
                implementation_order=[]
            )
        
        # Calculate additional metrics
        risk_assessment = calculate_risk_score(user_input)
        
        # Prepare response
        response = {
            "success": True,
            "projection": {
                "current_age": projection.current_age,
                "retirement_age": projection.retirement_age,
                "years_to_retirement": projection.years_to_retirement,
                "current_savings": projection.current_savings,
                "monthly_savings": projection.monthly_savings,
                "annual_savings": projection.annual_savings,
                "expected_returns": projection.expected_returns,
                "projected_corpus": projection.projected_corpus,
                "retirement_goal": projection.retirement_goal,
                "readiness_percentage": projection.readiness_percentage,
                "shortfall": projection.shortfall,
                "surplus": projection.surplus
            },
            "analysis": {
                "summary": analysis_result.summary,
                "readiness_score": analysis_result.readiness_score,
                "corpus": analysis_result.corpus,
                "confidence_level": analysis_result.confidence_level,
                "key_insights": analysis_result.key_insights,
                "risk_factors": analysis_result.risk_factors
            },
            "strategies": [
                {
                    "title": strategy.title,
                    "description": strategy.description,
                    "impact": strategy.impact,
                    "timeframe": strategy.timeframe,
                    "difficulty": strategy.difficulty,
                    "expected_benefit": strategy.expected_benefit
                }
                for strategy in strategy_response.strategies
            ],
            "overall_priority": strategy_response.overall_priority,
            "implementation_order": strategy_response.implementation_order,
            "risk_assessment": risk_assessment,
            "ai_enabled": analysis_chain is not None
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/suggestions", response_model=Dict[str, Any])
async def get_strategy_suggestions(user_input: UserInput):
    """
    Get personalized strategy recommendations for improving retirement readiness.
    """
    try:
        # Calculate retirement projection first
        projection = retirement_projection(user_input)
        
        # Get analysis
        if analysis_chain:
            try:
                # Pass projection data to analysis for optimized insights
                projection_data = {
                    'readiness_percentage': projection.readiness_percentage,
                    'projected_corpus': projection.projected_corpus,
                    'retirement_goal': projection.retirement_goal,
                    'shortfall': projection.shortfall,
                    'surplus': projection.surplus,
                    'years_to_retirement': projection.years_to_retirement
                }
                analysis_result = analysis_chain.analyze_retirement_plan(user_input, projection_data)
            except Exception as e:
                print(f"Analysis failed: {e}")
                # Create fallback analysis
                analysis_result = AnalysisResult(
                    summary=f"Your retirement readiness is {projection.readiness_percentage:.1f}%",
                    readiness_score=projection.readiness_percentage,
                    corpus=projection.projected_corpus,
                    confidence_level="Medium",
                    key_insights=["Basic analysis completed"],
                    risk_factors=["Standard market risks apply"]
                )
        else:
            # Fallback analysis
            analysis_result = AnalysisResult(
                summary=f"Your retirement readiness is {projection.readiness_percentage:.1f}%",
                readiness_score=projection.readiness_percentage,
                corpus=projection.projected_corpus,
                confidence_level="Medium",
                key_insights=["Basic analysis completed"],
                risk_factors=["Standard market risks apply"]
            )
        
        # Get strategy recommendations
        if strategy_chain:
            try:
                # Pass projection data to strategy generation for optimized recommendations
                projection_data = {
                    'readiness_percentage': projection.readiness_percentage,
                    'projected_corpus': projection.projected_corpus,
                    'retirement_goal': projection.retirement_goal,
                    'shortfall': projection.shortfall,
                    'surplus': projection.surplus,
                    'years_to_retirement': projection.years_to_retirement
                }
                strategy_response = strategy_chain.generate_strategies(user_input, analysis_result, projection_data)
            except Exception as e:
                print(f"Strategy generation failed: {e}")
                # Fallback strategies
                strategy_response = StrategyResponse(
                    strategies=[],
                    overall_priority="Medium",
                    implementation_order=[]
                )
        else:
            # Fallback strategies
            strategy_response = StrategyResponse(
                strategies=[],
                overall_priority="Medium", 
                implementation_order=[]
            )
        
        # Prepare response
        response = {
            "success": True,
            "strategies": [
                {
                    "title": strategy.title,
                    "description": strategy.description,
                    "impact": strategy.impact,
                    "timeframe": strategy.timeframe,
                    "difficulty": strategy.difficulty,
                    "expected_benefit": strategy.expected_benefit
                }
                for strategy in strategy_response.strategies
            ],
            "overall_priority": strategy_response.overall_priority,
            "implementation_order": strategy_response.implementation_order,
            "ai_enabled": strategy_chain is not None
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Strategy generation failed: {str(e)}")

@app.post("/simulate", response_model=Dict[str, Any])
async def simulate_retirement(simulation_request: SimulationRequest):
    """
    Run retirement simulations with modified parameters.
    """
    try:
        # Get original projection
        original_projection = retirement_projection(simulation_request.user_input)
        
        # Create simulation with modified parameters
        simulated_projection = simulate_scenario(
            simulation_request.user_input, 
            simulation_request.modified_parameters
        )
        
        # Calculate differences
        corpus_difference = simulated_projection.projected_corpus - original_projection.projected_corpus
        readiness_difference = simulated_projection.readiness_percentage - original_projection.readiness_percentage
        
        # Generate recommendations based on simulation results
        recommendations = []
        
        if corpus_difference > 0:
            recommendations.append(f"Positive impact: Corpus increases by ${corpus_difference:,.2f}")
        elif corpus_difference < 0:
            recommendations.append(f"Negative impact: Corpus decreases by ${abs(corpus_difference):,.2f}")
        
        if readiness_difference > 0:
            recommendations.append(f"Readiness improves by {readiness_difference:.1f} percentage points")
        elif readiness_difference < 0:
            recommendations.append(f"Readiness decreases by {abs(readiness_difference):,.1f} percentage points")
        
        if simulated_projection.readiness_percentage >= 100:
            recommendations.append("This scenario would achieve your retirement goal!")
        elif simulated_projection.readiness_percentage >= 80:
            recommendations.append("This scenario gets you close to your retirement goal")
        else:
            recommendations.append("This scenario still falls short of your retirement goal")
        
        # Prepare response
        response = {
            "success": True,
            "simulation_type": simulation_request.simulation_type,
            "original_projection": {
                "projected_corpus": original_projection.projected_corpus,
                "readiness_percentage": original_projection.readiness_percentage,
                "shortfall": original_projection.shortfall,
                "surplus": original_projection.surplus
            },
            "simulated_projection": {
                "projected_corpus": simulated_projection.projected_corpus,
                "readiness_percentage": simulated_projection.readiness_percentage,
                "shortfall": simulated_projection.shortfall,
                "surplus": simulated_projection.surplus
            },
            "differences": {
                "corpus_difference": corpus_difference,
                "readiness_difference": readiness_difference,
                "shortfall_change": simulated_projection.shortfall - original_projection.shortfall,
                "surplus_change": simulated_projection.surplus - original_projection.surplus
            },
            "recommendations": recommendations,
            "modified_parameters": simulation_request.modified_parameters
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")

@app.post("/api/generate-report", response_model=GenerateReportResponse)
def generate_report(body: GenerateReportRequest):
    """
    Generate a retirement planning PDF, upload to S3, and return a pre-signed URL.
    """
    logger.info("Generating report for user_id=%s", body.user_id)

    try:
        pdf_bytes = generate_retirement_report(
            user_data=body.user_data.dict(),
            scenario_results=[s.dict() for s in body.scenario_results],
        )
    except Exception as exc:
        logger.exception("PDF generation failed")
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {exc}")

    try:
        download_url = upload_report_to_s3(pdf_bytes, body.user_id)
    except RuntimeError as exc:
        logger.exception("S3 upload failed")
        raise HTTPException(status_code=502, detail=str(exc))

    logger.info("Report ready for user_id=%s  url_prefix=%.60s...", body.user_id, download_url)
    return GenerateReportResponse(success=True, download_url=download_url)

@app.get("/sample-inputs")
async def get_sample_inputs():
    """Get sample input data for testing the API endpoints."""
    return {
        "sample_user_input": {
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
        },
        "sample_simulation_parameters": {
            "monthly_savings": 1500,
            "expected_returns": 7.0,
            "retirement_age": 67
        },
        "endpoints": {
            "analyze": {
                "method": "POST",
                "url": "/analyze",
                "description": "Analyze retirement readiness"
            },
            "suggestions": {
                "method": "POST", 
                "url": "/suggestions",
                "description": "Get strategy recommendations"
            },
            "simulate": {
                "method": "POST",
                "url": "/simulate", 
                "description": "Run retirement simulations"
            },
            "generate_report": {
                "method": "POST",
                "url": "/api/generate-report",
                "description": "Generate a retirement planning PDF and upload to S3"
            }
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)