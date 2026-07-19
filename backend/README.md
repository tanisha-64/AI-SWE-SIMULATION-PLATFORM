# CodeMentor AI — Backend API Engine

This is the production-ready asynchronous backend for **CodeMentor AI** — an AI-powered software engineering simulation platform. Built with FastAPI, PostgreSQL, and advanced LLM agent architectures, this engine orchestrates dynamic problem generation, sandboxed execution, and AI-driven performance tutoring.

## 🛠️ Tech Stack & Key Integrations
* **Framework:** FastAPI (Python 3.11+) with Async ASGI standard
* **Database & ORM:** PostgreSQL (Neon Serverless) + SQLAlchemy ORM
* **Migrations:** Alembic
* **Caching & Rate Limiting:** Redis (Upstash)
* **Async AI Processing:** FastAPI BackgroundTasks (production) / Celery + Redis (available for local/distributed use)
* **AI Ecosystem:** Groq (LLaMA-3), Cohere Embeddings, & ChromaDB (Vector Isolation)
* **Email Layer:** Resend API + JWT (access + refresh token security)

---

## 📂 Backend Architecture & Directory Layout

backend/
├── alembic/                  # Database migration tracks
│   ├── versions/              # Incremental migration script files
│   ├── env.py                 # Alembic connection configurations
│   ├── README                 # Internal migration manual
│   └── script.py.mako         # Migration template generator
├── app/                       # Application core package
│   ├── api/v1/endpoints/       # auth, users, problems, execution, submissions,
│   │                           # debugging, analytics, admin, rag_chat, agents,
│   │                           # career_tracks, contact
│   ├── core/                  # config, security, database, redis_client, middleware
│   ├── db/                    # session, init_db
│   ├── ml_models/             # Saved model artifacts (readiness/placement scoring)
│   ├── models/                # Declarative SQLAlchemy schema definitions
│   ├── rag_data/               # ChromaDB vector index + source knowledge storage
│   ├── schemas/                # Strongly-typed Pydantic validation schemas
│   ├── services/
│   │   ├── ai/                 # code_review, problem_generator, debugging_hint
│   │   ├── rag/                 # embedding, vector_store, retrieval, rag_chain
│   │   ├── agents/              # career_advisor_agent (multi-step reasoning)
│   │   └── ml/                  # recommendation_engine
│   ├── tests/                  # Automated endpoint validation & PyTest configuration
│   ├── utils/                  # jwt_handler, rate_limiter, validators
│   ├── worker/                 # celery_app.py, tasks/ (available for distributed async)
│   └── main.py                 # FastAPI app entrypoint
├── venv/
├── .env                        # Local secret management (gitignored)├── .gitignore
├── alembic.ini                 # Runtime config mapping database URLs
├── pytest.ini                   # Test behavior control directives
├── README.md
├── requirements.txt              # Python dependency pin board
└── runtime.txt                   # Python version pin for Render deployment

---

## 🚀 Local Implementation Guide

### 1. Environment Setup
Create a `.env` file inside the `backend/` directory with the following keys:

```env
DATABASE_URL=postgresql://user:pass@neon-host/dbname?sslmode=require
SECRET_KEY=your_jwt_signing_key_here
JWT_ALGORITHM=*****
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30
GROQ_API_KEY=gsk_your_secret_key
REDIS_URL=rediss://default:your-token@upstash-host:port
COHERE_API_KEY=your_cohere_key
RESEND_API_KEY=re_your_resend_key
FRONTEND_URL=http://localhost:5173
```

### 2. Dependency Management & Database Sync

```bash
# Initialize and step into virtual environment
python -m venv venv
source venv/Scripts/activate  # On Windows use: venv\Scripts\activate

# Install locked dependencies
pip install -r requirements.txt

# Execute structural migration updates to the Neon database
alembic upgrade head
```

### 3. Ignition Commands

```bash
# Run the local development server
uvicorn app.main:app --reload --port 8000
```

Your OpenAPI Documentation route becomes active at:
**http://127.0.0.1:8000/docs**

> ℹ️ In production, AI code reviews and background jobs run via FastAPI's built-in `BackgroundTasks` (no separate worker process needed). A Celery + Redis worker setup is also available in `app/worker/` for local development or distributed deployments — run it with `celery -A app.worker.celery_app worker --loglevel=info` in a separate terminal if needed.

---

## 🔑 Core Modules

| Module | Responsibility |
|---|---|
| `services/ai/` | AI code review, on-demand problem generation, debugging hints |
| `services/rag/` | Self-expanding RAG knowledge base (ChromaDB + Cohere) |
| `services/agents/` | Autonomous Career Advisor agent (multi-step reasoning) |
| `services/code_execution_service.py` | Sandboxed, timeout-protected code execution |
| `services/trace_service.py` | Line-by-line execution trace visualizer |
| `services/career_track_curator_service.py` | Self-curating salary-tier career roadmaps |
| `utils/jwt_handler.py` | JWT auth guards (user / admin / premium) |
| `utils/rate_limiter.py` | Redis-backed rate limiting (per-user and per-IP) |