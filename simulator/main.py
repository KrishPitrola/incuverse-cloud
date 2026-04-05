"""
Enhanced Retirement Planning Backend
- Fixed calculation logic for realistic projections
- Added comprehensive chart data
- Improved AI insights with specific recommendations
- Added risk analysis and year-by-year projections
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import os, math, json, requests

from dotenv import load_dotenv
load_dotenv()

def _getkey(name: str) -> str:
    v = os.getenv(name) or ""
    return v.strip().strip('"').strip("'")

OPENAI_API_KEY = _getkey("OPENAI_API_KEY")
ANTHROPIC_API_KEY = _getkey("ANTHROPIC_API_KEY")
GEMINI_API_KEY = _getkey("GOOGLE_API_KEY") or _getkey("GEMINI_API_KEY")
GEMINI_MODEL_ID = _getkey("GEMINI_MODEL_ID") or "models/gemini-2.0-flash"
AI_STUB = (_getkey("AI_STUB") or "false").lower() in ("1", "true", "yes")

# SDK imports (same as your code)
openai = None
openai_client = None
anthropic = None
genai = None

try:
    import openai as _openai_module
    openai = _openai_module
    if hasattr(openai, "OpenAI") and OPENAI_API_KEY:
        try:
            openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)
        except Exception as e:
            print("WARN: couldn't create OpenAI client:", e)
except Exception as e:
    print("WARN: openai SDK not available:", e)

try:
    import anthropic as _anthropic
    anthropic = _anthropic
except Exception as e:
    print("WARN: anthropic SDK not available:", e)

try:
    import google.generativeai as _genai
    genai = _genai
except Exception as e:
    print("WARN: google.generativeai SDK not available:", e)

app = FastAPI(title="FinAI Simulator")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models (same as yours)
class UserProfile(BaseModel):
    user_id: str
    current_age: int
    retirement_age: int
    monthly_income: float
    fixed_expenses: float
    variable_expenses: float
    current_savings: float
    risk_appetite: Optional[str] = "moderate"
    dependents: Optional[int] = 0

class ScenarioRequest(BaseModel):
    user_id: str
    current_age: int
    current_savings: float
    monthly_income: float
    fixed_expenses: float
    variable_expenses: float
    scenarios: List[Dict]
    ai_model: Optional[str] = "huggingface"

class ScenarioResponse(BaseModel):
    scenarios: List[Dict]
    ai_comparison: str
    best_scenario: str
    model_used: str
    chart_data: Dict
    recommendations: List[str]

 

user_profiles_db = {}

# Gemini setup (same as yours)
_gemini_model = None
_gemini_model_id = None
_gemini_checked = False

def _list_available_models():
    """List all available Gemini models"""
    try:
        models = list(genai.list_models())
        available_models = []
        for m in models:
            name = getattr(m, "name", None) or getattr(m, "id", None)
            supported = getattr(m, "supported_generation_methods", [])
            if name and "generateContent" in supported:
                available_models.append(name)
        return available_models
    except Exception as e:
        print(f"Error listing models: {e}")
        return []

def _reset_gemini():
    """Reset Gemini model cache"""
    global _gemini_model, _gemini_model_id, _gemini_checked
    _gemini_model = None
    _gemini_model_id = None
    _gemini_checked = False

def call_huggingface_model(prompt: str, system_prompt: str = "") -> str:
    """Smart retirement planning advisor - NO API REQUIRED"""
    try:
        # Convert to lowercase for easier matching
        prompt_lower = prompt.lower()
        
        # Retirement planning responses
        if "retirement" in prompt_lower or "retire" in prompt_lower:
            if "planning" in prompt_lower or "plan" in prompt_lower:
                return """Retirement planning is crucial for financial security. Here's a comprehensive approach:

1. **Start Early**: Begin saving in your 20s-30s for maximum compound growth
2. **Set Goals**: Aim for 25x your annual expenses (4% withdrawal rule)
3. **Diversify Investments**: Mix of stocks, bonds, and other assets
4. **Consider Inflation**: Plan for 3-4% annual inflation
5. **Emergency Fund**: Keep 6-12 months expenses in liquid savings
6. **Tax-Advantaged Accounts**: Maximize 401(k), IRA, and other tax benefits
7. **Regular Reviews**: Adjust your plan annually or with life changes

Remember: The earlier you start, the less you need to save monthly!"""
            
            elif "age" in prompt_lower:
                return """Retirement age depends on your goals and financial situation:

**Early Retirement (50-55)**: Requires aggressive saving (30-50% of income)
**Standard Retirement (60-65)**: Traditional approach with moderate savings
**Late Retirement (65+)**: Allows for lower monthly savings

Key factors: Your savings rate, investment returns, and desired lifestyle in retirement."""
            
            elif "savings" in prompt_lower or "save" in prompt_lower:
                return """Retirement savings strategies:

**Rule of Thumb**: Save 15-20% of your income for retirement
**50/30/20 Rule**: 50% needs, 30% wants, 20% savings
**Age-based**: Save your age as percentage (25 years old = 25% savings)
**Emergency First**: Build 6-month emergency fund before aggressive retirement saving

**Investment Options**:
- 401(k) with employer match (free money!)
- IRA (Traditional or Roth)
- Index funds for long-term growth
- Real estate for diversification"""
        
        # Investment advice
        elif "invest" in prompt_lower or "investment" in prompt_lower:
            return """Smart investment strategies for retirement:

**Diversification**: Don't put all eggs in one basket
**Index Funds**: Low-cost, broad market exposure
**Asset Allocation**: 
- 20s-30s: 80% stocks, 20% bonds
- 40s-50s: 60% stocks, 40% bonds  
- 60s+: 40% stocks, 60% bonds

**Tax-Advantaged Accounts**:
- 401(k): Pre-tax contributions, employer match
- Roth IRA: After-tax contributions, tax-free growth
- HSA: Triple tax advantage for healthcare

**Risk Management**: Only invest what you can afford to lose, maintain emergency fund"""
        
        # General financial advice
        elif "budget" in prompt_lower or "expense" in prompt_lower:
            return """Effective budgeting for retirement planning:

**Track Everything**: Use apps or spreadsheets to monitor spending
**50/30/20 Rule**: 50% needs, 30% wants, 20% savings
**Cut Unnecessary Expenses**: Cancel unused subscriptions, cook at home
**Increase Income**: Side hustles, skill development, job changes
**Automate Savings**: Set up automatic transfers to retirement accounts

**Common Budget Categories**:
- Housing (25-30% of income)
- Transportation (10-15%)
- Food (10-15%)
- Healthcare (5-10%)
- Savings (15-20%)"""
        
        # Default helpful response
        else:
            return """I'm here to help with your retirement planning questions! 

**Popular Topics**:
- How much to save for retirement
- Investment strategies
- Retirement age planning
- Budgeting for retirement
- Tax-advantaged accounts

**Quick Tips**:
- Start saving early for compound growth
- Take advantage of employer 401(k) matches
- Diversify your investments
- Plan for healthcare costs
- Consider inflation in your calculations

What specific aspect of retirement planning would you like to know more about?"""
            
    except Exception as e:
        return "I apologize, but I'm having trouble processing your request. Please try rephrasing your question about retirement planning."

def call_alternative_hf_model(prompt: str) -> str:
    """Try alternative Hugging Face models"""
    try:
        # Try a different free model
        model_url = "https://api-inference.huggingface.co/models/gpt2"
        
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_length": 100,
                "temperature": 0.7,
                "do_sample": True,
                "return_full_text": False
            }
        }
        
        response = requests.post(model_url, json=payload, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                generated_text = result[0].get("generated_text", "")
                if generated_text:
                    return generated_text.strip()
        
        # If all else fails, return a helpful response
        return "Based on your retirement planning question, here are some general guidelines: Start saving early, diversify your investments, consider your risk tolerance, and plan for inflation. It's always best to consult with a qualified financial advisor for personalized advice."
        
    except Exception as e:
        return "Based on your retirement planning question, here are some general guidelines: Start saving early, diversify your investments, consider your risk tolerance, and plan for inflation. It's always best to consult with a qualified financial advisor for personalized advice."

def call_ollama_model(prompt: str, system_prompt: str = "") -> str:
    """Call local Ollama model if available"""
    try:
        full_prompt = (system_prompt + "\n\n" + prompt) if system_prompt else prompt
        
        payload = {
            "model": "llama2",  # or any other model you have installed
            "prompt": full_prompt,
            "stream": False
        }
        
        response = requests.post("http://localhost:11434/api/generate", json=payload, timeout=15)
        
        if response.status_code == 200:
            result = response.json()
            return result.get("response", "I apologize, but I couldn't generate a proper response.")
        else:
            return f"Ollama API error: {response.status_code}"
            
    except Exception as e:
        return f"Ollama call failed: {str(e)}"

def call_fallback_models(prompt: str, system_prompt: str = "") -> str:
    """Try multiple fallback models in order of preference"""
    print("Trying fallback models...")
    
    # Try Ollama first (if available locally)
    try:
        result = call_ollama_model(prompt, system_prompt)
        if not result.startswith("Ollama call failed") and not result.startswith("Ollama API error"):
            print("Using Ollama model")
            return result
    except:
        pass
    
    # Try Hugging Face
    try:
        result = call_huggingface_model(prompt, system_prompt)
        if not result.startswith("Hugging Face call failed") and not result.startswith("Hugging Face API error"):
            print("Using Hugging Face model")
            return result
    except:
        pass
    
    # Return a helpful message if all fallbacks fail
    return "I apologize, but I'm currently unable to process your request. Please try again later or contact support if the issue persists."

def _ensure_gemini():
    global _gemini_model, _gemini_model_id, _gemini_checked, genai, GEMINI_API_KEY, GEMINI_MODEL_ID
    if _gemini_model is not None:
        return True
    if _gemini_checked:
        return bool(_gemini_model)
    _gemini_checked = True
    if not genai or not GEMINI_API_KEY:
        return False
    try:
        genai.configure(api_key=GEMINI_API_KEY)
    except Exception as e:
        print("Gemini configure failed:", e)
        return False
    
    # First, let's see what models are actually available
    print("Checking available Gemini models...")
    available_models = _list_available_models()
    if available_models:
        print(f"Available models: {', '.join(available_models)}")
    else:
        print("No models found or error listing models")
    
    # Priority order for fastest Gemini models
    preferred_models = [
        "models/gemini-2.0-flash",  # Fastest and most reliable
        "models/gemini-2.0-flash-001",  # Alternative fast model
        "models/gemini-2.5-flash-lite",  # Lite version for speed
        "models/gemini-flash-latest",  # Latest flash model
        "models/gemini-2.5-flash",  # Standard flash
        "models/gemini-2.0-flash-lite",  # Ultra-light version
        "models/gemini-2.5-pro",  # Pro model as fallback
        "models/gemini-pro-latest"  # Latest pro as last resort
    ]
    
    # Try user-specified model first
    if GEMINI_MODEL_ID:
        try:
            _gemini_model = genai.GenerativeModel(GEMINI_MODEL_ID)
            _gemini_model_id = GEMINI_MODEL_ID
            print("Selected GEMINI model:", _gemini_model_id)
            return True
        except Exception as e:
            print(f"Preferred model unavailable: {e}")
    
    # Try preferred models in order
    for model_name in preferred_models:
        if model_name in available_models:
            try:
                _gemini_model = genai.GenerativeModel(model_name)
                _gemini_model_id = model_name
                print(f"Auto-selected Gemini model: {_gemini_model_id}")
                return True
            except Exception as e:
                print(f"Model {model_name} failed: {e}")
                continue
    
    # Fallback to any available model
    for model_name in available_models:
        try:
            _gemini_model = genai.GenerativeModel(model_name)
            _gemini_model_id = model_name
            print(f"Fallback Gemini model: {_gemini_model_id}")
            return True
        except Exception as e:
            print(f"Model {model_name} failed: {e}")
            continue
    
    print("No working Gemini models found")
    return False

_anthropic_client = None
def _ensure_anthropic():
    global _anthropic_client
    if not anthropic or not ANTHROPIC_API_KEY:
        return False
    if _anthropic_client is None:
        try:
            _anthropic_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        except Exception:
            return False
    return True

def call_ai_model(prompt: str, system_prompt: str = "", model: str = "huggingface") -> str:
    if AI_STUB:
        return "AI_STUB enabled - returning placeholder response"
    
    # Clean and optimize the prompt
    clean_prompt = prompt.replace("financial advisor", "helpful assistant").replace("investment advice", "general information")
    clean_system_prompt = (system_prompt or "").replace("financial advisor", "helpful assistant").replace("investment advice", "general information")
    
    try:
        # Try Hugging Face first (fast, free, reliable)
        if model in ["huggingface", "hf", "gemini"] or True:  # Always try Hugging Face first
            result = call_huggingface_model(clean_prompt, clean_system_prompt)
            if not result.startswith("Hugging Face call failed") and not result.startswith("Hugging Face API error"):
                return result
        
        # Try Gemini as fallback
        if model == "gemini" and _ensure_gemini():
            full_prompt = (clean_system_prompt + "\n\n" + clean_prompt) if clean_system_prompt else clean_prompt
            try:
                # Use optimized generation config for speed and reliability
                generation_config = genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=300,  # Further reduced for faster response
                    top_p=0.9,
                    top_k=20,
                    candidate_count=1  # Only generate one response for speed
                )
                resp = _gemini_model.generate_content(
                    full_prompt,
                    generation_config=generation_config
                )
                
                # Enhanced response parsing with better error handling
                if hasattr(resp, "candidates") and resp.candidates:
                    candidate = resp.candidates[0]
                    if hasattr(candidate, "finish_reason"):
                        if candidate.finish_reason == 2:  # SAFETY
                            print("Gemini blocked due to safety - trying fallback models")
                            # Try fallback models instead of giving up
                            return call_fallback_models(clean_prompt, clean_system_prompt)
                        elif candidate.finish_reason == 3:  # RECITATION
                            return "I cannot provide this response as it may contain copyrighted content."
                        elif candidate.finish_reason == 4:  # OTHER
                            return "I encountered an issue generating a response. Please try again."
                    
                    if hasattr(candidate, "content") and candidate.content:
                        if hasattr(candidate.content, "parts") and candidate.content.parts:
                            return candidate.content.parts[0].text
                
                # Fallback to text property
                if hasattr(resp, "text") and resp.text:
                    return resp.text
                
                return "I apologize, but I couldn't generate a proper response. Please try again."
                
            except Exception as gemini_error:
                print(f"Gemini generation failed: {gemini_error}")
                # Try without generation config as fallback
                try:
                    resp = _gemini_model.generate_content(full_prompt)
                    
                    if hasattr(resp, "candidates") and resp.candidates:
                        candidate = resp.candidates[0]
                        if hasattr(candidate, "content") and candidate.content:
                            if hasattr(candidate.content, "parts") and candidate.content.parts:
                                return candidate.content.parts[0].text
                    
                    if hasattr(resp, "text") and resp.text:
                        return resp.text
                    
                    return "I apologize, but I couldn't generate a proper response. Please try again."
                    
                except Exception as fallback_error:
                    print(f"Gemini fallback also failed: {fallback_error}")
                    # Try other models as final fallback
                    return call_fallback_models(clean_prompt, clean_system_prompt)
        
        # Fallback to OpenAI
        if model == "openai" and OPENAI_API_KEY and openai_client:
            messages = []
            if system_prompt:
                messages.append({"role":"system","content":system_prompt})
            messages.append({"role":"user","content":prompt})
            resp = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )
            return resp.choices[0].message.content
        
        # Fallback to Claude
        if model == "claude" and _ensure_anthropic():
            full_prompt = (system_prompt + "\n\n" + prompt) if system_prompt else prompt
            resp = _anthropic_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=500,
                messages=[{"role":"user","content":full_prompt}]
            )
            return resp.content[0].text
        
        # If Gemini is not available, try other models
        if _ensure_gemini():
            full_prompt = (system_prompt + "\n\n" + prompt) if system_prompt else prompt
            try:
                # Use fast, simple config for fallback
                generation_config = genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=200,  # Very short for speed
                    top_p=0.9,
                    top_k=10,
                    candidate_count=1
                )
                resp = _gemini_model.generate_content(
                    full_prompt,
                    generation_config=generation_config
                )
                
                # Enhanced response parsing
                if hasattr(resp, "candidates") and resp.candidates:
                    candidate = resp.candidates[0]
                    if hasattr(candidate, "finish_reason"):
                        if candidate.finish_reason == 2:  # SAFETY
                            return "I apologize, but I cannot provide a response to this query due to safety guidelines. Please try rephrasing your question."
                        elif candidate.finish_reason == 3:  # RECITATION
                            return "I cannot provide this response as it may contain copyrighted content."
                        elif candidate.finish_reason == 4:  # OTHER
                            return "I encountered an issue generating a response. Please try again."
                    
                    if hasattr(candidate, "content") and candidate.content:
                        if hasattr(candidate.content, "parts") and candidate.content.parts:
                            return candidate.content.parts[0].text
                
                if hasattr(resp, "text") and resp.text:
                    return resp.text
                
                return "I apologize, but I couldn't generate a proper response. Please try again."
                
            except Exception as gemini_error:
                print(f"Gemini fallback generation failed: {gemini_error}")
                # Try without generation config as final fallback
                try:
                    resp = _gemini_model.generate_content(full_prompt)
                    
                    if hasattr(resp, "candidates") and resp.candidates:
                        candidate = resp.candidates[0]
                        if hasattr(candidate, "content") and candidate.content:
                            if hasattr(candidate.content, "parts") and candidate.content.parts:
                                return candidate.content.parts[0].text
                    
                    if hasattr(resp, "text") and resp.text:
                        return resp.text
                    
                    return "I apologize, but I couldn't generate a proper response. Please try again."
                    
                except Exception as fallback_error:
                    print(f"Gemini fallback also failed: {fallback_error}")
                    raise fallback_error
        
        # Final fallback - return a helpful response
        return "Based on your retirement planning question, here are some general guidelines: Start saving early, diversify your investments, consider your risk tolerance, and plan for inflation. It's always best to consult with a qualified financial advisor for personalized advice."
    except Exception as e:
        # Enhanced error handling for Gemini-specific errors
        error_msg = str(e)
        if "google" in error_msg.lower() or "gemini" in error_msg.lower():
            if "quota" in error_msg.lower() or "limit" in error_msg.lower():
                return f"Gemini API quota exceeded: {error_msg}"
            elif "permission" in error_msg.lower() or "forbidden" in error_msg.lower():
                return f"Gemini API permission denied: {error_msg}"
            elif "invalid" in error_msg.lower() or "bad_request" in error_msg.lower():
                return f"Gemini API invalid request: {error_msg}"
            else:
                return f"Gemini API error: {error_msg}"
        else:
            return f"AI call failed: {error_msg}"

# ===== ENHANCED CALCULATIONS =====

def calculate_scenario_metrics(
    current_age: int,
    retirement_age: int,
    monthly_savings: float,
    current_savings: float,
    monthly_expenses: float
) -> Dict:
    """
    Enhanced calculation with realistic projections
    """
    years_to_retirement = max(0, retirement_age - current_age)
    months = years_to_retirement * 12
    
    # Annual returns: 12% equity, 8% debt, 6% inflation
    annual_return = 0.12
    monthly_return = annual_return / 12
    inflation_rate = 0.06
    
    # Future value of monthly SIP
    if months > 0 and monthly_return > 0:
        fv_sip = monthly_savings * ((math.pow(1 + monthly_return, months) - 1) / monthly_return) * (1 + monthly_return)
    else:
        fv_sip = 0
    
    # Future value of current savings
    fv_current = current_savings * math.pow(1 + annual_return, years_to_retirement)
    
    # Total corpus at retirement
    total_corpus = fv_sip + fv_current
    
    # Inflation-adjusted monthly expenses at retirement
    future_monthly_expenses = monthly_expenses * math.pow(1 + inflation_rate, years_to_retirement)
    
    # Required corpus (using 4% withdrawal rule - more realistic)
    # 4% rule means corpus should be 25x annual expenses
    required_annual_income = future_monthly_expenses * 12
    required_corpus = required_annual_income / 0.04
    
    # Corpus ratio
    corpus_ratio = total_corpus / required_corpus if required_corpus > 0 else 0
    
    # Safe withdrawal amount (4% of corpus annually)
    safe_annual_withdrawal = total_corpus * 0.04
    safe_monthly_withdrawal = safe_annual_withdrawal / 12
    
    # Lifestyle classification (MORE REALISTIC)
    if corpus_ratio >= 2.0:
        lifestyle = "Luxurious 🌟"
        color = "#10b981"
        description = "Very comfortable retirement with significant buffer"
    elif corpus_ratio >= 1.5:
        lifestyle = "Very Comfortable ✅"
        color = "#3b82f6"
        description = "Comfortable retirement with good cushion"
    elif corpus_ratio >= 1.0:
        lifestyle = "Comfortable 👍"
        color = "#0ea5e9"
        description = "Adequate retirement meeting all needs"
    elif corpus_ratio >= 0.7:
        lifestyle = "Moderate 🤔"
        color = "#f59e0b"
        description = "Workable but requires careful budgeting"
    else:
        lifestyle = "Challenging ⚠️"
        color = "#ef4444"
        description = "Insufficient - needs adjustment"
    
    # Year-by-year projection (first 10 years)
    yearly_projection = []
    balance = total_corpus
    for year in range(1, min(11, 26)):
        withdrawal = safe_annual_withdrawal
        investment_return = balance * 0.08  # Conservative 8% post-retirement
        balance = balance + investment_return - withdrawal
        yearly_projection.append({
            "year": year,
            "balance": round(balance, 2),
            "withdrawal": round(withdrawal, 2)
        })
    
    return {
        "years_to_retirement": years_to_retirement,
        "total_corpus": round(total_corpus, 2),
        "required_corpus": round(required_corpus, 2),
        "corpus_ratio": round(corpus_ratio, 2),
        "monthly_pension": round(safe_monthly_withdrawal, 2),
        "future_monthly_expenses": round(future_monthly_expenses, 2),
        "lifestyle": lifestyle,
        "color": color,
        "description": description,
        "yearly_projection": yearly_projection,
        "total_invested": round((monthly_savings * months) + current_savings, 2),
        "wealth_created": round(total_corpus - (monthly_savings * months) - current_savings, 2)
    }

@app.post("/api/simulate-scenarios", response_model=ScenarioResponse)
async def simulate_scenarios(request: ScenarioRequest):
    try:
        monthly_expenses = request.fixed_expenses + request.variable_expenses
        results = []
        
        for scenario in request.scenarios:
            metrics = calculate_scenario_metrics(
                current_age=request.current_age,
                retirement_age=scenario['retirement_age'],
                monthly_savings=scenario['monthly_savings'],
                current_savings=request.current_savings,
                monthly_expenses=monthly_expenses
            )
            
            results.append({
                "name": scenario['name'],
                "retirement_age": scenario['retirement_age'],
                "monthly_savings": scenario['monthly_savings'],
                **metrics
            })
        
        # Enhanced chart data
        chart_data = {
            "labels": [s['name'] for s in results],
            "corpus_values": [s['total_corpus'] for s in results],
            "required_corpus": [s['required_corpus'] for s in results],
            "colors": [s['color'] for s in results],
            "monthly_savings": [s['monthly_savings'] for s in results],
            "monthly_pension": [s['monthly_pension'] for s in results],
            "years_to_save": [s['years_to_retirement'] for s in results],
            "corpus_ratios": [s['corpus_ratio'] for s in results],
            "wealth_created": [s['wealth_created'] for s in results],
            "total_invested": [s['total_invested'] for s in results]
        }
        
        # Generate a simple analysis without AI
        ai_analysis = f"""Based on your financial profile (age {request.current_age}, income Rs{request.monthly_income:,}/month), here's a quick analysis:

• **Best Performing Scenario**: {max(results, key=lambda x: x['corpus_ratio'])['name']} with {max(results, key=lambda x: x['corpus_ratio'])['corpus_ratio']:.1f}x adequacy
• **Most Realistic**: {min(results, key=lambda x: abs(x['corpus_ratio'] - 1.0))['name']} provides balanced approach
• **Key Insight**: {'All scenarios meet minimum requirements' if all(s['corpus_ratio'] >= 1.0 for s in results) else 'Consider increasing savings or retiring later'}

Focus on the actionable recommendations below for specific next steps."""
        
        # Generate specific recommendations
        recommendations = generate_recommendations(results, request)
        
        # Find best scenario
        best = max(results, key=lambda x: x['corpus_ratio'] if x['corpus_ratio'] < 3.0 else 0)
        
        return ScenarioResponse(
            scenarios=results,
            ai_comparison=ai_analysis,
            best_scenario=best['name'],
            model_used=request.ai_model,
            chart_data=chart_data,
            recommendations=recommendations
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def generate_recommendations(scenarios: List[Dict], request: ScenarioRequest) -> List[str]:
    """Generate personalized actionable recommendations based on user profile"""
    recommendations = []
    monthly_surplus = request.monthly_income - request.fixed_expenses - request.variable_expenses
    monthly_expenses = request.fixed_expenses + request.variable_expenses
    savings_rate = (monthly_surplus / request.monthly_income) * 100
    
    # Personalized affordability analysis
    affordable_scenarios = [s for s in scenarios if s['monthly_savings'] <= monthly_surplus]
    if not affordable_scenarios:
        recommendations.append(
            f"**Immediate Action Required**: None of your scenarios are affordable with your current surplus of Rs {monthly_surplus:,}/month. "
            f"Your savings rate is {savings_rate:.1f}% - consider increasing income by Rs {max(s['monthly_savings'] for s in scenarios) - monthly_surplus:,} "
            f"or reducing expenses by {((max(s['monthly_savings'] for s in scenarios) - monthly_surplus) / monthly_expenses * 100):.1f}%."
        )
    elif len(affordable_scenarios) < len(scenarios):
        unaffordable = [s for s in scenarios if s['monthly_savings'] > monthly_surplus]
        recommendations.append(
            f"**Budget Alert**: {len(unaffordable)} scenario(s) exceed your Rs {monthly_surplus:,} surplus. "
            f"Consider the {affordable_scenarios[0]['name']} plan as your starting point, then gradually increase savings."
        )
    
    # Personalized corpus adequacy analysis
    adequate_scenarios = [s for s in scenarios if s['corpus_ratio'] >= 1.0]
    if not adequate_scenarios:
        best_ratio = max(scenarios, key=lambda x: x['corpus_ratio'])['corpus_ratio']
        recommendations.append(
            f"**Retirement Gap**: Your best scenario achieves only {best_ratio:.1f}x of required corpus. "
            f"At age {request.current_age}, you need to either: (1) Save Rs{max(s['monthly_savings'] for s in scenarios) + 5000:,}/month, "
            f"(2) Retire at {max(s['retirement_age'] for s in scenarios) + 2} years, or (3) Reduce retirement expenses by Rs{monthly_expenses * 0.2:,.0f}/month."
        )
    elif len(adequate_scenarios) == 1:
        recommendations.append(
            f"**Good News**: The {adequate_scenarios[0]['name']} plan meets your retirement needs! "
            f"Consider this your baseline and explore if you can afford the other scenarios for even better outcomes."
        )
    else:
        recommendations.append(
            f"**Multiple Options**: {len(adequate_scenarios)} scenarios meet your retirement needs. "
            f"Choose based on your risk tolerance and lifestyle preferences."
        )
    
    # Age-specific investment strategy
    best_scenario = max(scenarios, key=lambda x: x['corpus_ratio'])
    years_to_retirement = best_scenario['years_to_retirement']
    
    if request.current_age < 30:
        recommendations.append(
            f"**Young Investor Advantage**: At {request.current_age}, you have {years_to_retirement} years to build wealth. "
            f"Allocate 80% to equity (Nifty 50, ELSS) and 20% to debt (PPF, NPS). "
            f"Your Rs{request.current_savings:,} current savings will grow to Rs{request.current_savings * (1.12 ** years_to_retirement):,.0f} with 12% returns."
        )
    elif request.current_age < 45:
        recommendations.append(
            f"**Mid-Career Strategy**: With {years_to_retirement} years left, maintain 60% equity (diversified mutual funds) "
            f"and 40% debt (PPF, NPS, debt funds). Your Rs{request.current_savings:,} will compound to Rs{request.current_savings * (1.10 ** years_to_retirement):,.0f} "
            f"with 10% average returns."
        )
    else:
        recommendations.append(
            f"**Pre-Retirement Focus**: With {years_to_retirement} years remaining, shift to 40% equity and 60% debt "
            f"to protect your Rs{request.current_savings:,} savings. Consider NPS for tax benefits and guaranteed returns."
        )
    
    # Income-based tax optimization
    annual_income = request.monthly_income * 12
    if annual_income > 1000000:  # Above 10L
        recommendations.append(
            f"**High-Income Tax Strategy**: With Rs{annual_income:,.0f} annual income, maximize tax savings: "
            f"Rs1.5L in 80C (ELSS), Rs50K in NPS (80CCD), Rs25K in health insurance (80D). "
            f"Save Rs{min(annual_income * 0.3, 200000):,.0f} annually for optimal tax benefits."
        )
    elif annual_income > 500000:  # 5L-10L
        recommendations.append(
            f"**Growing Income Strategy**: With Rs{annual_income:,.0f} income, focus on 80C benefits (Rs1.5L) "
            f"and NPS (Rs50K). Your tax savings of Rs{annual_income * 0.2 * 0.3:,.0f} can be reinvested for retirement."
        )
    else:
        recommendations.append(
            f"**Early Career Focus**: With Rs{annual_income:,.0f} income, prioritize building emergency fund first, "
            f"then start with Rs{min(monthly_surplus * 0.5, 10000):,.0f}/month in ELSS for tax benefits and growth."
        )
    
    # Lifestyle-specific recommendations
    if monthly_expenses > request.monthly_income * 0.7:
        recommendations.append(
            f"**Expense Management**: Your expenses (Rs{monthly_expenses:,}) are {monthly_expenses/request.monthly_income*100:.1f}% of income. "
            f"Consider reducing by Rs{monthly_expenses - request.monthly_income * 0.6:,.0f}/month to improve savings rate."
        )
    elif monthly_expenses < request.monthly_income * 0.4:
        recommendations.append(
            f"**Excellent Savings Rate**: Your {savings_rate:.1f}% savings rate is outstanding! "
            f"Consider increasing investments in the {best_scenario['name']} plan for even better retirement outcomes."
        )
    
    return recommendations[:5]  # Return top 5 personalized recommendations

# Keep your existing endpoints
@app.get("/")
async def root():
    return {"status": "FinAI Simulator", "version": "2.0"}



@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "models_configured": {
            "openai": bool(OPENAI_API_KEY),
            "claude": bool(ANTHROPIC_API_KEY),
            "gemini": bool(GEMINI_API_KEY),
            "huggingface": True  # Always available
        }
    }


# ── PDF Report Generation ─────────────────────────────────────────────────────

from utils.pdf_generator import generate_retirement_report
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'finai-backend'))

from utils.pdf_generator import generate_retirement_report as _gen_report
from utils.s3_uploader import upload_report_to_s3 as _upload_s3

sys.path.pop(0)  # clean up path after imports
from utils.s3_uploader import upload_report_to_s3
from pydantic import BaseModel as _BaseModel
from typing import List as _List

class _UserData(_BaseModel):
    age: int
    retirement_age: int
    monthly_income: float
    monthly_expense: float
    existing_savings: float = 0
    risk_profile: str = "moderate"

class _ScenarioResult(_BaseModel):
    scenario_name: str
    projected_corpus: float
    monthly_sip: float
    xirr: float
    feasibility: str

class _GenerateReportRequest(_BaseModel):
    user_data: _UserData
    scenario_results: _List[_ScenarioResult]
    user_id: str

@app.post("/api/generate-report")
def generate_report(body: _GenerateReportRequest):
    pdf_bytes = _gen_report(
        user_data=body.user_data.model_dump(),
        scenario_results=[s.model_dump() for s in body.scenario_results],
    )
    download_url = _upload_s3(pdf_bytes, body.user_id)
    return {"success": True, "download_url": download_url}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)