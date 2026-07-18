# 🚀 CodeMentor AI — AI-Powered Software Engineering Simulation Platform

An AI-native platform that simulates a real software engineering environment — helping students bridge the gap between theoretical CS knowledge and practical, interview-ready skills. Built end-to-end with a self-populating AI content pipeline, RAG-powered mentoring, and an autonomous career advisor agent.

---

## 🌐 Live Demo

| | Link |
|---|---|
| **Frontend (Vercel)** | https://ai-swe-simulation-platform-two.vercel.app |
| **Backend API Docs (Render)** | https://ai-swe-simulation-platform.onrender.com/docs |

> ⚠️ Backend runs on Render's free tier — the first request after inactivity may take 30–50 seconds to wake up.

---

## ✨ Key Features

- **AI-Generated Problems** — Coding, MCQ, and project-type challenges generated on demand across any topic; content bank never runs dry
- **Execution Trace Visualizer** — Step-by-step animated variable-state timeline, built from scratch using Python's `sys.settrace` (no external debugger library)
- **Async AI Code Review** — Senior-engineer-style reviews (complexity analysis, bug detection, optimization tips) processed in the background so submissions stay fast
- **RAG Mentor Chatbot** — Self-expanding knowledge base (ChromaDB + Cohere embeddings) that auto-generates and stores new topic explanations the first time they're asked, with source citations
- **Socratic AI Tutor** — Multi-turn guided-learning mode that nudges with questions before revealing answers
- **Autonomous Career Advisor Agent** — Multi-step reasoning agent: pulls analytics → finds weak areas → fetches recommendations → retrieves RAG context → synthesizes a personalized plan
- **Self-Curating Career Tracks** — Salary-band prep roadmaps (4–8 / 8–15 / 15–30 / 30+ LPA) that regenerate via AI every 30 days and link to real problems already in the database
- **Daily Challenges** — Auto-rotating Daily MCQ Quiz and Daily Debugging Arena, regenerated every day, never repeats solved items
- **Industry Readiness Score** — Composite weighted score from accuracy, consistency, volume, code quality, and debugging skill
- **Streaks, Badges & Calendar Heatmap** — GitHub-style contribution tracking with milestone-based rewards
- **Real Email Verification** — JWT auth with short-lived access + long-lived refresh tokens, IP-based rate limiting on login, and Resend-powered verification emails
- **Contact & Help Center** — Categorized support form with automated confirmation emails and an admin triage view
- **Voice-Guided Onboarding** — A robotic "Jarvis"-style animated assistant that welcomes new users using the browser's native speech synthesis

---

## 🛠️ Tech Stack

**Backend:** FastAPI · PostgreSQL (Neon) · SQLAlchemy · Alembic · Redis (Upstash) · Groq (LLaMA 3.1) · Cohere Embeddings · ChromaDB · Resend · JWT (access + refresh) · BackgroundTasks

**Frontend:** React · TypeScript · Vite · Tailwind CSS · Framer Motion · GSAP · Monaco Editor · Recharts · React Router · Axios

**Infrastructure:** Render (backend) · Vercel (frontend) · GitHub monorepo · Neon (serverless Postgres) · Upstash (serverless Redis)

---

## 📂 Project Structure

```
AI company/
│
├── backend/
│   ├── alembic/                      # Database migration scripts
│   ├── app/
│   │   ├── __pycache__/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/        # auth, users, problems, execution, submissions,
│   │   │       │                     # debugging, analytics, admin, rag_chat, agents,
│   │   │       │                     # career_tracks, contact
│   │   │       └── router.py         # Combines all endpoint routers
│   │   ├── core/                     # config, security, database, redis_client,
│   │   │                             # middleware, exceptions, logging_config
│   │   ├── db/                       # session, init_db
│   │   ├── ml_models/                # Saved model artifacts (readiness/placement)
│   │   ├── models/                   # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── problem.py
│   │   │   ├── submission.py
│   │   │   ├── debugging_challenge.py
│   │   │   ├── analytics.py
│   │   │   ├── chat_session.py
│   │   │   ├── agent_task.py
│   │   │   ├── career_track.py
│   │   │   └── contact.py
│   │   ├── rag_data/                 # ChromaDB vector index storage
│   │   ├── schemas/                  # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── ai/                   # code_review, problem_generator,
│   │   │   │                         # debugging_hint, prompt_templates
│   │   │   ├── rag/                  # embedding, vector_store, retrieval,
│   │   │   │                         # rag_chain, ingestion
│   │   │   ├── agents/               # career_advisor_agent, base_agent
│   │   │   ├── ml/                   # recommendation_engine
│   │   │   ├── auth_service.py
│   │   │   ├── email_service.py
│   │   │   ├── analytics_service.py
│   │   │   ├── streak_service.py
│   │   │   ├── badge_service.py
│   │   │   ├── code_execution_service.py
│   │   │   ├── trace_service.py
│   │   │   ├── debugging_service.py
│   │   │   ├── problem_service.py
│   │   │   ├── submission_service.py
│   │   │   ├── career_track_service.py
│   │   │   ├── career_track_curator_service.py
│   │   │   └── contact_service.py
│   │   ├── tests/
│   │   ├── utils/                    # jwt_handler, rate_limiter, validators
│   │   ├── worker/                   # celery_app, tasks (legacy async path)
│   │   ├── __init__.py
│   │   └── main.py                   # FastAPI app entrypoint
│   ├── venv/
│   ├── .env
│   ├── .gitignore
│   ├── alembic.ini
│   ├── pytest.ini
│   ├── README.md
│   ├── requirements.txt
│   └── runtime.txt
│
├── frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── api/                      # client.ts, services.ts
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── layout/                # Navbar, UserMenu, AppLayout, ProtectedRoute
│   │   │   ├── ui/                    # JellyBlobs, AnimatedCounter, Skeleton
│   │   │   ├── dashboard/             # StatCard, ReadinessGauge, StreakCalendar, PremiumCard
│   │   │   ├── workspace/             # TraceVisualizer, ResultsPanel, ResizableSplit
│   │   │   ├── assistant/             # AvatarFace, FloatingAssistant
│   │   │   └── onboarding/            # JarvisOrb
│   │   ├── context/                   # AuthContext, ThemeContext
│   │   ├── hooks/                     # useSpeech
│   │   ├── pages/                     # Landing, Login, Register, VerifyEmail, Welcome,
│   │   │                              # Dashboard, Problems, ProblemWorkspace, McqWorkspace,
│   │   │                              # DebugArena, DebugChallenge, Analytics, Mentor,
│   │   │                              # Profile, CareerTracks, CareerTrackDetail,
│   │   │                              # DailyChallenge, Contact, NotFound
│   │   ├── utils/                     # celebrate.ts (confetti)
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── README.md
│
└── README.md                          # (this file)
```

---

## 🧠 Architecture Highlights

**Self-populating content, not hand-curated.** Problems, MCQs, debugging challenges, career-track curricula, and RAG knowledge base entries are all generated by AI on first request and cached in Postgres/ChromaDB — the platform grows itself instead of relying on manually written question banks.

**Async by design.** AI code reviews run via FastAPI `BackgroundTasks` so submission responses return immediately (test results + trace) while the review streams in a few seconds later — matching how production systems decouple slow AI calls from user-facing latency.

**Agentic reasoning, not a single prompt.** The Career Advisor Agent chains four distinct steps (observe analytics → fetch recommendations → retrieve RAG context → synthesize plan) and returns its full reasoning trail, not just a final answer.

**Grounded RAG.** The mentor chatbot never answers from a single opaque prompt — it retrieves from a vector store first and cites the specific knowledge-base entries used, auto-expanding the knowledge base for topics it doesn't yet have.

---

## 👤 Author

Built by **Tanisha** — B.Tech CSE (AI/ML), Ashoka Institute of Technology and Management, Varanasi.