# Loggy – v2 Implementation Plan

This document defines **what v2 adds**, **in what order**, and **what is explicitly out of scope**.

If it’s not written here or in plan_v1.md, it does not exist.

---

## v2 Goals (High-Level)

v2 adds **time awareness, insight, and exportability** on top of the existing tracker.

- Answer: *“What changed, and when?”*
- Make patterns visible without automation or AI
- Keep everything manual, explicit, and auditable

---

## Build Order (Strict)

1. Job History / Events
2. Over-Time Stats API
3. Portal Analytics UI
4. CSV Export
5. Light UX Polish (Portal only)

No parallel work. Each step must be complete before the next.

---

## 1. Job History / Events (Backend First)

### New Entity: JobEvent

Represents meaningful changes to a job over time.

### Fields

- id (uuid)
- jobId (FK → Job.id)
- userId (FK → User.id)
- type (enum)
  - created
  - status_changed
  - relevance_changed
  - notes_changed
- oldValue (string, nullable)
- newValue (string, nullable)
- createdAt (datetime)

### Rules

- Events are **append-only**
- Events are written automatically by backend on job create/update
- No client-side event creation
- Only meaningful changes create events (no no-op noise)

### Completion Check

- [ ] JobEvent table exists with indexes on jobId + createdAt
- [ ] Events are written on job create
- [ ] Events are written on status/relevance/notes change
- [ ] Users can only access their own job events

---

## 2. Over-Time Stats API

### New Read-Only Endpoints

- `GET /jobs/timeline`
  - Aggregated counts per status per day/week
- `GET /jobs/conversion`
  - Counts of transitions (wishlist → applied → interview → offer/rejected)

### Rules

- Server-side aggregation only
- Time bucketing:
  - v2 supports **daily** and **weekly**
- No client-side math hacks

### Completion Check

- [ ] API returns stable, deterministic aggregates
- [ ] Works with empty / sparse data
- [ ] Matches JobEvent data exactly

---

## 3. Portal Analytics UI

### New Portal Page

- `/analytics`

### Sections

- Status over time (line or stacked bar)
- Funnel / conversion summary
- “Average time in status” (rough, honest, no fake precision)

### Rules

- Read-only
- No filters beyond time range (30 / 90 days, all time)
- Must render fully from server data

### Completion Check

- [ ] Analytics page is gated by auth (SSR)
- [ ] Charts reflect backend data 1:1
- [ ] No client-side recomputation of aggregates

---

## 4. CSV Export

### Feature

- Export all jobs + core fields + timestamps
- Optional inclusion of job events

### Endpoint

- `GET /jobs/export.csv`

### Rules

- One-click download
- UTF-8 CSV
- No background jobs

### Completion Check

- [ ] CSV matches DB content exactly
- [ ] Handles large datasets without timing out
- [ ] Auth + ownership enforced

---

## 5. Light UX Polish (Portal Only)

Explicitly **not** a redesign.

### Allowed

- Empty states for Analytics
- Minor copy tweaks
- Small affordances (tooltips, labels)

### Not Allowed

- New workflows
- New entities
- Notifications
- Automation

---

## Non-Goals (v2)

- No AI
- No scraping
- No reminders
- No multi-user features
- No Kanban / drag-and-drop

---

## v2 Done Definition

- Job changes are historically traceable
- Trends over time are visible and trustworthy
- Users can export their data cleanly
- App remains deployable, boring, and honest

