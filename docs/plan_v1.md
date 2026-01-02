# Loggy – v1 Implementation Plan (Revised)

This document is the single source of truth for **what to build**, **in what order**, **what each step includes**, and **what is already done**.

If it’s not here, it does not exist.

---

## Runtime Topology (Authoritative)

### Hosts

- **Portal (Next.js 16):** `portal.loggy.dk`
  - Portal runs at **root path** `/`
- **API (ASP.NET Core 8):** `api.loggy.dk`
  - Cookie-based auth (httpOnly cookie)
- **Marketing site (same Next.js app):** `loggy.dk`
  - Served by the same Next.js deployment but routed under `/landing/*` via ingress rewrite:
    - `loggy.dk/` → `portal.loggy.dk/landing`
    - `loggy.dk/about` → `portal.loggy.dk/landing/about`

### Auth & Request Flow

- Browser talks to **portal only** for app actions.
- **BFF layer** is used for all client-side mutations and most client-side reads:
  - `Client UI (portal)` → `Next.js Route Handler (/api/*)` → `ASP.NET API (api.loggy.dk)`
- SSR reads (initial page render) may call API server-to-server using forwarded cookies.

---

## Build Order (Strict)

1. Domain & Data Model
2. Database Schema & Migrations
3. Authentication
4. Core Job API (CRUD)
5. Portal UI (Minimal)
6. Sorting & Filtering
7. Homepage / Marketing

No steps are skipped. No parallel work before prerequisites are done.

---

## 1. Domain & Data Model (Freeze Before Coding)

### Entity: User

- id (uuid)
- email (unique, required)
- createdAt

### Entity: Job

- id (uuid)
- userId (FK → User.id)
- title (string, required)
- company (string, required)
- url (string, optional)

- status (enum)
  - wishlist
  - applied
  - interview
  - rejected
  - offer

- relevance (int, 1–5)
- notes (text)

- appliedAt (datetime, optional)
  - Must be settable by client input (not auto-derived from createdAt)
- applicationSource (enum-ish string)
  - posted
  - unsolicited
  - referral
  - recruiter
  - internal
  - other
- location (string, optional)
- contactName (string, optional)

- createdAt
- updatedAt

### Constraints

- A job always belongs to exactly one user
- Users can only access their own jobs
- Sorting must be possible on: createdAt, title, company, relevance
- relevance must be 1–5
- status must be one of the allowed values
- applicationSource must be one of the allowed values

### Non-Goals (v1)

- No scraping
- No AI
- No automation
- No multi-user sharing

### Completion Check

- [x] Domain model agreed and implemented consistently (backend + frontend schemas/types).

---

## 2. Database Schema & Migrations

### Tables

- users
- jobs

### Steps

- Initialize database
- Create users table
- Create jobs table with FK to users
- Add indexes on:
  - jobs.userId
  - jobs.createdAt
  - jobs.company

### Completion Check

- [x] Migrations run clean on a fresh database.
- [x] Constraints/indexes exist and match expected access patterns.
- [x] Job metadata fields exist in DB and align with domain model:
  - appliedAt
  - applicationSource
  - location
  - contactName

---

## 3. Authentication

### Features

- Signup (email + password)
- Login
- Logout
- Session persistence

### Backend Requirements

- Cookie-based auth
- Protect all job-related routes
- CORS for dev and prod
  - Dev: `http://localhost:3000`
  - Prod: `https://portal.loggy.dk`
- Cookie configuration supports SSR across portal/api:
  - Prod cookie domain: `.loggy.dk` (so `portal.loggy.dk` and `api.loggy.dk` share auth)
  - Secure cookie in prod, httpOnly always

### Frontend Requirements

- Login page
- Signup page
- Logged-in portal access is gated (no authenticated HTML leak)

### Completion Check

- [x] Signup works end-to-end.
- [x] Login works end-to-end.
- [x] Logout works end-to-end.
- [x] Unauthorized access to portal redirects to `/login` (server-side).
- [x] Cookie session persists and is usable for SSR.

---

## 4. Core Job API (Backend First)

### Endpoints

- Create job
- List jobs (by user)
- Update job
- Delete job

### Steps

- Validate input
- Enforce user ownership
- Return consistent responses
- Support appliedAt + applicationSource + location + contactName in create/update + DTOs

### Completion Check

- [x] All CRUD endpoints exist and enforce ownership.
- [x] Auth required for all job endpoints.
- [x] Can be tested without relying on mock data.
- [x] Frontend Zod and backend validation match 100% (including appliedAt + applicationSource + location + contactName).

---

## 5. Portal UI (Minimal)

### Terminology

- We call it **Portal** (not Dashboard), even though it is “a dashboard”.

### Pages (Portal Host: `portal.loggy.dk`)

- Login (`/login`)
- Signup (`/signup`)
- Portal Home (`/`) — authenticated

### Portal Features

- List jobs (single list view)
- Create job form
- Edit job form
- Delete job action
- Inputs included in v1:
  - applicationSource
  - location
  - contactName
  - appliedAt may be defaulted by UI for now (until date picker)

### Architectural Rule (BFF)

- The client must not talk directly to `api.loggy.dk`.
- Client uses relative `/api/*` routes (Next route handlers).
- Next route handlers forward auth cookies to `api.loggy.dk`.

### Completion Check

- [x] Portal renders jobs on initial request (SSR).
- [x] If unauthenticated, portal is blocked server-side and redirects.
- [x] Create/Edit/Delete works via `/api/*` (BFF) and UI updates correctly.
- [x] UI is Brevo-like (functionality first, design consistent with chosen UI kit).
- [x] Portal create/edit forms include applicationSource + location + contactName and they persist correctly end-to-end.
- [x] appliedAt is sent by client on create/update and persists correctly end-to-end.

---

## 6. Sorting & Filtering

### Sorting Options

- Date added
- Title
- Company
- Relevance

### Steps

- Backend support
- Frontend controls

### Rules

- No client-side hacks if server-side sorting exists.

### Completion Check

- [x] Backend supports sorting/dir with the agreed query params.
- [x] Portal UI controls drive server-side sorting.
- [x] Filtering/search behaves correctly (scope: minimal + sane).

---

## 7. Homepage / Marketing

### Purpose

- Explain what Loggy is
- Link to portal
- Contact info

### Pages (Marketing Host: `loggy.dk`)

- Home (served internally at `/landing`)
- About / Project explanation (served internally at `/landing/about`)

### Completion Check

- [x] `loggy.dk` renders marketing pages via ingress rewrite to `/landing/*`.
- [x] Marketing pages do not require auth.
- [x] Link from marketing → `portal.loggy.dk`.

---

## Done Definition (v1)

- Auth works
- Jobs can be created, viewed, updated, deleted (including v1 metadata fields)
- Sorting works
- App is deployable and usable daily

---
