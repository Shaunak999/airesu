# AI Resume Analyzer — 3-Day MVP

Upload a resume (PDF) → extract text → detect skills → compare with a job description → get **match score**, **skills found**, and **missing skills**.

## Tech Stack

- **Frontend:** React, Tailwind CSS, Axios, React Router, Vite
- **Backend:** Django, Django REST Framework, JWT (Simple JWT)
- **Resume parsing:** pdfplumber
- **Database:** SQLite (default)

## Quick Start

### 1. Backend (Django)

```bash
cd resume_ai
# Use your venv: e.g. ..\\.venv\\Scripts\\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

API runs at **http://127.0.0.1:8000**.  
Endpoints:

- `POST /api/auth/register/` — signup  
- `POST /api/auth/token/` — login (returns access + refresh)  
- `GET /api/dashboard/` — dashboard (auth required)  
- `POST /api/resumes/upload/` — upload PDF (auth required)  
- `GET /api/resumes/` — list resumes (auth required)  
- `POST /api/match/` — body: `{ "job_description": "..." }` (auth required)

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173**.  
Vite proxies `/api` to the Django backend, so use the same origin in the browser.

### 3. Use the app

1. **Register** → **Login**
2. **Upload Resume** — upload a PDF; skills are extracted automatically
3. **Dashboard** — see latest resume and detected skills
4. **Job Match** — paste a job description, get match %, skills found, missing skills, and suggestions

## Project structure

```
airesu/
├── resume_ai/                 # Django backend
│   ├── resume_ai/             # project settings & urls
│   ├── analyzer/              # app: auth, resumes, match, dashboard
│   │   ├── models.py          # Resume model
│   │   ├── views.py           # API views
│   │   ├── serializers.py
│   │   ├── services.py        # PDF extract, skill extract, match score
│   │   ├── skills_list.py     # curated skills list
│   │   └── urls.py
│   └── requirements.txt
├── frontend/                  # React + Vite + Tailwind
│   ├── src/
│   │   ├── api.js             # Axios + JWT interceptors
│   │   ├── App.jsx
│   │   ├── components/
│   │   └── pages/             # Login, Register, Dashboard, Upload, Match
│   └── package.json
└── README.md
```

## Optional: Add more skills

Edit `resume_ai/analyzer/skills_list.py` and add entries to `SKILLS_LIST` to improve skill detection for resumes and job descriptions.

## Optional: Deploy

- **Backend:** e.g. Render, Railway (set `ALLOWED_HOSTS`, `SECRET_KEY`, DB)
- **Frontend:** e.g. Vercel (set API base URL to your backend)
