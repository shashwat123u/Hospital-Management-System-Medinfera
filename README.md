# MedInfera

MedInfera is a hospital operations application with a React frontend and a Node.js/Express REST API. The backend uses PostgreSQL through Prisma and provides JWT-based authentication, role-based access control, and Socket.IO support for realtime features.

> **Project status:** The frontend and backend have matching service/route families for the main application areas, and the frontend production build succeeds. Some individual frontend requests and authentication refresh behavior still need end-to-end alignment. See [Integration status](#integration-status) before treating every workflow as production-ready.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Repository layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Local development](#local-development)
- [Environment configuration](#environment-configuration)
- [API overview](#api-overview)
- [Authentication and responses](#authentication-and-responses)
- [Database commands](#database-commands)
- [Deployment notes](#deployment-notes)
- [Integration status](#integration-status)
- [Security notes](#security-notes)

## Features

The application is organized around hospital workflows:

- Authentication, user accounts, roles, and permissions
- Hospitals, doctors, doctor schedules, and dashboard summaries
- Patient records, vital signs, and medical history
- Appointment booking, availability, and status management
- Wards, beds, admissions, transfers, notes, and discharge workflows
- Medicines, batches, suppliers, purchase orders, and prescriptions
- Laboratory test catalogs, orders, and results
- Invoices, payments, payroll, and payouts
- Ambulance dispatch and location tracking
- Notifications, audit logging, scheduled jobs, and realtime socket events

The backend applies hospital scoping and role checks in protected routes. Access to specific operations depends on the authenticated user's role.

## Technology

| Area | Technology |
| --- | --- |
| Frontend | React, Vite, React Router |
| HTTP and data | Axios, TanStack Query |
| Backend | Node.js, Express |
| Database and ORM | PostgreSQL, Prisma |
| Authentication | JWT access and refresh tokens, bcryptjs |
| Realtime | Socket.IO and socket.io-client |
| Validation | Joi on the backend; Zod and React Hook Form in the frontend |
| Logging and security | Winston, Helmet, rate limiting |

## Repository layout

```text
Integration/
├── README.md
├── medinfera-backend/
│   └── medinfera-backend/
│       ├── prisma/                 # Prisma schema and migrations
│       ├── src/
│       │   ├── config/             # Database, app config, logging, sockets
│       │   ├── jobs/               # Scheduled jobs
│       │   ├── middleware/         # Auth, RBAC, validation, error handling
│       │   ├── modules/            # Domain routes, controllers, and services
│       │   ├── utils/
│       │   ├── app.js
│       │   └── server.js
│       ├── .env.example
│       ├── .env                   # Local-only; do not commit
│       └── package.json
└── medinfera-frontend/
    └── medinfera-frontend/
        ├── public/
        ├── src/
        │   ├── components/
        │   ├── contexts/
        │   ├── hooks/
        │   ├── pages/
        │   └── services/           # Axios client and API service modules
        ├── .env.local             # Local-only; do not commit
        └── package.json
```

## Prerequisites

- Node.js 22 LTS is recommended. The backend declares Node.js 18 or newer; the current Vite toolchain requires a recent Node release.
- npm
- A PostgreSQL database. A hosted PostgreSQL provider or a local PostgreSQL instance can be used.
- Git, if you are cloning the repository.

## Local development

Open two terminals from the repository root (the directory containing this README). Start the backend first, then start the frontend.

### 1. Configure the backend

In PowerShell:

```powershell
cd .\medinfera-backend\medinfera-backend
Copy-Item .env.example .env
```

Edit `medinfera-backend/medinfera-backend/.env`. At minimum, set a valid `DATABASE_URL`, strong unique JWT secrets, and a strong `SUPER_ADMIN_PASSWORD`. Do not use the example values for a real deployment.

Install dependencies and prepare the database:

```powershell
npm install
npx prisma generate
npx prisma migrate deploy
```

Start the API in development mode:

```powershell
npm run dev
```

The API listens on `http://localhost:5000` by default. A successful startup logs database connection and server information. Check the health endpoint at `http://localhost:5000/health`.

### 2. Configure the frontend

In a second PowerShell terminal from the repository root:

```powershell
cd .\medinfera-frontend\medinfera-frontend
```

Create a local-only `.env.local` file with the URLs of the backend. Vite only exposes variables prefixed with `VITE_` to browser code:

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

Install and run the frontend:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite (the project config uses port `3000`). Keep both development servers running while using the app. If port `5000` is already occupied by another backend instance, stop that instance before starting another one, or configure a different `PORT` and update both frontend URLs to match.

### Other useful frontend commands

```powershell
npm run build
npm run preview
```

`npm run build` creates the production frontend in `dist/`. `npm run preview` serves that build locally for a smoke check.

## Environment configuration

### Backend

The backend reads its configuration from `medinfera-backend/medinfera-backend/.env`. The complete set of supported example settings is in `.env.example`.

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Runtime mode, commonly `development` or `production` |
| `PORT` | HTTP server port; defaults to `5000` |
| `API_VERSION` | API prefix version; defaults to `v1` |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma |
| `JWT_ACCESS_SECRET` | Secret used to sign access tokens |
| `JWT_REFRESH_SECRET` | Separate secret used to sign refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | Access-token lifetime; example is `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh-token lifetime; example is `7d` |
| `CORS_ORIGINS` | Intended comma-separated HTTP origin configuration |
| `SOCKET_CORS_ORIGINS` | Comma-separated origins allowed for Socket.IO |
| `RATE_LIMIT_WINDOW_MS` | Rate-limit window in milliseconds |
| `RATE_LIMIT_MAX` | Maximum requests in the general rate-limit window |
| `BCRYPT_ROUNDS` | Password-hashing work factor |
| `LOG_LEVEL`, `LOG_DIR` | Logging level and log directory |
| `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD` | Initial super-admin account settings |

The server creates the initial super-admin account if one does not already exist. Set the admin email and password before the first run and protect the credentials. Changing these variables later does not automatically change an account that has already been created.

### Frontend

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Backend REST base URL, including `/api/v1` |
| `VITE_SOCKET_URL` | Backend origin used for Socket.IO connections |

Do not put secrets in frontend environment variables; values prefixed with `VITE_` are bundled into client-side code.

## API overview

The default local API base is:

```text
http://localhost:5000/api/v1
```

The backend currently mounts these route families:

| Prefix | Area |
| --- | --- |
| `/auth` | Login, logout, refresh tokens, current user, password changes |
| `/hospitals` | Hospital administration |
| `/users` | User administration |
| `/doctors` | Doctor profiles, schedules, and related operations |
| `/patients` | Patient records and vitals |
| `/appointments` | Appointments, availability, status, and rescheduling |
| `/beds` | Wards, beds, and occupancy statistics |
| `/ipd` | In-patient admissions and care workflows |
| `/medicines` | Medicine inventory, suppliers, and purchase orders |
| `/prescriptions` | Prescription creation and dispensing |
| `/lab` | Test catalog and laboratory orders/results |
| `/invoices` | Invoices, payments, and revenue statistics |
| `/ambulance` | Ambulances, dispatch, and location endpoints |
| `/payouts` | Payroll and payouts |
| `/notifications` | User notifications |
| `/dashboards` | Dashboard summaries |

For example, the health endpoint is intentionally outside the versioned API prefix at `/health`.

## Authentication and responses

Most domain routes require an access token sent as a Bearer token:

```http
Authorization: Bearer <access-token>
```

Successful API responses use an envelope similar to:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Paginated responses may include a top-level `pagination` object. Error responses include `success: false` and a `message`; validation errors may also include an `errors` field. Clients should read response payloads from `response.data.data` for standard success responses.

The frontend keeps the access token in memory and stores the refresh token in browser local storage. This is a security-sensitive authentication design; review the implementation and token lifecycle before production use.

## Database commands

Run these commands from `medinfera-backend/medinfera-backend`:

| Command | Purpose |
| --- | --- |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:migrate` | Create/apply a development migration |
| `npx prisma migrate deploy` | Apply committed migrations in deployment or local setup |
| `npm run db:push` | Push the Prisma schema directly to the database; generally for prototyping |
| `npm run db:studio` | Open Prisma Studio |
| `npm run lint` | Run ESLint against `src/` |

For shared or production databases, prefer reviewed migrations over `db:push`.

## Deployment notes

The backend contains a Render blueprint at `medinfera-backend/medinfera-backend/render.yaml`. Configure the backend service root directory as `medinfera-backend/medinfera-backend` when deploying this combined repository, and supply secrets such as the database URL and JWT keys through the hosting provider's environment settings. The blueprint runs Prisma generation and committed migrations before starting the Node server.

Deploy the frontend as a static Vite application with its project root set to `medinfera-frontend/medinfera-frontend`. Configure `VITE_API_BASE_URL` and `VITE_SOCKET_URL` to the deployed backend URLs before building. The backend's HTTP and Socket.IO CORS policies must allow the deployed frontend origin; verify the current middleware configuration for the target hosting setup.

Never commit `.env`, `.env.local`, production environment files, private keys, database credentials, or real user data.

## Integration status

The project has corresponding frontend services and backend route modules for the major feature families. A successful frontend build verifies compilation, not that every API request succeeds against live data. The following known inconsistencies need to be resolved and tested:

- **Session restoration and refresh:** The frontend attempts `/auth/me` during session restoration before establishing a fresh access token. The refresh interceptor also needs to unwrap the backend's standard `data` response envelope before storing renewed tokens.
- **Appointments:** The frontend service exposes generic update/delete calls, while the backend currently exposes status updates and rescheduling rather than matching generic routes.
- **Invoices and payments:** Some frontend update/delete/payment paths differ from the backend's invoice and payment routes.
- **Payouts:** Some frontend create/update/delete paths differ from the backend's payroll and payout routes, including the backend's `mark-paid` action.
- **Realtime events:** Socket.IO is configured for authenticated connections; verify that frontend event names and backend emitted/listened event names agree for each realtime workflow.

Treat these as known integration work, not as proof that no other mismatches exist. Before release, test login, refresh, logout, role-specific access, and each form/list workflow against the configured database and deployed CORS policy.

## Security notes

- Replace every example secret and initial administrator password before exposing a deployment.
- Use HTTPS in production and restrict database network access.
- Use unique, high-entropy access and refresh JWT secrets; never reuse them across environments.
- Restrict CORS to the actual frontend origin(s) in production and verify credential behavior for both HTTP and Socket.IO.
- Avoid using real patient information in development, screenshots, test fixtures, or public issue reports.
- Review authorization rules and audit coverage for every new route before release.
=======
# Hospital-Management-System-Medinfera
>>>>>>> 7b7b5e1b1f69c97514a9958640a8e24f874b395f
