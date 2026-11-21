# Lead Manager

A small full-stack app for capturing and tracking sales leads.

**Stack:** React (Vite) · Node.js + Express · MongoDB (Mongoose) · JWT auth · Jest + Supertest

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

## Design decisions

- **Validation** lives in one backend module and is mirrored on the frontend for instant feedback; the backend is always the source of truth.
- **Required fields:** name, email, source, status. Phone and company are optional but validated when provided.
- **Data isolation:** every lead query is scoped by `user`, so one user can never read or modify another's leads (returns 404).
- **Indexes:** `{user,status}`, `{user,createdAt}`, `{user,name}`, and unique `{user,email}` to prevent duplicate leads per user.
- **Search** is a case-insensitive, regex-escaped match on name (safe against regex injection).
