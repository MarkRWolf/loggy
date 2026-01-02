# Loggy

A deliberately simple job application tracker built for accuracy, not automation.

Loggy is a personal tool I built and use to track real job searches.  
This repository is public as a **full-stack, production-style reference project**.

---

## What Loggy does

Loggy helps you keep your job search honest:

- Track applications through a clear pipeline  
  `wishlist → applied → interview → offer / rejected`
- Store the context you actually need later:
  relevance, notes, source, applied date, location, contact
- Sort and filter server-side so the data stays reliable as it grows

Nothing happens automatically.  
If it’s in Loggy, it’s because you put it there.

---

## What Loggy deliberately does *not* do

- No scraping
- No auto-apply
- No AI recommendations
- No recruiter spam
- No multi-user sharing

The goal is clarity, not optimization theatre.

---

## Tech stack

**Frontend**
- Next.js 16 (App Router)
- Server Components + Route Handlers (BFF)
- Zod for validation
- Tailwind + shadcn/ui

**Backend**
- ASP.NET Core 8
- PostgreSQL
- EF Core migrations
- Cookie-based authentication (no Identity magic)

---

## Architecture (high level)

The browser never talks directly to the API.

```
Browser
  → Next.js Route Handlers (/api/*)
    → ASP.NET Core API
      → PostgreSQL
```

Why this matters:
- Cookies remain httpOnly and server-controlled
- SSR works correctly without leaking auth state
- CSRF surface is constrained
- Local and production setups behave the same

---

## Security posture

This is not demo auth.

- httpOnly cookies
- SameSite=Strict
- Secure cookies in production
- Subdomain cookie sharing (`.loggy.dk`)
- Origin checks on all state-changing requests
- Rate limiting on auth endpoints
- Server-side ownership enforcement on all job data

---

## Project status

**v1 is complete** and used daily.

Future ideas (not implemented here):
- Over-time stats
- Basic analytics
- CSV export

Scope is intentionally limited.

---

## Local development

### Configuration

Frontend:
- See `frontend/.env.example`
- Create `frontend/.env.local`

Backend:
- See `backend/appsettings.example.json`
- Use `dotnet user-secrets` for local secrets
- Production values are injected via environment variables

Docker:
- See `infra/.env.example`
- Create `infra/.env`
- Local containers use `.env` referenced by `docker-compose.yml`


### Requirements
- Node.js 18+
- .NET 8 SDK
- PostgreSQL

### Backend
```bash
cd backend
dotnet restore
dotnet run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Defaults:
- Portal: http://localhost:3000  
- API: http://localhost:5143  

---

## How to review this repo

If you’re reviewing this from an engineering perspective:

1. Start with `plan.md` (authoritative scope & constraints)
2. Look at the BFF layer (`frontend/app/api/*`)
3. Check validation parity (Zod ↔ backend)
4. Review auth + cookie handling
5. Skim the job CRUD flow end-to-end


