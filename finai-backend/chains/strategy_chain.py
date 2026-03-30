"""
LangChain strategy chain for generating personalized retirement planning recommendations.
"""

import json
import os
from typing import Dict, Any, List
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.llms import OpenAI
from langchain.chat_models import ChatOpenAI
from models.user_input import UserInput, StrategyRecommendation, StrategyResponse, AnalysisResult
from utils.formulas import retirement_projection, calculate_risk_score


class RetirementStrategyChain:
    """
    LangChain-based strategy chain for generating personalized retirement recommendations.
    """
    
    def __init__(self, openai_api_key: str = None):
        """
        Initialize the strategy chain with OpenAI API key.
        
        Args:
            openai_api_key: OpenAI API key (if not provided, will use environment variable)
        """
        
        # Get API key from parameter or environment
        api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass it as parameter.")
        
        # Initialize the LLM
        self.llm = ChatOpenAI(
            openai_api_key=api_key,
            model_name="gpt-3.5-turbo",
            temperature=0.4,
            max_tokens=1200
        )
        
        # Create the strategy prompt template
        self.strategy_prompt = PromptTemplate(
            input_variables=[
                "age", "retirement_age", "annual_income", "monthly_expenses", 
                "current_savings", "monthly_savings", "retirement_goal",
                "projected_corpus", "readiness_percentage", "risk_level",
                "years_to_retirement", "shortfall", "surplus", "key_insights",
                "risk_factors", "confidence_level"
            ],
            template="""
You are a senior financial advisor with 20+ years of experience in retirement planning for Indian salaried professionals. Based on the user's financial situation and analysis, provide 3 specific, actionable strategies to improve their retirement readiness in the Indian context.

User Profile (Indian Salaried Professional):
- Age: {age} years
- Target Retirement Age: {retirement_age} years
- Years to Retirement: {years_to_retirement} years
- Annual Income: ₹{annual_income:,.2f}
- Monthly Expenses: ₹{monthly_expenses:,.2f}
- Current Savings: ₹{current_savings:,.2f}
- Monthly Savings: ₹{monthly_savings:,.2f}
- Retirement Goal: ₹{retirement_goal:,.2f}

Current Analysis:
- Projected Corpus: ${projected_corpus:,.2f}
- Readiness Percentage: {readiness_percentage:.1f}%
- Shortfall: ${shortfall:,.2f}
- Surplus: ${surplus:,.2f}
- Risk Level: {risk_level}
- Confidence Level: {confidence_level}

Key Insights: {key_insights}
Risk Factors: {risk_factors}

Provide exactly 3 strategies in JSON format:
{{
    "strategies": [
        {{
            "title": "Strategy 1 Title",
            "description": "Detailed description of the strategy and how it works",
            "impact": "Expected impact on retirement readiness (specific percentage or dollar amount)",
            "timeframe": "When to implement (immediate, 1-6 months, 6-12 months, etc.)",
            "difficulty": "Implementation difficulty (Easy/Medium/Hard)",
            "expected_benefit": "Specific expected benefit (e.g., 'Increase corpus by $50,000' or 'Improve readiness by 15%')"
        }},
        {{
            "title": "Strategy 2 Title", 
            "description": "Detailed description of the strategy and how it works",
            "impact": "Expected impact on retirement readiness",
            "timeframe": "When to implement",
            "difficulty": "Implementation difficulty",
            "expected_benefit": "Specific expected benefit"
        }},
        {{
            "title": "Strategy 3 Title",
            "description": "Detailed description of the strategy and how it works", 
            "impact": "Expected impact on retirement readiness",
            "timeframe": "When to implement",
            "difficulty": "Implementation difficulty",
            "expected_benefit": "Specific expected benefit"
        }}
    ],
    "overall_priority": "High/Medium/Low - overall priority for implementing these strategies",
    "implementation_order": ["Strategy 1 Title", "Strategy 2 Title", "Strategy 3 Title"]
}}

Strategy Guidelines for Indian Context:
1. Make strategies specific and actionable for Indian salaried professionals
2. Consider the user's age, income level, and time horizon in Indian context
3. Include Indian investment options: EPF, PPF, NPS, mutual funds, ELSS, FDs
4. Address the most critical gaps first considering Indian inflation
5. Provide realistic timeframes and difficulty levels
6. Include specific expected benefits in Indian Rupees
7. Consider Indian tax optimization (80C, 80CCD, 80D, etc.)
8. Include risk management strategies for Indian market
9. Mention Indian retirement schemes and their benefits
10. Consider Indian economic factors and job market conditions

Focus on strategies that will have the most impact on their retirement readiness in the Indian context. Include specific Indian investment vehicles and tax-saving options.
            """
        )
        
        # Create the LLM chain
        self.strategy_chain = LLMChain(
            llm=self.llm,
            prompt=self.strategy_prompt,
            output_key="strategy_result"
        )
    
    def generate_strategies(self, user_input: UserInput, analysis_result: AnalysisResult) -> StrategyResponse:
        """
        Generate personalized retirement strategies based on user input and analysis.
        
        Args:
            user_input: UserInput model with financial data
            analysis_result: AnalysisResult from the analysis chain
            
        Returns:
            StrategyResponse with personalized recommendations
        """
        
        # Calculate retirement projection for additional context
        projection = retirement_projection(user_input)
        risk_assessment = calculate_risk_score(user_input)
        
        # Prepare input for the LLM
        chain_input = {
            "age": user_input.age,
            "retirement_age": user_input.retirement_age,
            "annual_income": user_input.annual_income,
            "monthly_expenses": user_input.monthly_expenses,
            "current_savings": user_input.current_savings,
            "monthly_savings": user_input.monthly_savings,
            "retirement_goal": user_input.retirement_goal,
            "projected_corpus": projection.projected_corpus,
            "readiness_percentage": projection.readiness_percentage,
            "risk_level": risk_assessment["risk_level"],
            "years_to_retirement": projection.years_to_retirement,
            "shortfall": projection.shortfall,
            "surplus": projection.surplus,
            "key_insights": ", ".join(analysis_result.key_insights),
            "risk_factors": ", ".join(analysis_result.risk_factors),
            "confidence_level": analysis_result.confidence_level
        }
        
        try:
            # Run the strategy chain
            result = self.strategy_chain(chain_input)
            
            # Parse the JSON response
            strategy_text = result["strategy_result"]
            
            # Extract JSON from the response
            json_start = strategy_text.find('{')
            json_end = strategy_text.rfind('}') + 1
            
            if json_start != -1 and json_end > json_start:
                json_str = strategy_text[json_start:json_end]
                strategy_data = json.loads(json_str)
            else:
                # Fallback if JSON parsing fails
                strategy_data = self._create_fallback_strategies(user_input, analysis_result, projection)
            
            # Create strategy recommendations
            strategies = []
            for strategy_info in strategy_data.get("strategies", []):
                strategy = StrategyRecommendation(
                    title=strategy_info.get("title", "Strategy"),
                    description=strategy_info.get("description", "Strategy description"),
                    impact=strategy_info.get("impact", "Moderate impact"),
                    timeframe=strategy_info.get("timeframe", "6-12 months"),
                    difficulty=strategy_info.get("difficulty", "Medium"),
                    expected_benefit=strategy_info.get("expected_benefit", "Improved retirement readiness")
                )
                strategies.append(strategy)
            
            # Create and return the strategy response
            return StrategyResponse(
                strategies=strategies,
                overall_priority=strategy_data.get("overall_priority", "Medium"),
                implementation_order=strategy_data.get("implementation_order", [s.title for s in strategies])
            )
            
        except Exception as e:
            print(f"Error in strategy chain: {e}")
            # Return fallback strategies
            return self._create_fallback_strategies(user_input, analysis_result, projection)
    
    def _create_fallback_strategies(self, user_input: UserInput, 
                                   analysis_result: AnalysisResult,
                                   projection: Any) -> StrategyResponse:
        """
        Create fallback strategies when LLM chain fails.
        
        Args:
            user_input: User input data
            analysis_result: Analysis results
            projection: Retirement projection
            
        Returns:
            StrategyResponse with basic strategies
        """
        
        strategies = []
        
        # Strategy 1: Increase savings
        if projection.readiness_percentage < 100:
            strategies.append(StrategyRecommendation(
                title="Increase Monthly Savings",
                description=f"Consider increasing your monthly savings from ${user_input.monthly_savings:,.2f} to improve your retirement readiness. Even a small increase can have significant long-term impact due to compound interest.",
                impact="High impact on retirement corpus",
                timeframe="Immediate",
                difficulty="Medium",
                expected_benefit=f"Could increase corpus by ${projection.shortfall * 0.3:,.2f} or more"
            ))
        
        # Strategy 2: Optimize investments
        strategies.append(StrategyRecommendation(
            title="Optimize Investment Strategy",
            description="Review and potentially adjust your investment allocation to maximize returns while managing risk. Consider diversifying across different asset classes and rebalancing regularly.",
            impact="Medium to high impact on returns",
            timeframe="1-3 months",
            difficulty="Medium",
            expected_benefit="Potential 1-2% improvement in annual returns"
        ))
        
        # Strategy 3: Reduce expenses or increase income
        if projection.readiness_percentage < 80:
            strategies.append(StrategyRecommendation(
                title="Reduce Expenses or Increase Income",
                description="Look for opportunities to reduce monthly expenses or increase income through side hustles, career advancement, or skill development. This creates more room for savings.",
                impact="High impact on savings capacity",
                timeframe="3-6 months",
                difficulty="Hard",
                expected_benefit="Could increase monthly savings by 20-50%"
            ))
        else:
            strategies.append(StrategyRecommendation(
                title="Tax Optimization",
                description="Maximize tax-advantaged accounts like 401(k), IRA, and HSA. Consider Roth vs. traditional account strategies and tax-loss harvesting.",
                impact="Medium impact on after-tax returns",
                timeframe="1-6 months",
                difficulty="Medium",
                expected_benefit="Potential 10-20% improvement in after-tax retirement income"
            ))
        
        return StrategyResponse(
            strategies=strategies,
            overall_priority="High" if projection.readiness_percentage < 80 else "Medium",
            implementation_order=[s.title for s in strategies]
        )


def create_strategy_chain(openai_api_key: str = None) -> RetirementStrategyChain:
    """
    Factory function to create a strategy chain.
    
    Args:
        openai_api_key: OpenAI API key (optional)
        
    Returns:
        RetirementStrategyChain instance
    """
    return RetirementStrategyChain(openai_api_key)
