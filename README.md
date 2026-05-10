# Traveloop

Traveloop is a multi-city travel planning web app for building itineraries, estimating trip budgets, and sharing travel plans.

## Overview

Traveloop helps users plan trips across multiple cities in one place. The app combines city discovery, activity search, itinerary building, budget estimation, packing support, notes, and public sharing into a practical hackathon-ready travel planner.

The repository is organized as a monorepo with separate frontend and backend applications:

- `frontend/`: React + Vite + Tailwind user interface
- `backend/`: Node.js + Express REST API
- MySQL: local relational database for users, trips, cities, stops, activities, budgets, notes, and packing data

## Problem

Planning a multi-city trip usually means switching between notes, maps, budget spreadsheets, booking details, and separate activity lists. This makes it difficult to keep the itinerary ordered, understand the budget impact, or share a clean plan with others.

## Solution

Traveloop provides a single trip-planning workflow where users can:

- Create trips
- Add ordered city stops
- Search cities and activities
- Attach activities to itinerary stops
- Estimate budgets dynamically
- Track budget caps
- Share read-only public itineraries
- Copy/fork public trips into their own account

## Features

- Email/password authentication with JWT sessions
- Trip CRUD scoped to authenticated users
- Multi-city itinerary builder with ordered stops
- Activity assignment per stop
- City search and activity search
- Budget engine with activity, meals, stay, transport, daily, and stop-wise estimates
- Budget cap tracking and over-budget status
- Public itinerary sharing with secure share tokens
- Copy/fork public trips into a user's account
- Export-ready itinerary JSON for future PDF/download support
- Demo seed data for Europe, Japan, and India travel flows
- Standardized API responses for frontend integration

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MySQL |
| Auth | JWT, bcrypt |
| Validation | express-validator |
| Database Driver | mysql2 |

## Folder Structure

```text
Traveloop/
  frontend/
    src/
    index.html
    package.json
    vite.config.js
    tailwind.config.js
    postcss.config.js

  backend/
    config/
    controllers/
    middleware/
    routes/
    scripts/
    utils/
    .env.example
    package.json
    README.md
    schema.sql
    seed.sql
    server.js

  README.md
  .gitignore
```

## Local Setup

### Prerequisites

- Node.js
- npm
- MySQL Server
- Git

### Backend Setup

```bash
cd backend
npm.cmd install
copy .env.example .env
```

Update `backend/.env` with your local MySQL credentials.

Start the backend:

```bash
npm.cmd run dev
```

Backend runs on:

```text
http://localhost:5000
```

### Frontend Setup

Open a second terminal:

```bash
cd frontend
npm.cmd install
npm.cmd run dev
```

Frontend runs on the Vite dev server, usually:

```text
http://localhost:5173
```

## Environment Variables

Create `backend/.env` from `backend/.env.example`.

```env
PORT=5000
LOG_LEVEL=info

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=traveloop
DB_PORT=3306

JWT_SECRET=traveloop_local_demo_secret_change_before_production
JWT_EXPIRES_IN=7d
```

Notes:

- `JWT_SECRET` must be at least 16 characters.
- Never commit `backend/.env`.
- Use `backend/.env.example` for shared setup documentation.

## Database Setup

The backend includes schema and seed files:

- `backend/schema.sql`
- `backend/seed.sql`

Recommended reset flow:

```bash
cd backend
npm.cmd run db:reset
```

This drops and recreates the local `traveloop` database, then applies schema and demo seed data.

To reload demo data without manually running SQL:

```bash
npm.cmd run db:reseed
```

Demo users:

```text
parshuram@traveloop.test / password123
sahil@traveloop.test / password123
```

## API Summary

All API responses follow a predictable shape.

Success:

```json
{
  "success": true,
  "message": "Message here",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Message here",
  "errors": []
}
```

### Auth

```text
POST   /api/auth/register
POST   /api/auth/login
```

### Cities and Activities

```text
GET    /api/cities
GET    /api/cities/:id
GET    /api/cities/:id/activities
GET    /api/activities/search
```

### Trips

```text
POST   /api/trips
GET    /api/trips
GET    /api/trips/:id
PUT    /api/trips/:id
DELETE /api/trips/:id
GET    /api/trips/:id/export
```

### Stops and Itinerary

```text
POST   /api/trips/:id/stops
GET    /api/trips/:id/stops
PUT    /api/trips/:id/stops/:stopId
DELETE /api/trips/:id/stops/:stopId
PUT    /api/trips/:id/stops/reorder
POST   /api/trips/:id/stops/:stopId/activities
GET    /api/trips/:id/itinerary
```

### Budget

```text
GET    /api/trips/:id/budget
POST   /api/trips/:id/budget-cap
GET    /api/trips/:id/budget-status
```

### Public Sharing

```text
POST   /api/trips/:id/share
DELETE /api/trips/:id/share
GET    /api/share/:token
POST   /api/share/:token/copy
```

## Project Status

### Complete

- Backend authentication
- Trips CRUD
- Stops and itinerary engine
- City and activity search
- Budget engine
- Public sharing
- Copy/fork public trips
- Export-ready itinerary JSON
- Backend response standardization
- Database reset/reseed workflow
- Frontend project setup

### Pending / In Progress

- Frontend screen integration with all backend APIs
- Final UI polish
- End-to-end demo testing

### Optional Future Polish

- PDF itinerary export
- Packing checklist APIs/UI
- Notes APIs/UI
- Activity removal/reordering
- Rate limiting
- Automated tests
- Deployment

## Demo Flow

Suggested judge demo path:

1. Start MySQL.
2. Reset and seed the backend database.
3. Start backend with `npm.cmd run dev`.
4. Start frontend with `npm.cmd run dev`.
5. Log in with a demo user.
6. View seeded trips.
7. Open an itinerary with multiple city stops.
8. Search cities and activities.
9. Review budget breakdown and budget cap status.
10. Enable public sharing for a trip.
11. Open the public share URL.
12. Copy/fork the shared trip into another user account.

## Team Ownership

- Parshuram: Backend, database schema, seed data, authentication, trips, itinerary, budget, search, sharing, backend documentation
- Sahil: Frontend screens, UI integration, user flows, visual polish, API consumption

## Git Workflow Notes

- Keep frontend work inside `frontend/`.
- Keep backend work inside `backend/`.
- Do not commit `.env` files.
- Commit `package-lock.json` when dependencies change.
- Keep commits small and focused.
- Pull latest changes before starting a new task.
- Avoid mixing frontend and backend changes in the same commit unless the task requires it.

## Troubleshooting

### `Route not found` at `localhost:5000`

The backend is running, but `/` is not an API route. Use:

```text
http://localhost:5000/api/cities
```

### Duplicate seed error

If you see a duplicate primary key error while running `seed.sql`, the database was already seeded.

Fix:

```bash
cd backend
npm.cmd run db:reset
```

### PowerShell blocks `npm`

Use:

```bash
npm.cmd run dev
```

instead of:

```bash
npm run dev
```

### JWT secret error

If backend startup says `JWT_SECRET must be at least 16 characters long`, update `backend/.env`:

```env
JWT_SECRET=traveloop_local_demo_secret_change_before_production
```

### MySQL connection issues

Check:

- MySQL Server is running
- `DB_USER` and `DB_PASSWORD` are correct
- `DB_NAME=traveloop`
- `DB_PORT=3306`

### Protected routes return `Authentication token is required`

Send the JWT from login:

```text
Authorization: Bearer <token>
```

## Closing

Traveloop is built as a practical, demo-ready hackathon project that shows a complete multi-city travel planning flow from login to itinerary building, budgeting, and public sharing.
