"""
LangChain analysis chain for AI-driven retirement planning insights.
"""

import json
import os
from typing import Dict, Any, List
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.llms import OpenAI
from langchain.chat_models import ChatOpenAI
from models.user_input import UserInput, AnalysisResult, RetirementProjection
from utils.formulas import retirement_projection, calculate_risk_score


class RetirementAnalysisChain:
    """
    LangChain-based analysis chain for retirement planning insights.
    """
    
    def __init__(self, openai_api_key: str = None):
        """
        Initialize the analysis chain with OpenAI API key.
        
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
            temperature=0.3,
            max_tokens=1000
        )
        
        # Create the analysis prompt template
        self.analysis_prompt = PromptTemplate(
            input_variables=[
                "age", "retirement_age", "annual_income", "monthly_expenses", 
                "current_savings", "monthly_savings", "retirement_goal",
                "projected_corpus", "readiness_percentage", "risk_level",
                "years_to_retirement", "shortfall", "surplus"
            ],
            template="""
You are a professional financial advisor specializing in retirement planning for Indian salaried professionals. Analyze the following user's financial situation and provide a comprehensive assessment tailored for the Indian context.

User Profile (Indian Salaried Professional):
- Age: {age} years
- Target Retirement Age: {retirement_age} years
- Years to Retirement: {years_to_retirement} years
- Annual Income: ₹{annual_income:,.2f}
- Monthly Expenses: ₹{monthly_expenses:,.2f}
- Current Savings: ₹{current_savings:,.2f}
- Monthly Savings: ₹{monthly_savings:,.2f}
- Retirement Goal: ₹{retirement_goal:,.2f}

Projection Results:
- Projected Corpus: ₹{projected_corpus:,.2f}
- Readiness Percentage: {readiness_percentage:.1f}%
- Shortfall: ₹{shortfall:,.2f}
- Surplus: ₹{surplus:,.2f}
- Risk Level: {risk_level}

Please provide a JSON response with the following structure:
{{
    "summary": "A comprehensive 2-3 sentence summary of their retirement readiness for Indian context",
    "readiness_score": {readiness_percentage},
    "corpus": {projected_corpus},
    "confidence_level": "High/Medium/Low based on data quality and time horizon",
    "key_insights": [
        "3-5 specific insights about their financial situation in Indian context",
        "Consider Indian investment options like EPF, PPF, NPS, mutual funds",
        "Include inflation impact on Indian economy",
        "Be specific and actionable for Indian salaried professionals"
    ],
    "risk_factors": [
        "List 2-4 main risk factors affecting their retirement plan in India",
        "Include Indian market risks, inflation risks, and job security risks",
        "Consider Indian economic factors and regulatory changes"
    ]
}}

Focus on Indian context:
1. Whether they're on track for their retirement goal considering Indian inflation
2. Key strengths in their current plan (EPF, PPF, mutual funds, etc.)
3. Main areas of concern or improvement for Indian salaried professionals
4. Risk factors specific to Indian economy and job market
5. Overall confidence in their retirement readiness
6. Consider Indian tax implications and investment options
7. Mention Indian retirement schemes like EPF, PPF, NPS, and mutual funds

Be specific, professional, and provide actionable insights for Indian salaried professionals. Use Indian financial terminology and consider local economic factors.
            """
        )
        
        # Create the LLM chain
        self.analysis_chain = LLMChain(
            llm=self.llm,
            prompt=self.analysis_prompt,
            output_key="analysis_result"
        )
    
    def analyze_retirement_plan(self, user_input: UserInput) -> AnalysisResult:
        """
        Analyze user's retirement plan and return AI-driven insights.
        
        Args:
            user_input: UserInput model with financial data
            
        Returns:
            AnalysisResult with AI analysis
        """
        
        # Calculate retirement projection
        projection = retirement_projection(user_input)
        
        # Calculate risk assessment
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
            "surplus": projection.surplus
        }
        
        try:
            # Run the analysis chain
            result = self.analysis_chain(chain_input)
            
            # Parse the JSON response
            analysis_text = result["analysis_result"]
            
            # Extract JSON from the response (handle cases where LLM adds extra text)
            json_start = analysis_text.find('{')
            json_end = analysis_text.rfind('}') + 1
            
            if json_start != -1 and json_end > json_start:
                json_str = analysis_text[json_start:json_end]
                analysis_data = json.loads(json_str)
            else:
                # Fallback if JSON parsing fails
                analysis_data = self._create_fallback_analysis(projection, risk_assessment)
            
            # Create and return the analysis result
            return AnalysisResult(
                summary=analysis_data.get("summary", "Analysis completed successfully."),
                readiness_score=analysis_data.get("readiness_score", projection.readiness_percentage),
                corpus=analysis_data.get("corpus", projection.projected_corpus),
                confidence_level=analysis_data.get("confidence_level", "Medium"),
                key_insights=analysis_data.get("key_insights", ["Analysis completed"]),
                risk_factors=analysis_data.get("risk_factors", ["Standard market risks apply"])
            )
            
        except Exception as e:
            print(f"Error in analysis chain: {e}")
            # Return fallback analysis
            return self._create_fallback_analysis(projection, risk_assessment)
    
    def _create_fallback_analysis(self, projection: RetirementProjection, 
                                 risk_assessment: Dict[str, Any]) -> AnalysisResult:
        """
        Create a fallback analysis when LLM chain fails.
        
        Args:
            projection: Retirement projection data
            risk_assessment: Risk assessment data
            
        Returns:
            AnalysisResult with basic analysis
        """
        
        # Determine readiness status
        if projection.readiness_percentage >= 100:
            summary = f"Excellent! You're projected to exceed your retirement goal by ${projection.surplus:,.2f}."
            confidence = "High"
        elif projection.readiness_percentage >= 80:
            summary = f"Good progress! You're {projection.readiness_percentage:.1f}% of the way to your goal."
            confidence = "Medium"
        elif projection.readiness_percentage >= 50:
            summary = f"Moderate progress. You're {projection.readiness_percentage:.1f}% of the way to your goal."
            confidence = "Medium"
        else:
            summary = f"Needs attention. You're only {projection.readiness_percentage:.1f}% of the way to your goal."
            confidence = "Low"
        
        # Generate key insights
        insights = []
        if projection.readiness_percentage >= 100:
            insights.append("You're on track to exceed your retirement goal")
        else:
            insights.append(f"You need to save an additional ${projection.shortfall:,.2f} to reach your goal")
        
        if projection.years_to_retirement > 20:
            insights.append("Long time horizon provides flexibility for investment growth")
        elif projection.years_to_retirement < 10:
            insights.append("Short time horizon requires focused savings strategy")
        
        if projection.monthly_savings > 0:
            insights.append(f"Current monthly savings of ${projection.monthly_savings:,.2f} is contributing to your goal")
        
        # Add risk factors
        risk_factors = risk_assessment.get("risk_factors", ["Standard market risks apply"])
        
        return AnalysisResult(
            summary=summary,
            readiness_score=projection.readiness_percentage,
            corpus=projection.projected_corpus,
            confidence_level=confidence,
            key_insights=insights,
            risk_factors=risk_factors
        )


def create_analysis_chain(openai_api_key: str = None) -> RetirementAnalysisChain:
    """
    Factory function to create an analysis chain.
    
    Args:
        openai_api_key: OpenAI API key (optional)
        
    Returns:
        RetirementAnalysisChain instance
    """
    return RetirementAnalysisChain(openai_api_key)
