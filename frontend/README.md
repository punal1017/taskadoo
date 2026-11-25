# Taskadoo frontend

Next.js App Router UI for the Taskadoo project and task management API.

## Run locally

1. Start the backend from `backend/` with `npm run dev`. It uses port `3000` by default and requires the backend MongoDB and JWT environment variables.
2. Start this app from `frontend/` with `npm run dev`. The frontend runs on `http://localhost:3001` to avoid the backend port.
3. Sign in with an existing account or register a member account.

The API client uses `http://localhost:3000/api` by default. To use another backend URL, set `NEXT_PUBLIC_API_BASE_URL` in `frontend/.env.local`, for example:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

The frontend follows the existing API contracts. Team management is admin-only, and task status options match the backend (`TODO`, `IN_PROGRESS`, `COMPLETED`).

## Checks

```bash
npm run lint
npm run build
```
