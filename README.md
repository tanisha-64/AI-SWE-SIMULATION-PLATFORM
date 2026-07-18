# CodeMentor AI — AI-Powered Software Engineering Simulation Platform

An AI-native platform that simulates a real software engineering environment — helping students bridge the gap between theoretical CS knowledge and practical, interview-ready skills.


## 🚀 Live Demo
- **Frontend:** https://ai-swe-simulation-platform-two.vercel.app
- **Backend API Docs:** https://ai-swe-simulation-platform.onrender.com/docs

⚠️ Backend is hosted on Render's free tier — the first request may take 30-50 seconds to wake up.


## ✨ Key Features
- **AI-Generated Problems** — Coding, MCQ, and project-type challenges generated on-demand, never runs out of content
- **Execution Trace Visualizer** — Step-by-step animated variable state tracking (built from scratch using Python's `sys.settrace`)
- **AI Code Review** — Async, senior-engineer-style reviews (complexity, bugs, optimization) via Celery/BackgroundTasks
- **RAG Mentor Chatbot** — Self-expanding knowledge base with source citations, powered by ChromaDB + Cohere embeddings
- **Socratic AI Tutor** — Multi-turn guided learning mode that teaches through questions, not direct answers
- **Autonomous Career Advisor Agent** — Multi-step reasoning agent that analyzes performance, fetches recommendations, and builds a personalized action plan
- **Self-Curating Career Tracks** — Salary-tier-based prep roadmaps that auto-refresh via AI, linked to real problems in the database
- **Daily Challenges** — Auto-rotating MCQs and debugging challenges, refreshed daily
- **Industry Readiness Score** — Composite ML-style scoring based on accuracy, consistency, code quality, and debugging skill
- **Real Email Verification** — JWT auth with access/refresh tokens, rate limiting, and Resend-powered verification


## 🛠️ Tech Stack

**Backend:** FastAPI, PostgreSQL (Neon), SQLAlchemy, Alembic, Redis (Upstash), Groq (LLaMA), Cohere, ChromaDB, Resend

**Frontend:** React, TypeScript, Vite, Tailwind CSS, Framer Motion, GSAP, Monaco Editor, Recharts

**Infrastructure:** Render (backend), Vercel (frontend), GitHub Actions-ready monorepo structure

## 📂 Project Structure



## 👤 Author
Built by **Tanisha** — B.Tech CSE (AI/ML), Ashoka Institute of Technology and Management, Varanasi