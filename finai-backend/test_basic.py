"""
Basic test script to verify the retirement planner functionality.
Run this to test the core features without requiring OpenAI API key.
"""

import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.user_input import UserInput
from utils.formulas import retirement_projection, calculate_risk_score

def test_basic_functionality():
    """Test basic retirement planning functionality."""
    
    print("🧪 Testing AI-Driven Retirement Planner Backend")
    print("=" * 50)
    
    # Test 1: Create user input
    print("\n1. Testing UserInput model...")
    try:
        user_input = UserInput(
            age=35,
            retirement_age=65,
            annual_income=75000,
            monthly_expenses=4000,
            current_savings=50000,
            monthly_savings=1000,
            retirement_goal=1000000,
            expected_inflation=3.0,
            expected_returns=6.0
        )
        print("✅ UserInput model created successfully")
        print(f"   User: {user_input.age} years old, retiring at {user_input.retirement_age}")
        print(f"   Income: ${user_input.annual_income:,}, Savings: ${user_input.current_savings:,}")
    except Exception as e:
        print(f"❌ UserInput model failed: {e}")
        return False
    
    # Test 2: Calculate retirement projection
    print("\n2. Testing retirement projection...")
    try:
        projection = retirement_projection(user_input)
        print("✅ Retirement projection calculated successfully")
        print(f"   Projected corpus: ${projection.projected_corpus:,.2f}")
        print(f"   Readiness percentage: {projection.readiness_percentage:.1f}%")
        print(f"   Years to retirement: {projection.years_to_retirement}")
        
        if projection.readiness_percentage >= 100:
            print(f"   🎉 Surplus: ${projection.surplus:,.2f}")
        else:
            print(f"   ⚠️  Shortfall: ${projection.shortfall:,.2f}")
            
    except Exception as e:
        print(f"❌ Retirement projection failed: {e}")
        return False
    
    # Test 3: Calculate risk assessment
    print("\n3. Testing risk assessment...")
    try:
        risk_assessment = calculate_risk_score(user_input)
        print("✅ Risk assessment calculated successfully")
        print(f"   Risk level: {risk_assessment['risk_level']}")
        print(f"   Risk score: {risk_assessment['risk_score']}")
        print(f"   Risk factors: {', '.join(risk_assessment['risk_factors'])}")
    except Exception as e:
        print(f"❌ Risk assessment failed: {e}")
        return False
    
    # Test 4: Test different scenarios
    print("\n4. Testing different scenarios...")
    try:
        # High saver scenario
        high_saver = UserInput(
            age=30,
            retirement_age=60,
            annual_income=100000,
            monthly_expenses=5000,
            current_savings=100000,
            monthly_savings=2000,
            retirement_goal=2000000,
            expected_returns=7.0
        )
        
        high_saver_projection = retirement_projection(high_saver)
        print(f"   High saver readiness: {high_saver_projection.readiness_percentage:.1f}%")
        
        # Conservative scenario
        conservative = UserInput(
            age=45,
            retirement_age=65,
            annual_income=60000,
            monthly_expenses=3500,
            current_savings=20000,
            monthly_savings=500,
            retirement_goal=800000,
            expected_returns=5.0
        )
        
        conservative_projection = retirement_projection(conservative)
        print(f"   Conservative readiness: {conservative_projection.readiness_percentage:.1f}%")
        
        print("✅ Scenario testing completed successfully")
        
    except Exception as e:
        print(f"❌ Scenario testing failed: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 All basic tests passed! The retirement planner is working correctly.")
    print("\nNext steps:")
    print("1. Set your OpenAI API key in the .env file")
    print("2. Install dependencies: pip install -r requirements.txt")
    print("3. Run the server: uvicorn main:app --reload")
    print("4. Test the API endpoints at http://localhost:8000/docs")
    
    return True

if __name__ == "__main__":
    success = test_basic_functionality()
    sys.exit(0 if success else 1)
