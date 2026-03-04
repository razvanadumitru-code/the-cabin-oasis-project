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











