# Incuverse 🚀

## 📌 Project Overview

Incuverse is an **AI-driven financial planning platform** focused on retirement readiness analysis. It combines a FastAPI-powered backend with a modern frontend to deliver intelligent, personalized financial insights.

At its core, the system uses **financial modeling + AI (LangChain + OpenAI)** to:

* Analyze user financial data
* Project retirement outcomes using compound growth models
* Generate actionable strategies to improve financial health
* Simulate “what-if” scenarios for better decision-making

This project reflects real-world system design with a clear separation between backend intelligence and frontend experience.

---

## 🧠 Key Capabilities

* 📊 **Retirement Projections**
  Calculates long-term retirement corpus using financial formulas and assumptions like inflation and returns.

* 🤖 **AI-Powered Insights**
  Uses LangChain to generate human-like financial analysis and recommendations.

* 📈 **Strategy Recommendations**
  Provides actionable steps to improve retirement readiness.

* 🔁 **Simulation Engine**
  Allows users to test different financial scenarios (e.g., increasing savings, delaying retirement).

* ⚠️ **Risk Assessment**
  Evaluates financial risks and provides mitigation suggestions.

---

## 📁 Project Structure

```bash
incuverse/
│
├── finai-backend/        # FastAPI + LangChain backend (core intelligence)
│
├── new-frontend/         # Frontend UI (React/Vite)
│   ├── public/
│   ├── src/
│
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/incuverse.git
cd incuverse
```

---

### 2. Backend Setup (FastAPI + AI Engine)

```bash
cd finai-backend
python -m venv venv

# Activate environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create `.env`:

```env
OPENAI_API_KEY=your_openai_api_key
```

Run backend:

```bash
uvicorn main:app --reload
```

---

### 3. Frontend Setup

```bash
cd ../new-frontend
npm install
npm run dev
```

---

## 🔗 API Access

Once running:

* API → http://localhost:8000
* Docs → http://localhost:8000/docs

---

## 🔒 Environment Variables

* `.env` files are **NOT pushed to GitHub**
* Use `.env.example` for safe sharing

---

## 📦 Tech Stack

**Backend**

* FastAPI
* LangChain
* OpenAI API
* Pydantic

**Frontend**

* React / Vite

---

## 🚫 Ignored Files

* `.env`
* `node_modules/`
* `dist/`, `build/`
* logs and temp files

---

## 🧠 Why This Project Matters

Most financial tools are static calculators.
Incuverse goes further by combining **AI reasoning with financial modeling**, making outputs:

* Context-aware
* Personalized
* Actionable

This is closer to how real fintech products operate.

---

## 📌 Future Improvements

* User authentication system
* Database integration (user history tracking)
* Deployment (Docker + cloud)
* Advanced portfolio optimization

