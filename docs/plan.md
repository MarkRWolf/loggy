# Loggy – v1 Implementation Plan

This document is the single source of truth for **what to build**, **in what order**, and **what each step includes**. If it’s not here, it does not exist.

---

## Build Order (Strict)

1. Domain & Data Model
2. Database Schema & Migrations
3. Authentication
4. Core Job API (CRUD)
5. Dashboard UI (Minimal)
6. Sorting & Filtering
7. Homepage / Marketing

No steps are skipped. No parallel work before prerequisites are done.

---

## 1. Domain & Data Model (Freeze Before Coding)

### Entity: User

* id (uuid)
* email (unique, required)
* createdAt

### Entity: Job

* id (uuid)
* userId (FK → User.id)
* title (string, required)
* company (string, required)
* url (string, optional)
* status (enum)

  * wishlist
  * applied
  * interview
  * rejected
  * offer
* relevance (int, 1–5)
* notes (text)
* createdAt
* updatedAt

### Constraints

* A job always belongs to exactly one user
* Users can only access their own jobs
* Sorting must be possible on: createdAt, title, company, relevance

### Non‑Goals (v1)

* No scraping
* No AI
* No automation
* No multi-user sharing

---

## 2. Database Schema & Migrations

### Tables

* users
* jobs

### Steps

* Initialize database
* Create users table
* Create jobs table with FK to users
* Add indexes on:

  * jobs.userId
  * jobs.createdAt
  * jobs.company

Do not proceed until migrations run clean on a fresh database.

---

## 3. Authentication

### Features

* Signup (email + password)
* Login
* Logout
* Session persistence

### Steps

* Implement auth backend
* Store user records
* Protect all job-related routes

No job logic is written before this is complete.

---

## 4. Core Job API (Backend First)

### Endpoints

* Create job
* List jobs (by user)
* Update job
* Delete job

### Steps

* Validate input
* Enforce user ownership
* Return consistent responses

If it cannot be tested without a UI, it is not done.

---

## 5. Dashboard UI (Minimal)

### Pages

* Login
* Signup
* Dashboard

### Dashboard Features

* List jobs (single list view)
* Create job form
* Edit job form
* Delete job action

### Rules

* Functionality over design
* No alternate layouts

---

## 6. Sorting & Filtering

### Sorting Options

* Date added
* Title
* Company
* Relevance

### Steps

* Backend support
* Frontend controls

No client-side hacks if server-side sorting exists.

---

## 7. Homepage / Marketing

### Purpose

* Explain what Loggy is
* Link to dashboard
* Contact info

### Pages

* Home
* About / Project explanation

Built last. Purely presentational.

---

## Done Definition (v1)

* Auth works
* Jobs can be created, viewed, updated, deleted
* Sorting works
* App is deployable and usable daily

Anything beyond this is v2.

