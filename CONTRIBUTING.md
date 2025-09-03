# Contributing to Budget App

Thank you for taking the time to contribute! This guide summarizes the project structure, how to run it locally, code style expectations, and common workflows.

## Project structure

```
budget-app/
  budget-app-backend/    # Express + Mongoose API (TypeScript)
  budget-app-frontend/   # React + Vite SPA (TypeScript, Tailwind)
```

## Prerequisites

- Node.js LTS (v18+ recommended)
- MongoDB running locally (default: `mongodb://localhost:27017/budget-app`)

## Setup and run (local)

1. Backend

```bash
cd budget-app-backend
npm install
# Start dev server with auto-reload
npm run start
```

API base URL: `http://localhost:5000/api`

2. Frontend

```bash
cd ../budget-app-frontend
npm install
# Start Vite dev server
npm run dev
```

App URL: `http://localhost:5173` (or as printed by Vite)

Note: CORS is configured in the backend for `http://localhost:3005` in `server.ts`. If your Vite dev server uses a different port, update CORS origin accordingly.

## Environment variables

Backend reads vars from `.env` (see `src/config/env.ts`):

- `MONGODB_URI` (required in prod)
- `JWT_SECRET` (required in prod)
- `PORT` (default 5000)
- `NODE_ENV` (default development)

When not provided locally, safe defaults apply and a warning is logged.

## Code style & conventions

- TypeScript everywhere; avoid `any` and unsafe casts.
- Prefer early returns and shallow nesting; handle errors explicitly.
- Keep functions small and focused; extract helpers for complex logic.
- Comments: high-signal only. File-level headers explain purpose; function-level JSDoc for non-trivial logic. Avoid obvious comments.
- Frontend UI components follow the existing Tailwind and shadcn/ui patterns.

Linting:

```bash
# Frontend
cd budget-app-frontend
npm run lint
```

## Common workflows

### Adding a new API endpoint

1. Define route in `budget-app-backend/src/routes/*Routes.ts`.
2. Implement logic in a controller under `src/controllers`.
3. Add/extend a Mongoose model if data shape changes.
4. Update `budget-app-frontend/src/services/api.ts` with a typed helper.
5. Consume from React components or context.

### Updating profile fields

1. Backend: extend `User` model and `profileController.updateProfile` to accept fields.
2. Frontend: update `AuthContext` `User` type, `Profile.tsx` form state, and `userAPI.updateProfile` payload typing.

### Working with notifications

- Backend emits notifications on entry CRUD.
- Frontend fetches via `notificationsAPI` and renders in `Header` and dropdown.

## Testing

Backend tests (Jest) scaffold exists; extend under `budget-app-backend` and run:

```bash
cd budget-app-backend
npm run test
```

## Commit & PR guidelines

- Small, focused commits with descriptive messages (imperative mood).
- Keep edits scoped; avoid unrelated reformatting.
- Include before/after notes in PR descriptions where helpful.

## Troubleshooting

- CORS errors: confirm `server.ts` CORS origin matches the Vite port.
- Auth issues: ensure token is present in storage; the frontend context auto-refreshes profile on startup.
- Mongo connection: verify `MONGODB_URI` and that MongoDB is running locally.

---

Thanks for contributing!
