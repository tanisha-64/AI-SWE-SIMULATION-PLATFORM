# CodeMentor AI — Backend API Engine

This is the production-ready asynchronous backend for **CodeMentor AI** — an AI-powered software engineering simulation platform. Built with FastAPI, PostgreSQL, and advanced LLM agent architectures, this engine orchestrates dynamic problem generation, sandboxed execution, and AI-driven performance tutoring.

## 🛠️ Tech Stack & Key Integrations
* **Framework:** FastAPI (Python 3.11+) with Async ASGI standard
* **Database & ORM:** PostgreSQL (Neon Serverless) + SQLAlchemy ORM
* **Migrations:** Alembic
* **Task Queue & Caching:** Celery + Redis (Upstash)
* **AI Ecosystem:** Groq (LLaMA-3), Cohere Embeddings, & ChromaDB (Vector Isolation)
* **Email Layer:** Resend API (JWT-powered security tokens)

---

## 📂 Backend Architecture & Directory Layout

backend/
├── alembic/                  # Database migration tracks
│   ├── versions/             # Incremental migration script files
│   ├── env.py                # Alembic connection configurations
│   ├── README                # Internal migration manual
│   └── script.py.mako        # Migration template generator
├── app/                      # Application core package
│   ├── api/                  # API routers, endpoints, and versioning layers
│   ├── core/                 # Configs, security guards, JWT validations
│   ├── db/                   # Base session declarations & connection initializers
│   ├── ml_models/            # Local model configurations or fine-tuning maps
│   ├── models/               # Declarative SQLAlchemy schema definitions
│   ├── rag_data/             # Local source knowledge files for ChromaDB parsing
│   ├── schemas/              # Strongly-typed Pydantic validation schemas
│   ├── services/             # Core business handlers (AI, execution trace, agents)
│   └── tests/                # Automated endpoint validation & PyTest configuration
├── .env                      # Local secret management infrastructure
├── .env.example              # Blind template file for public replication
├── alembic.ini               # Runtime config mapping database URLs
├── docker-compose.yml        # Multi-container orchestration (Redis/Postgres context)
├── Dockerfile                # Deployment image manifest
├── pytest.ini                # Test behavior control directives
└── requirements.txt          # Python dependency pin board


---

## 🚀 Local Implementation Guide

### 1. Environment Setup
Create a `.env` file inside the `backend/` directory filling matching keys:
```env
DATABASE_URL=postgresql://user:pass@neon-host/dbname?sslmode=require
REDIS_URL=rediss://default:your-token@upstash-host:port
GROQ_API_KEY=gsk_your_secret_key
COHERE_API_KEY=your_cohere_key
RESEND_API_KEY=re_your_resend_key
SECRET_KEY=your_jwt_signing_key_here
FRONTEND_URL=http://localhost:5173


### 2. Dependency Management & Database Sync 

# Initialize and step into virtual environment
python -m venv venv
source venv/Scripts/activate  # On Windows use: venv\Scripts\activate

# Install locked dependencies
pip install -r requirements.txt

# Execute modern structural migration updates to Neon DB
alembic upgrade head


### 3. Ignition Commands

# Run the local development proxy server
uvicorn app.main:app --reload --port 8000

# Fire up worker processes for async execution/AI generations (Separate terminal)
celery -A app.core.celery_worker worker --loglevel=info

Your OpenAPI Documentation route becomes active at:
 http://127.0.0.1:8000/docs