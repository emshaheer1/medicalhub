# Medical Training Hub — Backend & Admin Dashboard

Node.js/Express API with MongoDB storage and a professional admin dashboard for viewing registration form submissions from the IONOS-hosted frontend.

## Features

- **POST `/api/registration`** — Saves course registration form submissions (matches IONOS frontend)
- **POST `/api/storeHugs`** — Saves Phlebotomy enrollment agreement submissions
- **Admin Dashboard** — Login-protected UI at `/login` and `/dashboard`
- **MongoDB** — All entries stored and searchable
- **JWT Authentication** — Secure admin access

## Quick Start (Local)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Random secret for JWT tokens |
| `ADMIN_EMAIL` | Dashboard login email |
| `ADMIN_PASSWORD` | Dashboard login password |
| `CLIENT_ORIGIN` | Comma-separated IONOS domains for CORS |

### 3. Create admin user

```bash
npm run seed-admin
```

### 4. Start the server

```bash
npm run dev
```

- Dashboard login: http://localhost:5000/login
- Dashboard: http://localhost:5000/dashboard
- Health check: http://localhost:5000/health

## Deploy to Render

1. Push this repo to GitHub
2. Create a **Web Service** on [Render](https://render.com)
3. Connect your repo and set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add environment variables:
   - `MONGODB_URI` — your MongoDB Atlas URI
   - `JWT_SECRET` — a long random string
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — admin credentials
   - `CLIENT_ORIGIN` — `https://medicaltraininghub.com,https://www.medicaltraininghub.com`
5. After first deploy, open the Render shell and run: `npm run seed-admin`

Your API will be at `https://your-app.onrender.com`

## Connect IONOS Frontend

Update the API URLs in your frontend build to point to your Render backend:

| Current URL | Change to |
|---|---|
| `https://server.medicaltraininghub.com/api/registration` | `https://your-app.onrender.com/api/registration` |
| `http://backend.medicaltraininghub.com/api/storeHugs` | `https://your-app.onrender.com/api/storeHugs` |

Rebuild and redeploy the frontend to IONOS after updating.

## API Reference

### Public Endpoints

| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/api/registration` | Registration form JSON | `{ success: true, id }` |
| POST | `/api/storeHugs` | Agreement form JSON | `{ status: true, id }` |

### Admin Endpoints (Bearer token required)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/admin/login` | `{ email, password }` → `{ token }` |
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/registrations` | List registrations (paginated) |
| GET | `/api/registrations/:id` | Single registration detail |
| DELETE | `/api/registrations/:id` | Delete a registration |
| GET | `/api/agreements` | List phlebotomy agreements |
| GET | `/api/agreements/:id` | Single agreement detail |
| DELETE | `/api/agreements/:id` | Delete an agreement |

## Registration Form Fields

The dashboard displays all fields submitted by the frontend registration form:

- Personal info: name, DOB, phone, address, city, state, zip, email
- Citizenship and background checks
- Course selection (Phlebotomy, CNA, CPR, EKG)
- Health and ability questions
- Employment and support questions
- Referral information

## Project Structure

```
├── server.js              # Express app entry point
├── models/                # Mongoose schemas
├── routes/                # API route handlers
├── middleware/             # JWT auth middleware
├── public/                # Dashboard static files
│   ├── login.html
│   ├── dashboard.html
│   ├── css/styles.css
│   ├── js/dashboard.js
│   └── assets/logo.png
├── scripts/seedAdmin.js   # Create initial admin user
└── render.yaml            # Render deployment config
```
