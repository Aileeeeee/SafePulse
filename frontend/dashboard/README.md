# SafePulse

SafePulse — a Vite + React dashboard with an Express API for community incident reporting, live feed, searchable incidents, and basic admin tools.

## Quick start

Prerequisites: Node.js 18+, npm

1. Install dependencies

```bash
npm install
npm --prefix server install
```

2. Run in development (frontend + API in separate terminals)

```bash
npm run dev                    # frontend (Vite)
npm --prefix server run dev    # API (nodemon)
```

3. Build and serve (production-style)

```bash
npm run build
npm run serve:all
```

The server serves the built app and API on the same port (default 4000).

## API endpoints (examples)

- `GET /api/incidents/incidents/` — list incidents
- `POST /api/incidents/incidents/submit/` — submit incident
- `POST /api/incidents/incidents/:id/acknowledge/` — acknowledge incident
- Auth stubs under `/api/auth/*`

See `src/api/endpoints.js` for the endpoint constants used by the frontend.

## Development notes

- Frontend entry: `src/main.jsx`
- Sidebar, Header, LiveIncidentFeed components are under `src/components`
- Mock data: `src/data/incidentData.js`

## Contributing

1. Create a branch using a descriptive name (example: `safe-pulse/add-search-api`).
2. Commit changes and push to GitHub.
3. Open a Pull Request against `main` and request review.

## Deploy

- Recommended: Render, Vercel, or Railway. For Render, set build command to `npm run build` and start command to `node server/index.js`.

## License

Add your license here.

