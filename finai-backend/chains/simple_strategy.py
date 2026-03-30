"""
Simple strategy recommendations without LangChain dependencies for Indian retirement planning.
"""

from typing import Dict, Any
from models.user_input import UserInput, StrategyRecommendation, StrategyResponse, AnalysisResult


class SimpleRetirementStrategy:
    """
    Simple retirement strategy recommendations without LangChain dependencies.
    Provides basic strategies for Indian salaried professionals.
    """
    
    def __init__(self):
        """Initialize the simple strategy generator."""
        pass
    
    def generate_strategies(self, user_input: UserInput, analysis_result: AnalysisResult, projection_data: Dict[str, Any] = None) -> StrategyResponse:
        """
        Generate personalized retirement strategies for Indian context using actual projection data.
        
        Args:
            user_input: UserInput model with financial data
            analysis_result: AnalysisResult from the analysis chain
            projection_data: Actual projection results from calculations
            
        Returns:
            StrategyResponse with personalized recommendations based on actual results
        """
        
        strategies = []
        
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
        
        savings_rate = (user_input.monthly_savings * 12 / user_input.annual_income) * 100 if user_input.annual_income > 0 else 0
        
        # Generate strategies based on actual readiness percentage and projection data
        
        # Strategy 1: Critical Gap Strategies (for low readiness)
        if readiness_percentage < 50:
            # Calculate required monthly savings to reach goal
            required_monthly = (retirement_goal - user_input.current_savings) / (years_to_retirement * 12)
            additional_monthly = max(0, required_monthly - user_input.monthly_savings)
            
            if additional_monthly > 0:
                strategies.append(StrategyRecommendation(
                    title="🚨 URGENT: Increase Monthly Savings",
                    description=f"To reach your ₹{retirement_goal:,.0f} goal, you need to save ₹{required_monthly:,.0f} monthly (currently saving ₹{user_input.monthly_savings:,.0f}). Increase by ₹{additional_monthly:,.0f} monthly immediately.",
                    impact="Critical impact on retirement security",
                    timeframe="Immediate - start next month",
                    difficulty="High",
                    expected_benefit=f"Bridges ₹{shortfall:,.0f} shortfall gap"
                ))
            
            # Extend retirement age strategy
            if years_to_retirement < 30:
                strategies.append(StrategyRecommendation(
                    title="Consider Extending Retirement Age",
                    description=f"With only {years_to_retirement} years to retirement, consider extending to age 65-67. This gives you 5-7 more years to build corpus and reduces monthly savings requirement.",
                    impact="High impact on reducing savings pressure",
                    timeframe="Immediate decision required",
                    difficulty="Medium",
                    expected_benefit="Reduces monthly savings requirement by 20-30%"
                ))
        
        # Strategy 2: Moderate Gap Strategies (for medium readiness)
        elif readiness_percentage < 80:
            # Calculate additional savings needed
            additional_monthly = (shortfall / years_to_retirement) / 12
            
            strategies.append(StrategyRecommendation(
                title="📈 Boost Monthly Savings",
                description=f"You're {readiness_percentage:.1f}% ready with ₹{shortfall:,.0f} shortfall. Increase monthly savings by ₹{additional_monthly:,.0f} to bridge the gap. This can be achieved through expense reduction or income increase.",
                impact="High impact on reaching retirement goal",
                timeframe="1-3 months to implement",
                difficulty="Medium",
                expected_benefit=f"Closes ₹{shortfall:,.0f} shortfall gap"
            ))
            
            # Investment optimization
            strategies.append(StrategyRecommendation(
                title="Optimize Investment Returns",
                description=f"With {years_to_retirement} years to retirement, consider increasing equity allocation to 70-80% for higher returns. This can potentially reduce shortfall by 20-30% through better returns.",
                impact="Medium impact on corpus growth",
                timeframe="1-2 months to rebalance",
                difficulty="Medium",
                expected_benefit="Potential 2-3% higher annual returns"
            ))
        
        # Strategy 3: Goal Achievement Strategies (for high readiness)
        elif readiness_percentage >= 100:
            strategies.append(StrategyRecommendation(
                title="🎉 Goal Achieved - Consider Early Retirement",
                description=f"Congratulations! You'll have ₹{surplus:,.0f} surplus beyond your goal. Consider early retirement at age {user_input.retirement_age - 5} or increase your lifestyle goals.",
                impact="High impact on life quality",
                timeframe="Immediate planning opportunity",
                difficulty="Easy",
                expected_benefit=f"₹{surplus:,.0f} surplus for enhanced lifestyle"
            ))
            
            strategies.append(StrategyRecommendation(
                title="Wealth Creation Beyond Retirement",
                description=f"With ₹{surplus:,.0f} surplus, consider additional wealth creation strategies like real estate, international investments, or starting a business for legacy building.",
                impact="High impact on wealth multiplication",
                timeframe="6-12 months to plan",
                difficulty="High",
                expected_benefit="Potential 2-3x wealth multiplication"
            ))
        
        # Strategy 4: Emergency Fund (for all scenarios)
        emergency_fund = user_input.monthly_expenses * 6
        strategies.append(StrategyRecommendation(
            title="Build Emergency Fund",
            description=f"Build an emergency fund of ₹{emergency_fund:,.0f} (6 months expenses) before aggressive retirement planning. This provides financial security and prevents debt during emergencies.",
            impact="High impact on financial stability",
            timeframe="3-6 months",
            difficulty="Easy",
            expected_benefit="Financial security and peace of mind"
        ))
        
        # Strategy 5: Investment Diversification (based on time horizon)
        if years_to_retirement >= 10:
            strategies.append(StrategyRecommendation(
                title="Diversify Investment Portfolio",
                description=f"With {years_to_retirement} years to retirement, consider a diversified portfolio: 70% equity, 20% debt, 10% alternative investments. This balances growth potential with risk management.",
                impact="Medium impact on risk-adjusted returns",
                timeframe="1-2 months to rebalance",
                difficulty="Medium",
                expected_benefit="Better risk-adjusted returns and portfolio stability"
            ))
        elif years_to_retirement >= 5:
            strategies.append(StrategyRecommendation(
                title="Conservative Investment Approach",
                description=f"With {years_to_retirement} years to retirement, shift to conservative allocation: 50% equity, 40% debt, 10% cash. This protects capital while maintaining some growth potential.",
                impact="Medium impact on capital preservation",
                timeframe="1-2 months to rebalance",
                difficulty="Easy",
                expected_benefit="Capital protection with moderate growth"
            ))
        else:
            strategies.append(StrategyRecommendation(
                title="Capital Preservation Focus",
                description=f"With only {years_to_retirement} years to retirement, focus on capital preservation: 30% equity, 60% debt, 10% cash. This minimizes risk while maintaining some growth.",
                impact="High impact on capital preservation",
                timeframe="Immediate rebalancing required",
                difficulty="Easy",
                expected_benefit="Maximum capital protection"
            ))
        
        # Strategy 6: Income Growth Strategy (based on readiness)
        if readiness_percentage < 80:
            strategies.append(StrategyRecommendation(
                title="Focus on Income Growth",
                description=f"With {readiness_percentage:.1f}% readiness, prioritize increasing your income through skills development, career advancement, or side income. Even a 10% income increase can significantly impact your retirement corpus.",
                impact="High impact on retirement corpus",
                timeframe="6-12 months to implement",
                difficulty="Medium",
                expected_benefit="Potential 10-20% increase in retirement corpus"
            ))
        
        # Strategy 7: Expense Optimization (based on shortfall)
        if shortfall > 0:
            monthly_expense_reduction = (shortfall / years_to_retirement) / 12
            strategies.append(StrategyRecommendation(
                title="Optimize Monthly Expenses",
                description=f"To bridge the ₹{shortfall:,.0f} shortfall, consider reducing monthly expenses by ₹{monthly_expense_reduction:,.0f}. This can be achieved through budgeting, cutting discretionary spending, or finding cheaper alternatives.",
                impact="Direct impact on shortfall reduction",
                timeframe="1-2 months to implement",
                difficulty="Medium",
                expected_benefit=f"Reduces shortfall by ₹{shortfall:,.0f}"
            ))
        
        # Strategy 8: Retirement Goal Adjustment (for critical scenarios)
        if readiness_percentage < 40:
            adjusted_goal = projected_corpus * 1.2  # 20% above projected
            strategies.append(StrategyRecommendation(
                title="Consider Adjusting Retirement Goal",
                description=f"Your current goal of ₹{retirement_goal:,.0f} may be unrealistic. Consider adjusting to ₹{adjusted_goal:,.0f} (20% above projected corpus) to make it more achievable while still providing security.",
                impact="High impact on goal achievability",
                timeframe="Immediate decision required",
                difficulty="Easy",
                expected_benefit="More realistic and achievable retirement goal"
            ))
        
        # Strategy 9: Savings Rate Optimization (if needed)
        if savings_rate < 20:
            target_savings = user_input.annual_income * 0.20
            additional_savings = target_savings - (user_input.monthly_savings * 12)
            if additional_savings > 0:
                strategies.append(StrategyRecommendation(
                    title="Increase Monthly Savings Rate",
                    description=f"Your current savings rate is {savings_rate:.1f}%. Aim for 20% by increasing monthly savings by ₹{additional_savings/12:,.0f}. This can be achieved by reducing discretionary expenses or increasing income.",
                    impact="High impact on retirement corpus",
                    timeframe="1-3 months to implement",
                    difficulty="Medium",
                    expected_benefit=f"Additional ₹{additional_savings:,.0f} annual savings"
                ))
        
        # Determine overall priority based on readiness
        if readiness_percentage < 50:
            overall_priority = "Critical"
        elif readiness_percentage < 80:
            overall_priority = "High"
        elif readiness_percentage < 100:
            overall_priority = "Medium"
        else:
            overall_priority = "Low"
        
        # Implementation order based on priority
        implementation_order = [strategy.title for strategy in strategies]
        
        return StrategyResponse(
            strategies=strategies,
            overall_priority=overall_priority,
            implementation_order=implementation_order
        )


def create_strategy_chain(openai_api_key: str = None) -> SimpleRetirementStrategy:
    """
    Factory function to create a simple strategy chain.
    
    Args:
        openai_api_key: OpenAI API key (ignored in simple version)
        
    Returns:
        SimpleRetirementStrategy instance
    """
    return SimpleRetirementStrategy()
