# CodeMentor AI — Frontend

The React + TypeScript client for **CodeMentor AI**, an AI-powered software engineering simulation platform. Built with Vite for fast dev iteration, Tailwind for styling, and Framer Motion + GSAP for a premium, animated interface.

## 🌐 Live Demo
https://ai-swe-simulation-platform-two.vercel.app

## 🛠️ Tech Stack
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS (custom dark/light theme via CSS variables)
- **Animation:** Framer Motion (component transitions, gestures) + GSAP (landing page timeline)
- **Code Editor:** Monaco Editor
- **Charts:** Recharts (pie, radar, animated readiness gauge)
- **Routing:** React Router v6
- **HTTP Client:** Axios (with auth interceptors + auto token refresh)
- **Notifications:** react-hot-toast
- **Effects:** canvas-confetti (celebrations), browser Speech Synthesis API (voice-guided onboarding)

## 📂 Directory Structure

frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── client.ts              # Axios instance, JWT interceptors, auto-refresh
│   │   └── services.ts            # All backend endpoint calls, grouped by domain
│   ├── assets/
│   ├── components/
│   │   ├── layout/                 # Navbar, UserMenu, AppLayout, ProtectedRoute
│   │   ├── ui/                     # JellyBlobs, AnimatedCounter, TopProgressBar
│   │   ├── dashboard/               # StatCard, ReadinessGauge, StreakCalendar
│   │   ├── workspace/               # TraceVisualizer, ResultsPanel, ResizableSplit
│   │   ├── assistant/               # AvatarFace, FloatingAssistant (RAG chat widget)
│   │   └── onboarding/              # JarvisOrb (voice-guided welcome tour)
│   ├── context/                     # AuthContext, ThemeContext
│   ├── hooks/                       # useSpeech (text-to-speech wrapper)
│   ├── pages/                       # Landing, Login, Register, VerifyEmail, Welcome,
│   │                                 # Dashboard, Problems, ProblemWorkspace, McqWorkspace,
│   │                                 # DebugArena, DebugChallenge, Analytics, Mentor,
│   │                                 # Profile, CareerTracks, CareerTrackDetail,
│   │                                 # DailyChallenge, Contact, NotFound
│   ├── utils/                       # celebrate.ts (confetti trigger)
│   ├── App.tsx                      # Route definitions
│   ├── main.tsx                     # App entrypoint (providers, toaster, progress bar)
│   └── index.css                    # Tailwind base + theme variables + custom animations
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json                       # SPA rewrite rules for client-side routing

## 🚀 Local Setup

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173**

The backend API URL is configured in `src/api/client.ts`:
```ts
const BASE_URL = 'https://ai-swe-simulation-platform.onrender.com/api/v1';
```
Change this to `http://localhost:8000/api/v1` if running the backend locally.

## 🏗️ Build for Production

```bash
npm run build
```
Output goes to `dist/`. Deployed on Vercel with `frontend` as the project root directory.

## 🔑 Key Frontend Features
- **Dark/Light theme system** via CSS custom properties, persisted in `localStorage`
- **Auto token refresh** — expired access tokens are silently refreshed using the stored refresh token before retrying the original request
- **Execution Trace Visualizer** — animated, scrubbable timeline of variable states during code execution
- **Resizable split-pane workspace** — draggable divider + focus-mode toggle between problem description and editor
- **Voice-guided onboarding** — animated robotic orb that narrates a platform tour using the browser's native Speech Synthesis API
- **Floating AI mentor widget** — persistent RAG-powered chat assistant available on every page except the dedicated Mentor page