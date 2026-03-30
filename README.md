# Incuverse 🚀

A full-stack application consisting of a backend service and a frontend client.

---

## 📁 Project Structure

```
incuverse/
│
├── finai-backend/        # Backend service (API, database handling)
│   ├── .env              # Environment variables (NOT pushed to GitHub)
│   └── ...
│
├── new-frontend/         # Frontend application (UI)
│   ├── .env              # Environment variables (NOT pushed to GitHub)
│   ├── public/
│   ├── src/
│   └── ...
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

### 2. Backend Setup

```bash
cd finai-backend
npm install
```

Create a `.env` file:

```env
PORT=5000
DB_URL=your_database_url
API_KEY=your_api_key
```

Run backend:

```bash
npm start
```

---

### 3. Frontend Setup

```bash
cd ../new-frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Run frontend:

```bash
npm run dev
```

---

## 🔒 Environment Variables

* `.env` files are **ignored** using `.gitignore`
* Use `.env.example` to share structure without exposing secrets

---

## 📦 Tech Stack

* Frontend: React / Vite
* Backend: Node.js / Express
* Package Manager: npm

---

## 🚫 Files Ignored

* `node_modules/`
* `.env`
* `dist/`, `build/`
* logs and temporary files

---

## 🧠 Notes

* Make sure backend runs before frontend
* Update API URLs if deploying
* Never commit `.env` files

---

## 📌 Future Improvements

* Add authentication
* Improve error handling
* Deploy backend & frontend

