# Traveloop

Hackathon monorepo for Traveloop.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: Local MySQL

## Repository Structure

```text
traveloop/
  frontend/
  backend/
  README.md
  .gitignore
```

## Development Setup

This repository is intentionally split into separate frontend and backend apps.

- Keep React/Vite code inside `frontend/`.
- Keep Express API code inside `backend/`.
- Keep local secrets in `.env` files only.
- Commit `.env.example` files when environment variables are introduced.
- Do not commit `node_modules/`, build output, logs, or local editor files.

## Frontend

The frontend will be initialized in `frontend/`.

Expected future commands:

```bash
cd frontend
npm install
npm run dev
```

## Backend

The backend will be initialized in `backend/`.

Expected future commands:

```bash
cd backend
npm install
npm run dev
```

## Database

Use a local MySQL database for development.

Database connection details should live in `backend/.env` and must not be committed.

## Team Workflow

1. Pull the latest changes before starting work.
2. Work inside either `frontend/` or `backend/` when possible.
3. Keep commits small and focused.
4. Update this README when setup steps change.
