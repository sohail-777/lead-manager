# Lead Manager

A small full-stack app for capturing and tracking sales leads.

**Stack:** React (Vite) · Node.js + Express · MongoDB (Mongoose) · JWT auth · Jest + Supertest

## Tech choices

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite | Matches the suggested stack; fast dev server and tiny production build. Plain CSS keeps dependencies minimal. |
| Backend | Node.js + Express 4 | Simple, widely understood REST layer; easy to read and test. |
| Database | MongoDB + Mongoose | Matches the suggested stack; Mongoose gives schema validation, enums and indexes. |
| Auth | JWT + bcryptjs | Stateless auth, so the API scales without session storage. |
| Tests | Jest + Supertest + mongodb-memory-server | API tests run against an in-memory DB, no setup needed. |

## Features

**Core**
- Add a lead: name, email, phone, company, source (dropdown), status (New / Contacted / Qualified / Lost)
- Leads table with colour-coded status badges
- Edit a lead and update its status
- Delete with a confirmation dialog
- Search by name and filter by status
- Validation on both frontend and backend (required fields, email format, phone format, enums, length limits)

**Bonus (all included)**
- Signup / login (JWT, bcrypt) – every user sees only their own leads
- Server-side pagination and column sorting
- Dashboard with total and per-status counts (click a card to filter)
- API tests (Jest + Supertest)
- Single-service deploy: Express serves the built React app in production

## Project structure

```
lead-manager/
├── server/
│   ├── src/
│   │   ├── app.js            # Express app (exported for tests)
│   │   ├── index.js          # Entry point: connect DB, listen
│   │   ├── constants.js      # Statuses, sources, sortable fields
│   │   ├── validators.js     # Request validation
│   │   ├── models/           # User, Lead (with indexes)
│   │   ├── routes/           # auth.js, leads.js
│   │   └── middleware/       # auth (JWT), errorHandler
│   └── tests/leads.test.js
└── client/
    └── src/
        ├── api.js            # fetch wrapper + token handling
        ├── validation.js     # Frontend validation (mirrors backend)
        └── components/       # LeadsPage, LeadTable, LeadForm, Dashboard, ...
```

## Getting started

Prerequisites: Node 18+ and a running MongoDB (local, or a free MongoDB Atlas cluster).

```bash
# 1. Install dependencies
npm run install:all

# 2. Configure the server
cp server/.env.example server/.env
#    edit MONGODB_URI and set a long random JWT_SECRET

# 3. Run (two terminals)
npm run dev:server     # API on http://localhost:5000
npm run dev:client     # UI  on http://localhost:5173 (proxies /api to the server)
```

Open http://localhost:5173, create an account, and start adding leads.

### Tests

```bash
npm test
```

Tests use `mongodb-memory-server`, so no database setup is needed (the first run downloads a MongoDB binary).

### Production build

```bash
npm run build   # builds client/dist
npm start       # Express serves API + built UI on PORT
```

Deploying to Render/Railway: build command `npm run install:all && npm run build`, start command `npm start`, and set `MONGODB_URI` and `JWT_SECRET` env vars.

## API

All `/api/leads` routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create account → `{ token, user }` |
| POST | `/api/auth/login` | Log in → `{ token, user }` |
| GET | `/api/auth/me` | Current user |
| GET | `/api/leads` | List. Query: `search`, `status`, `page`, `limit`, `sortBy`, `order` |
| GET | `/api/leads/stats` | `{ total, byStatus }` |
| GET | `/api/leads/:id` | Single lead |
| POST | `/api/leads` | Create |
| PUT | `/api/leads/:id` | Update |
| DELETE | `/api/leads/:id` | Delete |

Errors use consistent JSON: `{ "message": "...", "errors": { "field": "..." } }` with status
400 (validation / bad id), 401 (auth), 404 (not found), 409 (duplicate email).

## Assumptions

- **Required vs optional fields:** name, email, source and status are required; phone and company are optional (validated only when provided).
- **Sources** are a fixed list: Website, Referral, LinkedIn, Cold Call, Email Campaign, Event, Other.
- **New leads default to status "New".**
- **Email is unique per user**, not globally, so two users can each track the same contact.
- **Search** matches on name only; **status filter** is an exact match. Both can be combined.
- **Phone numbers** are validated loosely (7-20 characters, digits plus `+ - ( )` and spaces) because formats vary by country.
- **Auth is email + password only.** The JWT is kept in `localStorage` and expires after 7 days.
- **Deletes are permanent** (no soft delete or undo).
- **Page size is 10**, and the API caps `limit` at 100.

## Design decisions

- **Validation** lives in one backend module and is mirrored on the frontend for instant feedback; the backend is always the source of truth.
- **Required fields:** name, email, source, status. Phone and company are optional but validated when provided.
- **Data isolation:** every lead query is scoped by `user`, so one user can never read or modify another's leads (returns 404).
- **Indexes:** `{user,status}`, `{user,createdAt}`, `{user,name}`, and unique `{user,email}` to prevent duplicate leads per user.
- **Search** is a case-insensitive, regex-escaped match on name (safe against regex injection).

## What I would improve with more time

- **Security:** move the JWT to an httpOnly cookie, add rate limiting on login/signup, add `helmet`, and add password reset and email verification.
- **Search:** extend search to email and company, and use a MongoDB text index instead of a regex for better performance on large datasets.
- **Features:** soft delete with undo, CSV import/export, notes and activity history per lead, assignees, and follow-up reminders.
- **Frontend quality:** TypeScript, React Query for caching and optimistic updates, component tests (React Testing Library) and an end-to-end test (Playwright).
- **Backend quality:** schema validation with Zod or Joi, request logging, OpenAPI/Swagger docs, and a CI pipeline running tests and linting.
- **UX:** toast stacking, keyboard shortcuts, saved filters, bulk actions, and a dark mode.
- **Ops:** Dockerfile and docker-compose (app + MongoDB), and a documented live deployment.
