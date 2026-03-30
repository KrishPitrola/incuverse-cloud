"""
Utilities package for the AI-Driven Retirement Planner.
"""

from .formulas import (
    retirement_projection,
    calculate_monthly_retirement_income,
    calculate_required_monthly_savings,
    calculate_risk_score,
    simulate_scenario
)

__all__ = [
    "retirement_projection",
    "calculate_monthly_retirement_income",
    "calculate_required_monthly_savings", 
    "calculate_risk_score",
    "simulate_scenario"
]
