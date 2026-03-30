#!/usr/bin/env python3
"""
Test script to debug the API connection between frontend and finai-backend
"""

import requests
import json

def test_analyze_endpoint():
    """Test the /analyze endpoint with sample data"""
    
    # Sample data matching the frontend form
    test_data = {
        "age": 30,
        "retirement_age": 60,
        "annual_income": 1200000,
        "monthly_expenses": 60000,
        "current_savings": 500000,
        "monthly_savings": 25000,
        "retirement_goal": 50000000,
        "expected_inflation": 6.0,
        "expected_returns": 8.0,
        "employer_pf": 12,
        "epf_balance": 200000,
        "ppf_balance": 100000,
        "nps_balance": 50000,
        "other_income": 0
    }
    
    print("Testing /analyze endpoint...")
    print(f"Data: {json.dumps(test_data, indent=2)}")
    
    try:
        response = requests.post(
            "http://localhost:8000/analyze",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success!")
            print(f"Response: {json.dumps(result, indent=2)}")
        else:
            print("❌ Error!")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: finai-backend is not running on port 8000")
    except requests.exceptions.Timeout:
        print("❌ Timeout: Request took too long")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_health_endpoint():
    """Test the health endpoint"""
    print("\nTesting /health endpoint...")
    
    try:
        response = requests.get("http://localhost:8000/health", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")

if __name__ == "__main__":
    print("🔍 Testing finai-backend API...")
    test_health_endpoint()
    test_analyze_endpoint()
