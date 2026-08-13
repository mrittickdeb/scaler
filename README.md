# EchoNotes — Meeting Intelligence Workspace (Fireflies.ai Clone)

**Scaler AI Labs — SDE Fullstack Assignment**

EchoNotes is a functional, production-ready meeting intelligence web platform modeled after Fireflies.ai. It converts meeting transcripts into searchable, actionable artifacts — featuring bi-directional audio-transcript synchronization, executive AI summaries, timestamped outline chapters, interactive action item management, and a natural language "Ask This Meeting" assistant.

---

## 🌟 Key Features

1. **Meetings Dashboard / Library (`/`)**
   - Live debounced text search (300ms) over meeting titles and participant names.
   - Dynamic sorting: *Most Recent*, *Oldest*, *Longest Duration*, *Shortest Duration*.
   - Participant filtering & stacked avatar displays with `+N` overflow count.
   - Full CRUD: Create new meetings via file upload or paste, and delete meetings via modal confirmation.

2. **Interactive Transcript & Audio Sync (`/meetings/[id]`)**
   - Real-time bi-directional audio sync:
     - **Audio → Transcript**: Playing audio highlights current transcript segment and auto-scrolls smoothly into view.
     - **Transcript → Audio**: Clicking any transcript segment seeks the player directly to that timestamp and starts playback.
   - Custom audio controls: Play/pause, ±5s skip, scrubber slider, playback speed selector (`0.75x`–`2.0x`), and volume toggle.
   - Deterministic per-speaker color coding.
   - In-transcript search with substring match highlighting, "Match X of Y" counter, and Next/Prev navigation.

3. **AI Summary & Notes**
   - **Executive Summary**: Overview text generated locally or via OpenAI.
   - **Outline / Chapters**: Clickable timestamped chapters that jump audio playback to chapter moments.
   - **Action Items**: Checklist UI with assignee avatars, "Jump to moment" links, and full Add/Delete/Toggle persistence.

4. **Bonus Feature: "Ask This Meeting" Conversational Assistant**
   - Collapsible chat panel allowing natural language Q&A against the meeting transcript.
   - Suggested quick question prompt chips (*"What were the main blockers?"*, *"Who is responsible for action items?"*).

---

## 🏗 Architecture & Tech Stack Rationale

### Frontend
- **Framework**: Next.js 14 (App Router) + TypeScript + Tailwind CSS.
- **Design Tokens**: Custom theme palette anchored by **Deep Teal (`#0F6B5C`)** accent and warm slate neutrals.
- **Iconography & Utils**: Lucide Icons, `clsx`, `tailwind-merge`.

### Backend
- **Framework**: Python 3.13 + FastAPI for high-performance REST APIs and auto-generated Swagger documentation at `/docs`.
- **Database & ORM**: SQLite + SQLAlchemy 2.0 with explicit relational schemas and foreign keys (`joinedload` query optimization).
- **Schema Migrations**: Alembic (`alembic upgrade head`).

### System Architecture Diagram
```
+-------------------------------------------------------+
|                 Next.js Frontend                      |
|  - Dashboard Library (Debounced Search & Sort)        |
|  - Interactive Transcript Player Sync (timeupdate)    |
|  - Summary, Outline, & Action Items Tabs              |
|  - "Ask This Meeting" Conversational Assistant       |
+---------------------------+---------------------------+
                            | REST API (camelCase JSON)
                            v
+-------------------------------------------------------+
|                 FastAPI Backend                       |
|  - Routers: /meetings, /transcript, /summary, /ask    |
|  - Services: Transcript Parser & Summary Generator    |
+---------------------------+---------------------------+
                            | SQLAlchemy 2.0 ORM
                            v
+-------------------------------------------------------+
|              SQLite Database (echonotes.db)           |
|  Users | Meetings | Participants | TranscriptSegments  |
|  Summaries | OutlineItems | ActionItems               |
+-------------------------------------------------------+
```

---

## 🗄 Database Schema

The database uses a clean, fully relational schema (not JSON blobs):

- `users`: `id`, `name`, `email`, `avatar_url`, `created_at`
- `meetings`: `id`, `title`, `date`, `duration_seconds`, `audio_url`, `created_at`, `updated_at`, `owner_id` -> `users.id`
- `participants`: `id`, `meeting_id` -> `meetings.id`, `name`, `avatar_url`, `is_speaker`
- `transcript_segments`: `id`, `meeting_id` -> `meetings.id`, `speaker_id` -> `participants.id`, `start_time`, `end_time`, `text`, `sequence_order`
- `summaries`: `id`, `meeting_id` -> `meetings.id` (1:1), `overview_text`, `generated_at`, `source`
- `outline_items`: `id`, `meeting_id` -> `meetings.id`, `title`, `start_time`, `sequence_order`
- `action_items`: `id`, `meeting_id` -> `meetings.id`, `text`, `assignee_id` -> `participants.id`, `due_date`, `is_completed`, `source_segment_id` -> `transcript_segments.id`

---

## ⚡ Quickstart & Local Setup

### 1. Prerequisites
- Python 3.10+ (Python 3.13 recommended)
- Node.js 18+ and `npm`

### 2. Backend Setup
```bash
cd backend

# Create virtual environment & install dependencies
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt

# Run Alembic migrations
alembic upgrade head

# Seed database with 5 realistic meeting datasets (Idempotent)
python -m app.seed.seed_data

# Start FastAPI dev server
uvicorn app.main:app --reload --port 8000
```
- Interactive API Swagger Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### 3. Frontend Setup
```bash
cd frontend

# Install Node dependencies
npm install

# Start Next.js dev server
npm run dev
```
- Open Application: [http://localhost:3000](http://localhost:3000)
- Interactive Style Guide: [http://localhost:3000/style-guide](http://localhost:3000/style-guide)

---

## 📡 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status |
| `GET` | `/api/meetings` | List meetings (query params: `search`, `sort`, `participant`) |
| `POST` | `/api/meetings` | Create meeting with optional raw transcript text & participants |
| `GET` | `/api/meetings/{id}` | Get complete meeting detail |
| `PATCH` | `/api/meetings/{id}` | Update meeting metadata |
| `DELETE` | `/api/meetings/{id}` | Delete meeting and cascading records |
| `GET` | `/api/meetings/{id}/transcript` | Get transcript segments |
| `GET` | `/api/meetings/{id}/summary` | Get meeting summary |
| `GET` | `/api/meetings/{id}/action-items` | Get action items |
| `POST` | `/api/meetings/{id}/action-items` | Create new action item |
| `PATCH` | `/api/action-items/{id}` | Toggle complete or update action item |
| `DELETE` | `/api/action-items/{id}` | Delete action item |
| `POST` | `/api/meetings/{id}/ask` | Conversational Q&A against meeting transcript |

---

## ⚙️ Environment Variables & Mock vs. LLM Toggle

Configuration file: `backend/.env`

```env
DATABASE_URL=sqlite:///./echonotes.db
ENABLE_LLM_GENERATION=false
OPENAI_API_KEY=
```

- **Mock Generator Mode (`ENABLE_LLM_GENERATION=false`)**: App runs locally with zero external API key requirements, generating structured summaries and context-aware responses.
- **LLM Mode (`ENABLE_LLM_GENERATION=true`)**: App connects to OpenAI API for live transcript summarization and Q&A responses.

---

## 🚀 Deployment Instructions

### Frontend (Vercel)
1. Push project repository to GitHub.
2. Import `frontend/` directory into Vercel.
3. Configure environment variable: `NEXT_PUBLIC_API_BASE_URL=https://your-backend-render-app.onrender.com`.

### Backend (Render / Railway)
1. Import `backend/` directory as Web Service on Render or Railway.
2. Build command: `pip install -r requirements.txt && alembic upgrade head && python -m app.seed.seed_data`
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

## 📝 Assumptions & Scope Notes

- **Default User**: Auth is stubbed to default user `Alex Chen` (`alex@echonotes.ai`).
- **Audio Files**: Audio player uses public MP3 audio samples seeded with timestamps.
- **Transcript Format**: Text parser supports `[00:12] Speaker Name: Text` or `Speaker Name: Text` formatting.
