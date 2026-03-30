"""
Simple analysis without LangChain dependencies for Indian retirement planning.
"""

from typing import Dict, Any
from models.user_input import UserInput, AnalysisResult


class SimpleRetirementAnalysis:
    """
    Simple retirement analysis without LangChain dependencies.
    Provides basic analysis for Indian salaried professionals.
    """
    
    def __init__(self):
        """Initialize the simple analysis."""
        pass
    
    def analyze_retirement_plan(self, user_input: UserInput, projection_data: Dict[str, Any] = None) -> AnalysisResult:
        """
        Analyze user's retirement plan with Indian context using actual projection data.
        
        Args:
            user_input: UserInput model with financial data
            projection_data: Actual projection results from calculations
            
        Returns:
            AnalysisResult with optimized analysis based on actual results
        """
        
        # Use projection data if available, otherwise calculate basic metrics
        if projection_data:
            readiness_percentage = projection_data.get('readiness_percentage', 0)
            projected_corpus = projection_data.get('projected_corpus', 0)
            retirement_goal = projection_data.get('retirement_goal', 0)
            shortfall = projection_data.get('shortfall', 0)
            surplus = projection_data.get('surplus', 0)
            years_to_retirement = projection_data.get('years_to_retirement', user_input.retirement_age - user_input.age)
        else:
            # Fallback to basic calculations
            years_to_retirement = user_input.retirement_age - user_input.age
            readiness_percentage = 0
            projected_corpus = 0
            retirement_goal = user_input.retirement_goal
            shortfall = retirement_goal
            surplus = 0
        
        annual_savings = user_input.monthly_savings * 12
        savings_rate = (annual_savings / user_input.annual_income) * 100 if user_input.annual_income > 0 else 0
        
        # Generate dynamic summary based on actual results
        if readiness_percentage >= 100:
            summary = f"🎉 Excellent! You're on track to exceed your retirement goal by ₹{surplus:,.0f}. Your projected corpus of ₹{projected_corpus:,.0f} is {readiness_percentage:.0f}% of your target."
        elif readiness_percentage >= 80:
            summary = f"✅ Great progress! You're {readiness_percentage:.1f}% ready for retirement. You need ₹{shortfall:,.0f} more to reach your goal of ₹{retirement_goal:,.0f}."
        elif readiness_percentage >= 60:
            summary = f"📈 Good foundation! You're {readiness_percentage:.1f}% ready. To reach your ₹{retirement_goal:,.0f} goal, you need to increase savings or extend timeline."
        elif readiness_percentage >= 40:
            summary = f"⚠️ Needs attention! You're only {readiness_percentage:.1f}% ready. Consider increasing monthly savings or adjusting your retirement goal."
        else:
            summary = f"🚨 Critical situation! You're only {readiness_percentage:.1f}% ready. Immediate action required to secure your retirement."
        
        # Generate dynamic key insights based on actual results
        insights = []
        
        # Readiness-based insights
        if readiness_percentage >= 100:
            insights.append(f"🎯 Goal achieved! You'll have ₹{surplus:,.0f} surplus beyond your retirement needs")
            insights.append("Consider early retirement or increasing lifestyle goals")
        elif readiness_percentage >= 80:
            insights.append(f"💰 Almost there! Just ₹{shortfall:,.0f} shortfall to reach your goal")
            insights.append("Small increase in savings or better returns can bridge the gap")
        elif readiness_percentage >= 60:
            insights.append(f"📊 Moderate progress: ₹{shortfall:,.0f} shortfall needs attention")
            insights.append("Consider increasing monthly savings by 10-20% or extending retirement age")
        elif readiness_percentage >= 40:
            insights.append(f"⚠️ Significant gap: ₹{shortfall:,.0f} shortfall requires immediate action")
            insights.append("Consider aggressive savings increase or revising retirement goals")
        else:
            insights.append(f"🚨 Critical gap: ₹{shortfall:,.0f} shortfall needs urgent attention")
            insights.append("Consider major lifestyle changes or extending retirement timeline")
        
        # Age-based insights with actual data
        if user_input.age < 30:
            insights.append(f"⏰ Young age advantage: {years_to_retirement} years for compound growth")
            insights.append("Consider higher equity allocation (70-80%) for long-term growth")
        elif user_input.age < 45:
            insights.append(f"🎯 Mid-career phase: {years_to_retirement} years to retirement")
            insights.append("Focus on maximizing EPF contributions and tax-saving investments")
        else:
            insights.append(f"⏳ Approaching retirement: {years_to_retirement} years left")
            insights.append("Consider conservative allocation and guaranteed returns")
        
        # Income-based insights
        if user_input.annual_income >= 1500000:  # ₹15LPA+
            insights.append("💼 Higher income bracket - maximize tax benefits under 80C, 80CCD")
            insights.append("Consider ELSS mutual funds for tax benefits and equity exposure")
        elif user_input.annual_income >= 800000:  # ₹8LPA+
            insights.append("🏠 Middle-class income - focus on EPF, PPF, and systematic investments")
            insights.append("Consider NPS for additional tax benefits and retirement planning")
        else:
            insights.append("📈 Growing income phase - start with basic EPF and gradually increase")
            insights.append("Focus on building emergency fund before aggressive retirement planning")
        
        # Savings rate insights with specific recommendations
        if savings_rate < 15:
            required_savings = (user_input.annual_income * 0.15) / 12
            insights.append(f"💡 Increase monthly savings to ₹{required_savings:,.0f} (15% of income) for better security")
            insights.append("Consider reducing discretionary expenses to boost savings rate")
        elif savings_rate < 20:
            insights.append(f"✅ Good savings rate of {savings_rate:.1f}% - consider increasing to 20%")
            insights.append("Small increases can significantly impact retirement corpus")
        else:
            insights.append(f"🎉 Excellent savings rate of {savings_rate:.1f}% - keep it up!")
            insights.append("Consider additional investments for wealth creation")
        
        # Projection-specific insights
        if projected_corpus > 0:
            monthly_required = (retirement_goal - user_input.current_savings) / (years_to_retirement * 12)
            if user_input.monthly_savings < monthly_required:
                insights.append(f"📊 To reach your goal, consider saving ₹{monthly_required:,.0f} monthly")
            else:
                insights.append(f"✅ Current savings of ₹{user_input.monthly_savings:,.0f} monthly is on track")
        
        # Generate risk factors based on actual situation
        risk_factors = []
        
        # Readiness-based risks
        if readiness_percentage < 50:
            risk_factors.append("Low retirement readiness requires immediate action")
            risk_factors.append("Consider extending retirement age or increasing savings significantly")
        
        # Age-based risks
        if user_input.age > 50:
            risk_factors.append("Short time horizon requires conservative investment approach")
        if user_input.age < 35 and readiness_percentage < 30:
            risk_factors.append("Young age with low readiness - time to start aggressive planning")
        
        # Income-based risks
        if user_input.annual_income < 1000000:  # Less than ₹10LPA
            risk_factors.append("Lower income may limit investment options and tax benefits")
        
        # General Indian context risks
        risk_factors.extend([
            "Indian inflation rate (6%+) can erode purchasing power over time",
            "Job market volatility in Indian IT sector requires emergency fund planning",
            "Healthcare costs in India are rising and need to be factored in",
            "Currency depreciation risk for international investments"
        ])
        
        # Determine confidence level based on actual results
        if readiness_percentage >= 80 and savings_rate >= 20:
            confidence_level = "High"
        elif readiness_percentage >= 60 and savings_rate >= 15:
            confidence_level = "Medium"
        else:
            confidence_level = "Low"
        
        return AnalysisResult(
            summary=summary,
            readiness_score=readiness_percentage,
            corpus=projected_corpus,
            confidence_level=confidence_level,
            key_insights=insights,
            risk_factors=risk_factors
        )


def create_analysis_chain(openai_api_key: str = None) -> SimpleRetirementAnalysis:
    """
    Factory function to create a simple analysis chain.
    
    Args:
        openai_api_key: OpenAI API key (ignored in simple version)
        
    Returns:
        SimpleRetirementAnalysis instance
    """
    return SimpleRetirementAnalysis()
