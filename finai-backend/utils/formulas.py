"""
Financial calculation utilities for retirement planning.
Implements compound interest calculations and retirement readiness assessments.
"""

import math
from typing import Dict, Any
from models.user_input import UserInput, RetirementProjection


def retirement_projection(user_input: UserInput) -> RetirementProjection:
    """
    Calculate retirement corpus projection using compound interest formula.
    
    Formula: A = P(1 + r)^t + PMT * [((1 + r)^t - 1) / r]
    Where:
    - A = Final amount (projected corpus)
    - P = Principal (current savings)
    - r = Annual interest rate (as decimal)
    - t = Time in years
    - PMT = Annual savings amount
    
    Args:
        user_input: UserInput model containing all financial parameters
        
    Returns:
        RetirementProjection with calculated values
    """
    
    # Extract parameters
    current_age = user_input.age
    retirement_age = user_input.retirement_age
    years_to_retirement = retirement_age - current_age
    
    current_savings = user_input.current_savings
    monthly_savings = user_input.monthly_savings
    annual_savings = monthly_savings * 12
    expected_returns = user_input.expected_returns / 100  # Convert percentage to decimal
    retirement_goal = user_input.retirement_goal
    
    # Calculate projected corpus using compound interest
    # Future value of current savings
    future_value_current_savings = current_savings * (1 + expected_returns) ** years_to_retirement
    
    # Future value of annual savings (annuity)
    if expected_returns > 0:
        future_value_annuity = annual_savings * (((1 + expected_returns) ** years_to_retirement - 1) / expected_returns)
    else:
        # If no returns, just multiply by years
        future_value_annuity = annual_savings * years_to_retirement
    
    # Total projected corpus
    projected_corpus = future_value_current_savings + future_value_annuity
    
    # Calculate readiness percentage (capped at 100%)
    readiness_percentage = min(100, (projected_corpus / retirement_goal) * 100) if retirement_goal > 0 else 0
    
    # Calculate shortfall or surplus
    shortfall = max(0, retirement_goal - projected_corpus)
    surplus = max(0, projected_corpus - retirement_goal)
    
    return RetirementProjection(
        current_age=current_age,
        retirement_age=retirement_age,
        years_to_retirement=years_to_retirement,
        current_savings=current_savings,
        monthly_savings=monthly_savings,
        annual_savings=annual_savings,
        expected_returns=expected_returns * 100,  # Convert back to percentage
        projected_corpus=round(projected_corpus, 2),
        retirement_goal=retirement_goal,
        readiness_percentage=round(readiness_percentage, 2),
        shortfall=round(shortfall, 2),
        surplus=round(surplus, 2)
    )


def calculate_monthly_retirement_income(projection: RetirementProjection, 
                                           inflation_rate: float = 3.0,
                                           retirement_years: int = 30) -> Dict[str, float]:
    """
    Calculate monthly retirement income based on projected corpus.
    
    Args:
        projection: RetirementProjection object
        inflation_rate: Expected inflation rate (default 3%)
        retirement_years: Expected retirement duration (default 30 years)
        
    Returns:
        Dictionary with monthly income calculations
    """
    
    corpus = projection.projected_corpus
    annual_inflation = inflation_rate / 100
    
    # Calculate monthly income using 4% rule (conservative withdrawal rate)
    annual_withdrawal_rate = 0.04
    annual_income = corpus * annual_withdrawal_rate
    monthly_income = annual_income / 12
    
    # Calculate inflation-adjusted income
    inflation_adjusted_annual = annual_income * ((1 + annual_inflation) ** projection.years_to_retirement)
    inflation_adjusted_monthly = inflation_adjusted_annual / 12
    
    return {
        "monthly_income": round(monthly_income, 2),
        "annual_income": round(annual_income, 2),
        "inflation_adjusted_monthly": round(inflation_adjusted_monthly, 2),
        "inflation_adjusted_annual": round(inflation_adjusted_annual, 2)
    }


def calculate_required_monthly_savings(target_corpus: float, 
                                     current_savings: float,
                                     years_to_retirement: int,
                                     expected_returns: float) -> float:
    """
    Calculate required monthly savings to reach target corpus.
    
    Args:
        target_corpus: Target retirement corpus
        current_savings: Current savings amount
        years_to_retirement: Years until retirement
        expected_returns: Expected annual returns (as decimal)
        
    Returns:
        Required monthly savings amount
    """
    
    if years_to_retirement <= 0:
        return 0
    
    # Future value of current savings
    future_value_current = current_savings * (1 + expected_returns) ** years_to_retirement
    
    # Remaining amount needed from savings
    remaining_needed = target_corpus - future_value_current
    
    if remaining_needed <= 0:
        return 0
    
    # Calculate required annual savings
    if expected_returns > 0:
        required_annual = remaining_needed * (expected_returns / ((1 + expected_returns) ** years_to_retirement - 1))
    else:
        required_annual = remaining_needed / years_to_retirement
    
    return round(required_annual / 12, 2)


def calculate_risk_score(user_input: UserInput) -> Dict[str, Any]:
    """
    Calculate risk assessment score based on user inputs.
    
    Args:
        user_input: UserInput model
        
    Returns:
        Dictionary with risk assessment
    """
    
    risk_factors = []
    risk_score = 0
    
    # Age risk (younger = more time to recover from market downturns)
    if user_input.age < 30:
        risk_score += 1  # Lower risk
    elif user_input.age > 50:
        risk_score += 3  # Higher risk
    
    # Savings rate risk
    savings_rate = (user_input.monthly_savings * 12) / user_input.annual_income
    if savings_rate < 0.1:  # Less than 10%
        risk_score += 3
        risk_factors.append("Low savings rate")
    elif savings_rate < 0.15:  # Less than 15%
        risk_score += 2
        risk_factors.append("Moderate savings rate")
    elif savings_rate >= 0.2:  # 20% or more
        risk_score -= 1
        risk_factors.append("Excellent savings rate")
    
    # Income stability (simplified - based on income level)
    if user_input.annual_income < 50000:
        risk_score += 2
        risk_factors.append("Lower income level")
    elif user_input.annual_income > 100000:
        risk_score -= 1
        risk_factors.append("Higher income level")
    
    # Time to retirement
    years_to_retirement = user_input.retirement_age - user_input.age
    if years_to_retirement < 10:
        risk_score += 3
        risk_factors.append("Short time to retirement")
    elif years_to_retirement > 30:
        risk_score -= 1
        risk_factors.append("Long time horizon")
    
    # Determine risk level
    if risk_score <= 2:
        risk_level = "Low"
    elif risk_score <= 5:
        risk_level = "Medium"
    else:
        risk_level = "High"
    
    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "risk_factors": risk_factors,
        "recommendations": _get_risk_recommendations(risk_level, risk_factors)
    }


def _get_risk_recommendations(risk_level: str, risk_factors: list) -> list:
    """Get recommendations based on risk assessment."""
    
    recommendations = []
    
    if risk_level == "High":
        recommendations.extend([
            "Consider increasing your savings rate",
            "Review your investment strategy for higher returns",
            "Consider working longer or reducing retirement expenses"
        ])
    elif risk_level == "Medium":
        recommendations.extend([
            "Monitor your progress regularly",
            "Consider optimizing your investment allocation",
            "Look for opportunities to increase income or reduce expenses"
        ])
    else:
        recommendations.extend([
            "Maintain your current strategy",
            "Consider more aggressive investments if comfortable with risk",
            "Review and rebalance your portfolio regularly"
        ])
    
    return recommendations


def simulate_scenario(user_input: UserInput, 
                     modified_params: Dict[str, Any]) -> RetirementProjection:
    """
    Simulate retirement projection with modified parameters.
    
    Args:
        user_input: Original user input
        modified_params: Dictionary of parameters to modify
        
    Returns:
        New retirement projection with modified parameters
    """
    
    # Create a copy of user input with modified parameters
    modified_input = user_input.copy(update=modified_params)
    
    # Calculate new projection
    return retirement_projection(modified_input)
