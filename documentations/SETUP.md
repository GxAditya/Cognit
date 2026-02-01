# Setup Guide

Complete step-by-step instructions to set up and run the Autonomous Study Planner.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **Python** 3.10 or higher ([Download](https://python.org/))
- **PostgreSQL** 14 or higher ([Download](https://postgresql.org/))

> **Note:** Authentication is email/password only via Better Auth. No OAuth configuration required.

Verify installations:
```bash
node --version      # Should show v18.x.x or higher
python --version    # Should show 3.10.x or higher
psql --version      # Should show 14.x or higher
```

## 1. Database Setup

### Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and run the installer from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)

### Create Database and User

```bash
# Switch to postgres user (Linux/macOS)
sudo -u postgres psql

# Or connect as current user if you have postgres superuser
psql -U postgres
```

Inside psql:
```sql
-- Create database
CREATE DATABASE studyplanner;

-- Create user (optional - can use existing postgres user)
CREATE USER studyuser WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE studyplanner TO studyuser;

-- Exit
\q
```

### Manual Table Creation (Optional)

> **Note:** Better Auth normally auto-creates the required tables on first run. Only follow this section if you encounter issues with table creation or prefer to set up the database schema manually.

If Better Auth doesn't auto-create the tables, you can create them manually using the SQL schema file:

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

### Test Connection

```bash
psql -U postgres -d studyplanner -c "SELECT 1;"
```

## 2. API Keys Setup

### Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Copy the API key for `GOOGLE_API_KEY`

### Optional: Tavily API Key

For enhanced resource search:
1. Go to [Tavily](https://tavily.com/)
2. Sign up and get API key
3. This enables the Scout agent to search for current resources

## 3. Backend Setup

### Navigate and Create Virtual Environment

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (macOS/Linux)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- FastAPI & Uvicorn - Web framework and server
- CrewAI & CrewAI Tools - AI agent orchestration
- Google Generative AI - Gemini LLM integration
- psycopg2-binary - PostgreSQL driver
- python-dotenv - Environment variable management

### Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
GOOGLE_API_KEY=your_actual_gemini_api_key
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/studyplanner
TAVILY_API_KEY=your_tavily_key_optional
```

**Database URL format:**
```
postgresql://username:password@host:port/database
```

Examples:
- Local with postgres user: `postgresql://postgres:password@localhost:5432/studyplanner`
- Local with custom user: `postgresql://studyuser:your_password@localhost:5432/studyplanner`

### Run Backend

```bash
# Development mode with auto-reload
uvicorn main:app --reload

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000
```

Verify it's running:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status":"healthy","message":"Autonomous Study Planner API is running"}
```

## 4. Frontend Setup

### Navigate and Install Dependencies

```bash
cd frontend
npm install
```

This installs:
- Next.js 15 & React 19
- Better Auth - Authentication library
- pg - PostgreSQL client for Node.js
- TailwindCSS - Styling
- Lucide React - Icons

### Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/studyplanner
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
BETTER_AUTH_SECRET=your_random_secret_min_32_chars
```

**Generate Better Auth Secret:**
```bash
# macOS/Linux
openssl rand -base64 32

# Or use any random string generator
# Must be at least 32 characters
```

### Run Frontend

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

The app will be available at http://localhost:3000

## 5. Better Auth Database Tables

Better Auth automatically creates required tables on first run:

### Tables Created

**user** - Stores user information
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| email | varchar | User email |
| name | varchar | Display name |
| image | text | Profile image URL |
| created_at | timestamp | Account creation |
| updated_at | timestamp | Last update |

**session** - Stores active sessions
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| token | varchar | Session token (used in Bearer auth) |
| user_id | uuid | Foreign key to user |
| expires_at | timestamp | Session expiration |
| created_at | timestamp | Session creation |
| updated_at | timestamp | Last update |

**account** - Stores OAuth provider data
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to user |
| provider | varchar | OAuth provider (google) |
| provider_account_id | varchar | Provider's user ID |
| access_token | text | OAuth access token |
| refresh_token | text | OAuth refresh token |
| expires_at | timestamp | Token expiration |

**study_plans** - Stores saved study plans
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | text | Foreign key to user |
| goal | text | Study goal |
| weeks | integer | Duration in weeks |
| plan_data | jsonb | Complete plan (milestones, tasks) |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update |

**study_plan_tasks** - Stores task completion states
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| study_plan_id | uuid | Foreign key to study_plans |
| week_number | integer | Week number (1-N) |
| day_number | integer | Day of week (1-7) |
| task_text | text | Task description |
| is_completed | boolean | Completion status |
| completed_at | timestamp | When completed |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update |

### Verify Tables

```bash
psql -U postgres -d studyplanner -c "\dt"
```

Should show: `account`, `session`, `user`, `verification`, `study_plans`, `study_plan_tasks`

## 6. Running the Application

### Terminal 1: Backend

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

### Access the App

| Route | Description |
|-------|-------------|
| `/` | Landing page (marketing) |
| `/auth/register` | Create a new account |
| `/auth/login` | Sign in with email/password |
| `/dashboard` | Dashboard overview (requires login) |
| `/dashboard/generator` | Generate new study plans |
| `/dashboard/plans` | Library of saved study plans |
| `/dashboard/plan/[id]` | Detailed view of specific plan |

1. Open http://localhost:3000 in your browser
2. Click "Get Started" or navigate to `/auth/register`
3. Create an account with email and password
4. Log in at `/auth/login`
5. Navigate to `/dashboard/generator`
6. Enter a study goal (e.g., "Learn Python programming")
7. Select duration (1-12 weeks)
8. Click "Generate Plan"
9. Review the preview and click "Save Plan"
10. Navigate to `/dashboard/plans` to see all saved plans
11. Click on a plan to view details and track progress

## 7. Testing the Flow

### Test Authentication

1. Navigate to `/auth/register` and create a new account
2. Verify you're redirected to `/dashboard` after registration
3. Log out and test login at `/auth/login`
4. Verify session persistence across page refreshes

```bash
# Get session token (run in browser console after sign-in)
const res = await fetch('/api/auth/session');
const session = await res.json();
console.log(session.token);
```

### Test Study Plan Generation

1. Navigate to `/dashboard/generator`
2. Enter a study goal (e.g., "Learn Python programming")
3. Select duration (1-12 weeks)
4. Click "Generate Plan"
5. Verify the plan preview appears with milestones

### Test Save Functionality

**Save New Plan:**
1. After generating a plan, click "Save Plan"
2. Verify success toast notification
3. Navigate to `/dashboard/plans` to see the saved plan

**Duplicate Detection:**
1. Generate a plan with the same goal and weeks as an existing plan
2. Click "Save Plan"
3. Verify the "Duplicate Plan Detected" dialog appears
4. Test both options:
   - "No, Keep Existing" - Existing plan remains
   - "Yes, Replace" - Old plan is deleted, new plan saved

### Test Study Plan Library

1. Navigate to `/dashboard/plans`
2. Verify all saved plans are listed
3. Check that plan details display correctly (goal, weeks, creation date)
4. Click on a plan to navigate to detail view

### Test Delete Functionality

1. Navigate to `/dashboard/plans`
2. Click the trash icon on any plan
3. Verify the "Delete Study Plan" confirmation dialog appears
4. Click "Cancel" - Plan should remain
5. Click "Delete" again and confirm - Plan should be removed
6. Verify the plan no longer appears in the library

### Test Plan Detail View

1. Navigate to `/dashboard/plans` and select a plan
2. Verify the detail page shows:
   - Plan goal and duration
   - Overall progress percentage
   - Completed tasks count
   - Week-by-week breakdown
3. Test task completion:
   - Click on an incomplete task
   - Verify it shows as completed with checkmark
   - Verify progress bar updates
   - Refresh page and verify completion persists
4. Test uncompleting a task

### Test API Directly

```bash
# Health check
curl http://localhost:8000/health

# Generate plan (replace TOKEN with actual session token)
curl -X POST http://localhost:8000/api/generate-plan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{"goal":"Learn Rust programming","weeks":4}'

# Save plan
curl -X POST http://localhost:8000/api/save-plan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "goal":"Learn Rust programming",
    "weeks":4,
    "plan":{
      "goal":"Learn Rust programming",
      "weeks":4,
      "milestones":[...]
    }
  }'

# List all plans
curl -X GET http://localhost:8000/api/study-plans \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Get specific plan (replace PLAN_ID)
curl -X GET http://localhost:8000/api/study-plans/PLAN_ID \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Update task completion (replace PLAN_ID and TASK_ID)
curl -X PUT http://localhost:8000/api/study-plans/PLAN_ID/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{"is_completed":true}'

# Get plan stats
curl -X GET http://localhost:8000/api/study-plans/PLAN_ID/stats \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Delete plan (replace PLAN_ID)
curl -X DELETE http://localhost:8000/api/study-plans/PLAN_ID \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

### Check Database

```bash
# View active sessions
psql -U postgres -d studyplanner -c "SELECT id, user_id, expires_at FROM session;"

# View users
psql -U postgres -d studyplanner -c "SELECT id, email, name FROM \"user\";"

# View study plans
psql -U postgres -d studyplanner -c "SELECT id, user_id, goal, weeks, created_at FROM study_plans;"

# View tasks for a specific plan (replace PLAN_ID)
psql -U postgres -d studyplanner -c "SELECT id, week_number, day_number, task_text, is_completed FROM study_plan_tasks WHERE study_plan_id = 'PLAN_ID';"

# View completion stats
psql -U postgres -d studyplanner -c "
SELECT 
  sp.goal,
  COUNT(t.id) as total_tasks,
  COUNT(t.id) FILTER (WHERE t.is_completed = true) as completed_tasks
FROM study_plans sp
LEFT JOIN study_plan_tasks t ON sp.id = t.study_plan_id
GROUP BY sp.id, sp.goal;
"

## Troubleshooting

### Database Connection Issues

**Error:** `connection refused`
- Ensure PostgreSQL is running: `sudo systemctl status postgresql`
- Check port: PostgreSQL default is 5432
- Verify credentials in DATABASE_URL

**Error:** `database "studyplanner" does not exist`
- Create database: `createdb studyplanner`

### Authentication Issues

**Error:** `Invalid email or password`
- Verify you're using the correct email/password combination
- Check that the user exists in the database

**Error:** `Session expired`
- Session tokens expire after a set time
- User will need to log in again

### Backend Issues

**Error:** `ModuleNotFoundError`
- Ensure virtual environment is activated
- Reinstall: `pip install -r requirements.txt`

**Error:** `GOOGLE_API_KEY not set`
- Check .env file exists and has the key
- Restart uvicorn after editing .env

### Frontend Issues

**Error:** `Cannot find module`
- Run `npm install` again
- Check node_modules exists

**Error:** `Database connection failed`
- Frontend needs DATABASE_URL for Better Auth
- Ensure PostgreSQL is accessible from frontend

### Study Plan Issues

**Error:** `Failed to save study plan`
- Check that the `study_plans` table exists
- Verify database permissions
- Check backend logs for detailed error

**Error:** `Study plan not found`
- Verify the plan ID is correct
- Ensure the plan belongs to the authenticated user
- Check if the plan was deleted

**Error:** `Duplicate plan detected` dialog keeps appearing
- This is expected behavior when saving a plan with the same goal and weeks
- Choose to replace or keep the existing plan

### Task Completion Issues

**Error:** `Failed to update task`
- Verify the task ID is correct
- Check that the `study_plan_tasks` table exists
- Ensure the plan belongs to the authenticated user

**Tasks not showing as completed after refresh**
- Check that tasks were initialized when the plan was saved
- Verify the `study_plan_tasks` table has records for the plan
- Check browser console for API errors

## Production Deployment Notes

### Environment Changes

**Backend:**
- Change CORS origins from `["*"]` to specific domains
- Use production ASGI server (gunicorn with uvicorn workers)
- Set up proper logging

**Frontend:**
- Update NEXT_PUBLIC_BACKEND_URL to production API
- Ensure BETTER_AUTH_SECRET is cryptographically secure
- Set up proper environment variable injection

### Database

- Use managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)
- Set up automated backups
- Configure connection pooling

### Security

- Enable HTTPS only
- Set secure cookies
- Configure CSP headers
- Use secrets manager for API keys
