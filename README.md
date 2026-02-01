# Autonomous Study Planner

AI-powered study planning application that generates personalized learning roadmaps using CrewAI agents.

## Overview

The Autonomous Study Planner helps users create structured study plans for any academic goal. By leveraging a multi-agent AI system, it decomposes learning objectives, researches relevant resources, and creates detailed weekly schedules.

### Key Features

- **Email/Password Authentication** - Secure sign-in via Better Auth
- **AI-Powered Planning** - CrewAI agents collaborate to create study plans
- **Study Plan Management** - Generate, save, view, and delete study plans
- **Progress Tracking** - Track task completion with visual progress indicators
- **Study Plan Library** - Browse all saved plans with quick access
- **Detailed Plan View** - Week-by-week breakdown with tasks and resources
- **Duplicate Detection** - Prevents saving duplicate plans with conflict resolution
- **Structured Output** - JSON-based plans with weekly milestones, objectives, and resources
- **Anti-Slop UI** - Clean, minimalist interface with monospace accents

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│    User     │────▶│  Next.js Frontend │────▶│  Better Auth    │
└─────────────┘     └──────────────────┘     └────────┬────────┘
                              │                       │
                              │                       ▼
                              │              ┌─────────────────┐
                              │              │   PostgreSQL    │
                              │              │  [session table]│
                              │              └────────┬────────┘
                              │                       │
                              ▼                       │
                       ┌──────────────────┐         │
                       │  FastAPI Backend │◀────────┘
                       └────────┬─────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   CrewAI Agents  │
                       │  ┌────────────┐  │
                       │  │ Strategist │  │
                       │  └─────┬──────┘  │
                       │        ▼         │
                       │  ┌────────────┐  │
                       │  │   Scout    │  │
                       │  └─────┬──────┘  │
                       │        ▼         │
                       │  ┌────────────┐  │
                       │  │  Architect │  │
                       │  └────────────┘  │
                       └──────────────────┘
```

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **Better Auth** - Authentication with PostgreSQL session store
- **TailwindCSS** - Utility-first styling
- **Lucide React** - Icon library

### Backend
- **FastAPI** - Python web framework
- **CrewAI** - Multi-agent AI orchestration
- **Google Gemini 3.0 Flash** - LLM for agent reasoning
- **Tavily Search** - Optional web search for resource discovery
- **psycopg2** - PostgreSQL driver

### Database
- **PostgreSQL** - Session storage and user data

### Authentication
- **Better Auth** - Shared auth between frontend and backend
- **Email/Password** - Credential-based authentication

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 14+

> **Note:** Authentication is email/password only. No OAuth setup required.

### 1. Clone Repository

```bash
git clone <repository-url>
cd autonomous-study-planner
```

### 2. Set Up PostgreSQL

```bash
# Create database
createdb studyplanner

# Or using psql
psql -U postgres -c "CREATE DATABASE studyplanner;"
```

#### Manual Table Creation (Optional)

> **Note:** Better Auth normally auto-creates the required tables on first run. Only follow this step if you encounter issues with table creation or prefer to set up the database schema manually.

If Better Auth doesn't auto-create the tables, you can create them manually:

```bash
# Run the schema file using psql
psql -U postgres -d studyplanner -f frontend/better-auth-schema.sql
```

Or manually execute the SQL commands:

```sql
-- User table
CREATE TABLE IF NOT EXISTS "user" (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    "emailVerified" BOOLEAN DEFAULT FALSE,
    name TEXT,
    image TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session table
CREATE TABLE IF NOT EXISTS "session" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Account table (for OAuth providers)
CREATE TABLE IF NOT EXISTS "account" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP,
    "refreshTokenExpiresAt" TIMESTAMP,
    scope TEXT,
    "idToken" TEXT,
    password TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("providerId", "accountId")
);

-- Verification table (for email verification, password reset, etc.)
CREATE TABLE IF NOT EXISTS "verification" (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_session_userId" ON "session"("userId");
CREATE INDEX IF NOT EXISTS idx_session_token ON "session"(token);
CREATE INDEX IF NOT EXISTS "idx_account_userId" ON "account"("userId");
CREATE INDEX IF NOT EXISTS "idx_verification_identifier" ON "verification"(identifier);

-- Study Plans table for saving user study plans
CREATE TABLE IF NOT EXISTS study_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    goal TEXT NOT NULL,
    weeks INTEGER NOT NULL,
    plan_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for duplicate detection queries (case-insensitive goal matching)
CREATE INDEX IF NOT EXISTS idx_study_plans_user_goal ON study_plans(user_id, LOWER(goal));
CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON study_plans(user_id);

-- Study Plan Tasks table for tracking task completion
CREATE TABLE IF NOT EXISTS study_plan_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_plan_id UUID NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    day_number INTEGER NOT NULL,
    task_text TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(study_plan_id, week_number, day_number, task_text)
);

-- Indexes for task queries
CREATE INDEX IF NOT EXISTS idx_study_plan_tasks_plan_id ON study_plan_tasks(study_plan_id);
CREATE INDEX IF NOT EXISTS idx_study_plan_tasks_week ON study_plan_tasks(study_plan_id, week_number);
CREATE INDEX IF NOT EXISTS idx_study_plan_tasks_completed ON study_plan_tasks(study_plan_id, is_completed);
```

### 3. Configure Environment Variables

**Backend** ([`backend/.env`](backend/.env.example)):
```env
GOOGLE_API_KEY=your_gemini_api_key
DATABASE_URL=postgresql://user:pass@localhost:5432/studyplanner
TAVILY_API_KEY=optional_for_scout_agent
```

**Frontend** ([`frontend/.env.local`](frontend/.env.example)):
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/studyplanner
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
BETTER_AUTH_SECRET=your_secret_key_here
```

### 4. Run Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 5. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

### 6. Access Application

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Landing page (marketing) |
| http://localhost:3000/auth/register | Create account |
| http://localhost:3000/auth/login | Sign in |
| http://localhost:3000/dashboard | Dashboard with study plan overview |
| http://localhost:3000/dashboard/generator | Generate new study plans |
| http://localhost:3000/dashboard/plans | Library of saved study plans |
| http://localhost:3000/dashboard/plan/[id] | Detailed view of a specific plan |
| http://localhost:8000 | Backend API |
| http://localhost:8000/docs | API Documentation |

## Project Structure

```
autonomous-study-planner/
├── README.md                 # This file
├── SETUP.md                  # Detailed setup guide
├── ARCHITECTURE.md           # Technical architecture docs
├── docker-compose.yml        # Docker development setup
├── backend/                  # FastAPI backend
│   ├── main.py              # FastAPI app entry point
│   ├── auth.py              # Session verification
│   ├── database.py          # PostgreSQL connection
│   ├── models.py            # Pydantic models
│   ├── crew_manager.py      # CrewAI orchestration
│   ├── agents.py            # Agent definitions
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment template
└── frontend/                 # Next.js frontend
    ├── src/
    │   ├── app/             # Next.js App Router
    │   │   ├── (marketing)/ # Marketing pages
    │   │   │   └── page.tsx # Landing page
    │   │   ├── auth/        # Auth pages
    │   │   │   ├── login/   # Sign in page
    │   │   │   └── register/# Sign up page
    │   │   ├── dashboard/   # Dashboard routes
    │   │   │   ├── page.tsx # Main dashboard
    │   │   │   ├── generator/# Study plan generator
    │   │   │   │   └── page.tsx
    │   │   │   ├── plans/   # Study plan library
    │   │   │   │   └── page.tsx
    │   │   │   └── plan/[id]/ # Plan detail view
    │   │   │       └── page.tsx
    │   │   ├── layout.tsx   # Root layout
    │   │   └── api/auth/    # Better Auth API routes
    │   ├── components/      # React components
    │   │   ├── GoalForm.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── Timeline.tsx
    │   │   ├── AuthButtons.tsx
    │   │   ├── StudyPlanGenerator.tsx  # Generator interface
    │   │   ├── StudyPlanLibrary.tsx    # Plans list view
    │   │   ├── StudyPlanDetail.tsx     # Plan detail view
    │   │   ├── SavePlanDialog.tsx      # Save confirmation
    │   │   ├── DeleteConfirmationDialog.tsx  # Delete confirmation
    │   │   └── WeekCard.tsx            # Weekly milestone card
    │   ├── lib/             # Utilities
    │   │   ├── auth.ts      # Better Auth config
    │   │   └── api.ts       # API client
    │   └── types/           # TypeScript types
    ├── package.json
    └── .env.example
```

## API Endpoints

### Health Check
```
GET /health
```
Returns service status.

### Study Plan Generation
```
POST /api/generate-plan
Authorization: Bearer <token>
Body: { "goal": "string", "weeks": number }
```
Generates a new AI-powered study plan.

### Study Plan Management
```
POST /api/save-plan
Authorization: Bearer <token>
Body: { "goal": "string", "weeks": number, "plan": StudyPlan }
```
Saves a study plan. Returns `exists: true` if duplicate detected.

```
GET /api/study-plans
Authorization: Bearer <token>
```
Returns list of all saved study plans for the authenticated user.

```
GET /api/study-plans/{plan_id}
Authorization: Bearer <token>
```
Returns detailed view of a specific study plan including tasks.

```
PUT /api/study-plans/{plan_id}
Authorization: Bearer <token>
Body: { "goal": "string", "weeks": number, "plan": StudyPlan }
```
Updates an existing study plan.

```
DELETE /api/study-plans/{plan_id}
Authorization: Bearer <token>
```
Deletes a study plan and all associated tasks.

### Task Completion
```
GET /api/study-plans/{plan_id}/tasks
Authorization: Bearer <token>
```
Returns all tasks for a study plan with completion status.

```
PUT /api/study-plans/{plan_id}/tasks/{task_id}
Authorization: Bearer <token>
Body: { "is_completed": boolean }
```
Updates a task's completion status.

```
GET /api/study-plans/{plan_id}/stats
Authorization: Bearer <token>
```
Returns completion statistics (percentage, completed tasks, current week).

**Response:**
```json
{
  "status": "healthy",
  "message": "Autonomous Study Planner API is running"
}
```

### Generate Study Plan
```
POST /api/generate-plan
Authorization: Bearer <session_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "goal": "Master AP Calculus AB",
  "weeks": 8
}
```

**Response:**
```json
{
  "success": true,
  "plan": {
    "goal": "Master AP Calculus AB",
    "weeks": 8,
    "milestones": [
      {
        "week": 1,
        "title": "Limits and Continuity Fundamentals",
        "objectives": ["Understand limit notation", "Evaluate limits graphically"],
        "resources": [
          {"title": "Khan Academy Limits", "url": "...", "type": "video"}
        ],
        "daily_tasks": ["Watch limits intro video", "Practice 5 limit problems"]
      }
    ]
  },
  "error": null
}
```

## Environment Variables

| Variable | Location | Description | Required |
|----------|----------|-------------|----------|
| `DATABASE_URL` | Both | PostgreSQL connection string | Yes |
| `GOOGLE_API_KEY` | Backend | Gemini API key for CrewAI | Yes |
| `BETTER_AUTH_SECRET` | Frontend | Auth encryption secret | Yes |
| `NEXT_PUBLIC_BACKEND_URL` | Frontend | Backend API URL | Yes |
| `TAVILY_API_KEY` | Backend | Optional search API | No |

## Authentication Flow

1. User registers or logs in with email/password on `/auth/login` or `/auth/register`
2. Better Auth validates credentials and creates session in PostgreSQL [`session`](backend/database.py:31) table
3. Frontend stores session token
4. User is redirected to `/dashboard`

### Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Landing page (marketing) | Public |
| `/auth/login` | Email/password sign in | Public |
| `/auth/register` | Create new account | Public |
| `/dashboard` | Main application | Authenticated only |
6. Frontend sends API requests with `Authorization: Bearer <token>` header
7. Backend queries PostgreSQL to verify session via [`get_session_by_token()`](backend/database.py:20)
8. If valid, request proceeds; otherwise returns 401

## CrewAI Agent Pipeline

The study plan generation uses three specialized agents:

### 1. Strategist Agent
**Role:** Academic Strategist  
**Task:** Decompose the goal into learning objectives and milestones  
**Output:** Text analysis with topic breakdown and weekly distribution

### 2. Scout Agent
**Role:** Resource Scout  
**Task:** Research and compile high-quality learning resources  
**Tools:** Tavily Search (optional)  
**Output:** Curated list of courses, videos, articles with URLs

### 3. Architect Agent
**Role:** Study Plan Architect  
**Task:** Create structured JSON schedule with weekly milestones  
**Output:** Valid JSON matching [`StudyPlan`](backend/models.py:21) schema

## Security Considerations

- **Session-based Auth:** Tokens stored in PostgreSQL, not JWT - enables instant revocation
- **Database Verification:** Every API request verified against session table
- **CORS:** Backend allows all origins in development; restrict in production
- **Environment Variables:** All secrets externalized to `.env` files
- **Input Validation:** Pydantic models validate all request data

## License

MIT License - See LICENSE file for details
