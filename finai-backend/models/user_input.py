"""
Pydantic models for user input validation in the AI-Driven Retirement Planner.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime


class UserInput(BaseModel):
    """
    Main user input model for retirement planning analysis.
    All financial amounts are in USD.
    """
    
    # Basic Information
    age: int = Field(..., ge=18, le=100, description="Current age of the user")
    retirement_age: int = Field(..., ge=50, le=100, description="Target retirement age")
    
    # Financial Information
    annual_income: float = Field(..., gt=0, description="Annual income in INR")
    monthly_expenses: float = Field(..., gt=0, description="Monthly expenses in INR")
    current_savings: float = Field(..., ge=0, description="Current savings/investments in INR")
    monthly_savings: float = Field(..., ge=0, description="Monthly savings amount in INR")
    
    # Retirement Goals
    retirement_goal: float = Field(..., gt=0, description="Target retirement corpus in INR")
    expected_inflation: float = Field(default=3.0, ge=0, le=10, description="Expected annual inflation rate (%)")
    expected_returns: float = Field(default=6.0, ge=0, le=20, description="Expected annual investment returns (%)")
    
    # Optional Information (Indian Context)
    employer_pf: Optional[float] = Field(default=0.0, ge=0, le=100, description="Employer PF contribution percentage")
    epf_balance: Optional[float] = Field(default=0.0, ge=0, description="Current EPF balance")
    ppf_balance: Optional[float] = Field(default=0.0, ge=0, description="Current PPF balance")
    nps_balance: Optional[float] = Field(default=0.0, ge=0, description="Current NPS balance")
    other_income: Optional[float] = Field(default=0.0, ge=0, description="Other expected retirement income (pension, rental, etc.)")
    
    @validator('retirement_age')
    def retirement_age_must_be_greater_than_current_age(cls, v, values):
        if 'age' in values and v <= values['age']:
            raise ValueError('Retirement age must be greater than current age')
        return v
    
    @validator('monthly_expenses')
    def expenses_must_be_reasonable(cls, v, values):
        if 'annual_income' in values:
            annual_expenses = v * 12
            if annual_expenses > values['annual_income'] * 0.9:  # Expenses shouldn't exceed 90% of income
                raise ValueError('Monthly expenses seem too high relative to income')
        return v
    
    @validator('monthly_savings')
    def savings_must_be_reasonable(cls, v, values):
        if 'annual_income' in values and 'monthly_expenses' in values:
            annual_savings = v * 12
            annual_expenses = values['monthly_expenses'] * 12
            if annual_savings + annual_expenses > values['annual_income']:
                raise ValueError('Monthly savings plus expenses cannot exceed annual income')
        return v


class RetirementProjection(BaseModel):
    """
    Model for retirement projection results.
    """
    
    current_age: int
    retirement_age: int
    years_to_retirement: int
    current_savings: float
    monthly_savings: float
    annual_savings: float
    expected_returns: float
    projected_corpus: float
    retirement_goal: float
    readiness_percentage: float
    shortfall: float
    surplus: float


class AnalysisResult(BaseModel):
    """
    Model for AI analysis results.
    """
    
    summary: str
    readiness_score: float
    corpus: float
    confidence_level: str
    key_insights: list[str]
    risk_factors: list[str]


class StrategyRecommendation(BaseModel):
    """
    Model for individual strategy recommendations.
    """
    
    title: str
    description: str
    impact: str
    timeframe: str
    difficulty: str
    expected_benefit: str


class StrategyResponse(BaseModel):
    """
    Model for strategy recommendations response.
    """
    
    strategies: list[StrategyRecommendation]
    overall_priority: str
    implementation_order: list[str]


class SimulationRequest(BaseModel):
    """
    Model for simulation requests with modified parameters.
    """
    
    user_input: UserInput
    modified_parameters: dict = Field(..., description="Parameters to modify for simulation")
    simulation_type: str = Field(default="what_if", description="Type of simulation to run")


class SimulationResult(BaseModel):
    """
    Model for simulation results.
    """
    
    original_projection: RetirementProjection
    simulated_projection: RetirementProjection
    difference: dict
    recommendations: list[str]
