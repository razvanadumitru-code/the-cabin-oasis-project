# Cabin Oasis Monorepo

This repository hosts the entire Cabin Oasis platform:

- **the-cabin-oasis-be** – FastAPI backend powering data, bookings, payments, and emails
- **the-cabin-oasis-fe** – Public website built with React, Vite, and Tailwind CSS
- **the-cabin-oasis-admin** – Admin dashboard (React, Vite, Tailwind) for staff operations

```
the-cabin-oasis-project/
├── the-cabin-oasis-be/
├── the-cabin-oasis-fe/
├── the-cabin-oasis-admin/
└── database.sql
```

---

## 1. Tech Stack

| Layer    | Stack                                                                  |
|----------|------------------------------------------------------------------------|
| Backend  | FastAPI, SQLAlchemy, MySQL, Pydantic, Stripe, Mailtrap                 |
| Frontend | React 18, Vite, Tailwind CSS, Axios, React Router                      |
| Admin    | React 18, Vite, Tailwind CSS, Axios, React Router                      |
| Tooling  | Node.js 20+, npm 10+, Python 3.11+, MySQL 8+, virtualenv               |

---

## 2. Prerequisites

- MySQL 8+ running locally
- Python 3.11+ with virtualenv
- Node.js 20+ and npm 10+
- Stripe test keys (publishable + secret)
- Mailtrap SMTP credentials (or another SMTP provider)

---

## 3. Environment Variables

Environment keys are listed in `.env.example`. Make a copy for each app and fill in local values:

```
cp .env.example the-cabin-oasis-be/.env
cp .env.example the-cabin-oasis-fe/.env
cp .env.example the-cabin-oasis-admin/.env
```

Then edit each file to include the correct values (database, JWT, Stripe, Mailtrap, API base URLs, etc.). Keep `.env` files out of version control.

---

## 4. Backend Setup (`the-cabin-oasis-be`)

```bash
cd the-cabin-oasis-be
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

1. Create and fill `.env` as above.
2. Seed the database if needed:
   ```bash
   mysql -u root -p < ../database.sql
   ```
3. Start the API:
   ```bash
   uvicorn main:app --reload --port 3000
   ```
4. Docs available at `http://localhost:3000/docs`.

Key backend modules:
- `controllers/` – booking availability, payments, messages
- `routes/` – FastAPI routers for cabins, bookings, payments, messages, staff
- `main.py` – app setup, static images mount, `send_email` helper

---

## 5. Frontend Website Setup (`the-cabin-oasis-fe`)

```bash
cd the-cabin-oasis-fe
npm install
cp .env.example .env  # if available
npm run dev           # http://localhost:5173
```

Build for production with `npm run build` (outputs to `dist/`).

Highlights:
- Pages in `src/pages` (Home, Rooms, CabinDetails, About)
- Chatbot (`src/components/chatbot.jsx`) with booking helper, availability checks, booking lookup, lead capture
- Images loaded from backend `/images`

---

## 6. Admin Panel Setup (`the-cabin-oasis-admin`)

```bash
cd the-cabin-oasis-admin
npm install
npm run dev           # http://localhost:5174
```

Use staff credentials stored in the backend (seeded admin user) to log in. Build with `npm run build`.

Highlights:
- Cabin CRUD, bookings overview, maintenance, analytics
- Emails page reads `/api/messages` and lets staff reply via Mailtrap
- Auth handled via `src/contexts/AuthContext.jsx`

---

## 7. Running the Full Stack Locally

1. Ensure MySQL is running.
2. Start FastAPI backend on port 3000.
3. Start frontend (`npm run dev` in `the-cabin-oasis-fe`).
4. Start admin (`npm run dev` in `the-cabin-oasis-admin`).

Vite dev servers proxy `/api` to `http://localhost:3000/api`. Update `vite.config.js` if ports change. Confirm CORS settings in FastAPI to allow the dev ports.

---

## 8. Testing and Debugging

- Use FastAPI docs and server logs to test API endpoints.
- Verify chatbot flows and booking availability calls from the frontend.
- Confirm message logging and replies in the admin Emails page.
- Static images live under `the-cabin-oasis-be/images` and are served via `/images/...`.

---

## 9. Deployment Notes

Backend:
- Run FastAPI with `uvicorn`/`gunicorn` behind a reverse proxy
- Configure HTTPS, production DB, real Stripe keys, and SMTP provider

Frontend/Admin:
- `npm run build` and deploy static assets (e.g., Netlify, Vercel, S3 + CloudFront)
- Set `VITE_API_BASE` to the production API URL

---

## 10. Git and GitHub

1. From the repo root:
   ```bash
   git init
   echo ".venv/\nthe-cabin-oasis-*/node_modules/\n**/.env\n**/dist" > .gitignore
   git add .
   git commit -m "Initial commit"
   ```
2. Create a GitHub repository and copy its HTTPS URL.
3. Push the local repo:
   ```bash
   git remote add origin https://github.com/<user>/<repo>.git
   git branch -M main
   git push -u origin main
   ```

Do not commit virtual environments, node_modules, or `.env` files.

---

## 11. Maintenance Tips

- Follow existing styling patterns (Tailwind utilities, controller patterns).
- Add new API routes via `routes/` + corresponding controller + Pydantic models.
- Keep README and `.env.example` files up to date when adding new services.
