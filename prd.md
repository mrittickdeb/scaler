# Product Requirements Document
## EchoNotes — A Fireflies.ai-Class Meeting Intelligence Platform
**Prepared for:** Scaler AI Labs — SDE Fullstack Assignment
**Version:** 1.0

---

## 1. Product Vision

Most take-home clones look like a CRUD app wearing a screenshot. The goal here is the opposite: build something that feels like a real, shipped product — fast, opinionated, a little delightful — while the underlying code stays boring, obvious, and easy to defend in an interview.

**Positioning statement:** EchoNotes is a meeting-intelligence workspace where every meeting becomes a searchable, actionable artifact — transcript, summary, and tasks in one synced view.

**Differentiation strategy (how this stands out from a generic clone):**
1. **A real design system, not Tailwind defaults.** Custom type scale, a restrained color palette (not purple-gradient-SaaS-#7C3AED), custom spacing tokens, and hand-tuned micro-interactions. This is the single biggest lever for "doesn't look AI-generated."
2. **Transcript-audio sync done properly** — word/line-level highlighting synced to a real `<audio>` timeupdate loop, not a fake progress bar.
3. **One genuinely useful bonus feature done deeply** instead of five done shallowly (recommend: "Ask this meeting" chat + soundbites — see §9).
4. **A schema that anticipates real product growth** (speakers as first-class entities, transcript segments as rows not JSON blobs) — this is what "Database Design" evaluators are actually scoring.
5. **Empty states, loading states, error states, and toasts everywhere.** Generic clones only build the happy path; polish on the unhappy paths is what makes something feel shipped.

---

## 2. Goals & Non-Goals

### Goals
- Recreate the Fireflies core loop: capture → transcript → summary → action items → search.
- Ship a UI indistinguishable from a funded startup's product, not a hackathon demo.
- Demonstrate strong relational schema design and clean API architecture.
- Make every core feature (§5) fully functional end-to-end with persisted data.

### Non-Goals (explicitly out of scope, per assignment)
- Real speech-to-text / live bot joining calls.
- Real OAuth / multi-user auth (single seeded "default user" is fine).
- Real third-party integrations (Zoom, calendar, CRM) — placeholder "Coming Soon" cards only.

---

## 3. Target User & Core Use Case

**Persona:** Priya, a PM who takes 6 meetings a week and never has time to re-listen to any of them.

**Core job-to-be-done:** "I missed 10 minutes of standup — let me search the transcript for 'launch date' and jump straight to that moment, then check if it got captured as an action item."

This single scenario should work flawlessly end-to-end; design every core screen around making it fast.

---

## 4. Information Architecture

```
/                         → Meetings Library (dashboard)
/meetings/[id]            → Meeting Detail (transcript + player + summary tabs)
/meetings/new              → Create/Upload meeting modal or route
/settings                  → Placeholder settings (profile, integrations "coming soon")
```

**Meeting Detail is a two-pane layout** (this is Fireflies' signature pattern):
- Left: sticky media player + tabs (Transcript / Summary / Action Items / Outline)
- Right (optional, bonus): "Ask this meeting" chat panel, collapsible

---

## 5. Core Features — Detailed Specs

### 5.1 Meetings Library (Dashboard)
- Table/card hybrid list: title, date (relative — "2 days ago"), duration (mm:ss), participant avatars (stacked, max 4 + "+N").
- Search bar (debounced, 300ms) filtering by title/participant.
- Filter chips: Date range, Participant, Duration.
- Sort dropdown: Most Recent (default), Oldest, Longest, Shortest.
- Empty state: friendly illustration + "Upload your first meeting" CTA.
- Skeleton loading rows (not a spinner) while fetching.
- Row click → navigates to detail view; hover reveals quick actions (delete, rename) via kebab menu.

### 5.2 Meeting Detail — Transcript & Player
- Custom audio player: play/pause, scrubber, current time / total time, playback speed (0.75x–2x), volume.
- Transcript rendered as a virtualized list of segments: `{speaker, startTime, endTime, text}`.
- Active segment highlights and auto-scrolls into view as playback progresses (bind to `timeupdate`).
- Clicking any segment seeks the player (`audio.currentTime = segment.start`) and starts playback.
- In-transcript search: highlights all matches, shows "3 of 12" counter with next/prev navigation, jumps player to match on click.
- Speaker color-coding (deterministic color per speaker, consistent across the app).

### 5.3 AI Summary & Notes
- **Overview tab:** 3–5 sentence executive summary.
- **Outline/Chapters tab:** timestamped topic segments (click to seek), e.g. "00:00 Standup kickoff", "04:12 Sprint blockers".
- **Action Items tab:** checklist with assignee, due date (optional), source timestamp link back to transcript; inline add/edit/complete/delete.
- **Key Points tab (optional 4th):** bullet list of decisions/highlights.
- All of the above generated at seed-time (mocked) or on-demand via an LLM call against uploaded transcript text — see §7 for the mock/LLM toggle design.

### 5.4 Meeting Management (CRUD)
- **Create:** modal with two paths — (a) paste/upload transcript file (.txt/.vtt/.json), (b) manual form (title, date, participants) with empty transcript to fill in later.
- On upload, parse into segments (simple `.vtt` parser or JSON schema you define and document) and auto-run summary generation.
- **Edit:** title, date, participants — inline edit or modal.
- **Delete:** confirmation dialog, optimistic UI removal, toast with "Undo" (bonus polish).
- All action item CRUD operations covered in §5.3.

### 5.5 Fireflies-Grade UX Details (what makes it "feel real")
- Persistent left navbar: Home, Meetings, Analytics (placeholder), Settings, user avatar footer.
- Toast notification system (success/error/info) for every mutating action.
- Command-K style global search (bonus, see §9) or at minimum a prominent search bar.
- Consistent modal system (create meeting, confirm delete, edit metadata) — one reusable `<Modal>` component, not three ad-hoc ones.
- Responsive down to tablet width minimum; mobile-friendly is a plus but not required.

---

## 6. Design System (critical for "not AI-looking")

Do **not** ship default shadcn/Tailwind indigo. Define an actual system:

| Token | Decision |
|---|---|
| Primary color | Pick one deliberate accent (e.g. deep teal `#0F6B5C` or warm amber `#D97706`) — avoid default violet/indigo |
| Neutrals | Warm or cool gray scale, 9–10 steps, used for 90% of the UI |
| Type | One serif or distinctive sans for headings (e.g. "Söhne", "General Sans", or system fallback) + Inter/system for body |
| Spacing | 4px base scale, used consistently (no arbitrary `mt-[13px]`) |
| Radius | Pick one consistent radius scale (e.g. 8/12/16) — don't mix pill buttons with sharp cards |
| Shadows | Subtle, 2–3 elevation levels max |
| Motion | 150–200ms ease-out on hover/active states; segment highlight transitions; toast slide-in |
| Icons | One icon set only (Lucide is fine) — never mix icon libraries |

Build a small internal component library first (`Button`, `Badge`, `Avatar`, `Modal`, `Tabs`, `Toast`, `Skeleton`) — reuse everywhere. This is what separates "looks templated" from "looks like a product."

---

## 7. Mock vs. LLM-Generated Content Strategy

- Seed data must be **fully mocked and hand-written** for 4–6 realistic meetings (standup, client call, 1:1, planning session) — realistic dialogue, not lorem ipsum, so the app looks alive immediately.
- Optionally wire an LLM call (OpenAI/Claude/etc.) that generates summary + action items + outline from an uploaded transcript, gated behind an env var (`ENABLE_LLM_GENERATION`) so the grader can run it without an API key.
- Document clearly in the README which parts are seeded vs. dynamically generated.

---

## 8. Technical Architecture

**Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind (with the custom tokens from §6) + a lightweight state layer (React Query/TanStack Query for server state; avoid Redux — overkill here).

**Backend:** FastAPI (recommended over Django for a leaner, faster-to-build REST layer with automatic OpenAPI docs — a nice interview talking point: "here's my auto-generated API docs at `/docs`").

**Database:** SQLite via SQLAlchemy + Alembic migrations (shows schema discipline, not just `create_all()`).

**Suggested folder structure:**
```
backend/
  app/
    models/        # SQLAlchemy models
    schemas/        # Pydantic schemas
    routers/         # meetings.py, transcripts.py, action_items.py
    services/        # summary_generation.py (mock + LLM)
    seed/            # seed_data.py
    main.py
frontend/
  app/
    (dashboard)/
    meetings/[id]/
  components/
    ui/              # design-system primitives
    meeting/         # feature components
  lib/
    api.ts
    types.ts
```

---

## 9. Database Schema (relational, not JSON-blob)

```
users (id, name, email, avatar_url)

meetings (
  id, title, date, duration_seconds,
  audio_url, created_at, updated_at, owner_id → users.id
)

participants (id, meeting_id → meetings.id, name, avatar_url, is_speaker)

transcript_segments (
  id, meeting_id → meetings.id, speaker_id → participants.id,
  start_time, end_time, text, sequence_order
)

summaries (
  id, meeting_id → meetings.id (1:1),
  overview_text, generated_at, source ["mock"|"llm"]
)

outline_items (id, meeting_id → meetings.id, title, start_time, sequence_order)

action_items (
  id, meeting_id → meetings.id, text, assignee_id → participants.id (nullable),
  due_date (nullable), is_completed, source_segment_id → transcript_segments.id (nullable)
)

soundbites (id, meeting_id → meetings.id, segment_id → transcript_segments.id, label)  -- bonus
```

Why this beats a JSON-blob approach: transcript segments are queryable/searchable at the DB layer, action items can be linked back to their source moment, and speakers are reusable across meetings — all things an evaluator will notice.

---

## 10. API Design (REST, FastAPI)

```
GET    /api/meetings                 ?search=&sort=&participant=
POST   /api/meetings
GET    /api/meetings/{id}
PATCH  /api/meetings/{id}
DELETE /api/meetings/{id}

GET    /api/meetings/{id}/transcript
POST   /api/meetings/{id}/transcript/upload

GET    /api/meetings/{id}/summary
POST   /api/meetings/{id}/summary/generate

GET    /api/meetings/{id}/action-items
POST   /api/meetings/{id}/action-items
PATCH  /api/action-items/{id}
DELETE /api/action-items/{id}

GET    /api/search?q=                 -- global search bonus
```

Auto-generated Swagger docs at `/docs` (FastAPI default) — reference this in the README as your API overview.

---

## 11. Bonus Features — Recommended Priority Order

Given ~24h budget, pick 2 max, done well:

1. **"Ask this meeting" chat (highest impact):** simple RAG — concatenate transcript into an LLM prompt with the user's question, stream the answer in a chat panel. Strong differentiator, relatively low effort if scoped to single-meeting Q&A (no vector DB needed for this scale).
2. **Export (Markdown/PDF):** genuinely easy win, clear evaluator visibility.
3. Global search across all meetings (nice if search infra already built for §5.1).
4. Dark mode — only if design tokens (§6) are done as CSS variables from the start (trivial to add then, painful to bolt on later).

Skip soundbites/comments/tags unless time remains — they add schema complexity without much evaluation payoff.

---

## 12. Non-Functional Requirements

- Seed script (`seed_data.py`) must be idempotent and runnable via one documented command.
- No hardcoded secrets; `.env.example` provided.
- Basic error boundaries on frontend; API returns structured error JSON (`{detail: "..."}`).
- Loading/empty/error states on every data-fetching view — non-negotiable for polish.
- Type safety end-to-end: Pydantic schemas on backend, shared TS types (hand-mirrored or generated) on frontend.

---

## 13. Milestone Plan (~24h budget)

| Phase | Hours | Output |
|---|---|---|
| 1. Schema + seed data + API skeleton | 4h | DB migrations, seed script, `/meetings` CRUD working via Swagger |
| 2. Design system + component library | 3h | Button/Modal/Tabs/Toast/Avatar built once, tokens set |
| 3. Meetings Library UI | 3h | Fully wired dashboard with search/sort/filter |
| 4. Meeting Detail — player + transcript sync | 5h | The hardest/most impressive part — budget generously |
| 5. Summary/Outline/Action Items UI + CRUD | 4h | All tabs functional and persisted |
| 6. Bonus feature (pick 1–2 from §11) | 3h | Ask-this-meeting or export |
| 7. Polish pass + deploy + README | 2h | Empty/loading/error states, Vercel + Render deploy, docs |

---

## 14. README Checklist (deliverable requirement)

- [ ] Setup instructions (backend + frontend, env vars, seed command)
- [ ] Tech stack + why each choice was made
- [ ] Architecture overview diagram (folders + data flow)
- [ ] Database schema (ERD or the table listing from §9)
- [ ] API overview (link to `/docs` + key endpoints table)
- [ ] Assumptions made (single default user, mocked audio, etc.)
- [ ] What's mocked vs. LLM-generated
- [ ] Deployed link + demo credentials (if any)

---

## 15. Evaluation Criteria → PRD Section Mapping

| Criteria | Where addressed |
|---|---|
| Functionality | §5 (core features), §13 (milestones ensure everything is wired) |
| UI/UX | §6 (design system), §5.5 (Fireflies-grade details) |
| Database Design | §9 |
| Backend/API Design | §10 |
| Code Quality | §8 (structure), §12 (NFRs) |
| Code Modularity | §8, §6 (reusable component library) |
| Code Understanding | Build it yourself section-by-section rather than one large AI dump — easier to explain in interview |