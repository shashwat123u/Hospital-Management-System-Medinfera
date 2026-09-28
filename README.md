# MedInfera Hospital Management System — Detailed Project Explanation

## 1. What is MedInfera?

MedInfera is a full-stack Hospital Management System (HMS) designed to digitize and manage major hospital operations through a centralized application.

The system consists of two major parts:

1. Frontend — React + Vite application used by hospital users through a web browser.
2. Backend — Node.js + Express REST API responsible for business logic, authentication, authorization, database operations, and realtime communication.

The backend uses PostgreSQL as the database and Prisma ORM for communication between the application and database.

Overall architecture:

User
  ↓
React Frontend
  ↓
Axios / Socket.IO
  ↓
Node.js + Express Backend
  ↓
Authentication + RBAC + Business Logic
  ↓
Prisma ORM
  ↓
PostgreSQL Database


## 2. Main Objective of the Project

The main objective of MedInfera is to provide a centralized platform through which different hospital users can perform their respective operations.

The system supports workflows such as:

- Hospital administration
- User management
- Doctor management
- Patient management
- Appointment management
- Ward and bed management
- IPD management
- Medicine and pharmacy management
- Prescription management
- Laboratory management
- Invoice and payment management
- Ambulance management
- Payroll and payouts
- Notifications
- Dashboards
- Realtime communication

Instead of maintaining separate systems for different departments, MedInfera brings these workflows together into one application.


## 3. High-Level Architecture

MedInfera follows a client-server architecture.

                   ┌──────────────────────┐
                   │       Users          │
                   │ Admin / Doctor /     │
                   │ Patient / Staff etc. │
                   └──────────┬───────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │   React Frontend     │
                   │       + Vite         │
                   └──────────┬───────────┘
                              │
                         HTTP / REST
                              │
                              ▼
                   ┌──────────────────────┐
                   │ Node.js + Express    │
                   │      Backend         │
                   └──────────┬───────────┘
                              │
              ┌───────────────┼────────────────┐
              │               │                │
              ▼               ▼                ▼
        Authentication      Business       Socket.IO
          + RBAC             Logic          Realtime
              │               │
              └───────────────┤
                              ▼
                     ┌─────────────────┐
                     │ Prisma ORM      │
                     └────────┬────────┘
                              ▼
                     ┌─────────────────┐
                     │ PostgreSQL      │
                     └─────────────────┘


## 4. Frontend

The frontend is built using:

- React
- Vite
- React Router
- Axios
- TanStack Query
- React Hook Form
- Zod
- Socket.IO Client
- Tailwind CSS

The frontend is responsible for:

- User interface
- Navigation
- Forms
- Tables
- Dashboards
- API communication
- Authentication state
- Displaying backend responses
- Realtime updates

The frontend does not directly communicate with PostgreSQL.

Instead, the communication happens through the backend:

React
  ↓
Axios
  ↓
Express API
  ↓
Prisma
  ↓
PostgreSQL


## 5. Backend

The backend is developed using:

- Node.js
- Express
- Prisma
- PostgreSQL
- JWT
- bcryptjs
- Joi
- Socket.IO
- Winston
- Helmet
- Rate Limiting

The backend is responsible for:

- Authentication
- Authorization
- Business logic
- API handling
- Validation
- Database operations
- Realtime communication
- Error handling
- Security middleware

For example, when a user creates an appointment:

Frontend Form
     ↓
POST /appointments
     ↓
Express Route
     ↓
Authentication Middleware
     ↓
Role/Permission Check
     ↓
Validation
     ↓
Controller
     ↓
Service / Business Logic
     ↓
Prisma
     ↓
PostgreSQL
     ↓
Response
     ↓
Frontend


## 6. Authentication System

MedInfera uses JWT-based authentication.

There are two main types of tokens:

- Access Token
- Refresh Token

The access token is used to access protected APIs.

The request generally contains:

Authorization: Bearer <access-token>

The backend verifies the token before allowing access to protected resources.

Login flow:

User enters credentials
        ↓
Frontend sends login request
        ↓
Backend validates credentials
        ↓
Backend generates tokens
        ↓
Frontend receives authentication response
        ↓
Access token is used for protected API requests


## 7. Refresh Token Mechanism

The application also uses refresh tokens.

General flow:

User Login
    ↓
Backend validates credentials
    ↓
Access Token + Refresh Token
    ↓
Frontend stores authentication information
    ↓
Access Token used for API requests
    ↓
Access Token expires
    ↓
Refresh Token used to request a new access token
    ↓
New Access Token
    ↓
Continue authenticated session

The current project documentation notes that the session restoration and refresh behavior still needs end-to-end verification.


## 8. Role-Based Access Control

MedInfera uses RBAC, which means Role-Based Access Control.

The basic concept is:

User
  ↓
Role
  ↓
Permissions
  ↓
Allowed Operations

Different hospital users have different responsibilities.

Examples include:

- Super Admin
- Admin
- Doctor
- Patient
- Pharmacist
- Staff

For example:

Admin
 ├── Manage users
 ├── Manage doctors
 ├── Manage patients
 └── Manage hospital operations

Doctor
 ├── Manage appointments
 ├── View relevant patient information
 └── Perform doctor-related workflows

Patient
 ├── Access patient-related information
 └── Access relevant patient workflows

Pharmacist
 └── Manage medicine and prescription workflows

The actual permissions are enforced by backend authorization rules.


## 9. Hospital Management

The /hospitals API family handles hospital administration.

Hospital-related information provides the foundation for hospital-specific operations.

Protected operations can be associated with the relevant hospital context.


## 10. User Management

The /users API family handles user-related operations.

Administrators can manage users according to their permissions.

General flow:

Admin
  ↓
User Management UI
  ↓
Frontend API Service
  ↓
/users API
  ↓
Authorization
  ↓
Database
  ↓
Response
  ↓
Frontend


## 11. Doctor Management

The /doctors module manages doctor-related information.

It includes:

- Doctor profiles
- Doctor schedules
- Related doctor operations

Doctor schedule can be represented as:

Doctor
  ↓
Schedule
  ├── Day
  ├── Time
  └── Availability

This information can be used by appointment workflows.


## 12. Patient Management

The /patients module manages patient information.

It includes:

- Patient records
- Vital signs
- Medical history-related information

Basic structure:

Patient
  ↓
Patient Record
  ↓
Medical Information
  ├── Vitals
  └── Medical History

Access to patient information is controlled through authentication and authorization mechanisms.


## 13. Appointment Management

The /appointments module manages appointment workflows.

It supports:

- Appointment booking
- Availability
- Appointment status
- Rescheduling

Typical workflow:

Patient
   ↓
Select Doctor
   ↓
Check Availability
   ↓
Select Time Slot
   ↓
Create Appointment
   ↓
Appointment Stored
   ↓
Doctor/Patient Can View Status

Appointments can move through different statuses according to the backend workflow.


## 14. Ward and Bed Management

The /beds module manages:

- Wards
- Beds
- Bed occupancy statistics

Structure:

Hospital
   ↓
Ward
   ↓
Beds
   ├── Available
   ├── Occupied
   └── Other configured states

This module is particularly important for inpatient management.


## 15. IPD Management

IPD means In-Patient Department.

The /ipd module handles inpatient workflows such as:

- Admissions
- Patient care
- Bed transfers
- Notes
- Discharge

Typical flow:

Patient
   ↓
Admission
   ↓
Bed Assignment
   ↓
Treatment / Care
   ↓
Possible Bed Transfer
   ↓
Discharge

The system supports bed-transfer operations through the backend IPD workflow.


## 16. Medicine Management

The /medicines module manages medicine-related operations.

It covers:

- Medicine inventory
- Medicine batches
- Suppliers
- Purchase orders

Basic inventory relationship:

Supplier
   ↓
Purchase Order
   ↓
Medicine
   ↓
Batch
   ↓
Inventory

This allows hospital staff to manage medicine availability.


## 17. Prescription Management

The /prescriptions module handles prescriptions.

Typical workflow:

Doctor
  ↓
Patient
  ↓
Prescription
  ↓
Medicines
  ↓
Pharmacy
  ↓
Dispensing

This connects the clinical workflow with pharmacy operations.


## 18. Laboratory Management

The /lab module manages laboratory workflows.

It includes:

- Laboratory test catalog
- Laboratory orders
- Laboratory results

Typical flow:

Doctor / Authorized User
        ↓
Request Lab Test
        ↓
Lab Order
        ↓
Laboratory Processing
        ↓
Result
        ↓
Result Available in System


## 19. Invoice and Payment Management

The /invoices module manages financial workflows related to:

- Invoices
- Payments
- Revenue statistics

Typical billing flow:

Hospital Services
       ↓
Invoice
       ↓
Payment
       ↓
Financial Record
       ↓
Revenue Statistics
       ↓
Dashboard


## 20. Ambulance Management

The /ambulance module handles:

- Ambulances
- Dispatch
- Location-related endpoints

Typical workflow:

Emergency Request
       ↓
Ambulance Selection
       ↓
Dispatch
       ↓
Location Tracking
       ↓
Hospital Arrival

Realtime communication can support location and event updates where configured.


## 21. Payroll and Payouts

The /payouts module handles payroll and payout-related operations.

It includes workflows related to:

- Payroll
- Payouts
- Payment status

The backend also includes a mark-paid workflow.

Some frontend payout operations still require integration alignment with the backend routes.


## 22. Notifications

The /notifications module manages user notifications.

Notifications can inform users about relevant system events.

Example:

Appointment Updated
       ↓
Backend Event
       ↓
Notification
       ↓
User Dashboard

The application also supports realtime communication using Socket.IO.


## 23. Dashboard System

The /dashboards module provides dashboard summaries.

Dashboards allow users to see relevant information without manually opening every module.

General flow:

Database
   ↓
Dashboard APIs
   ↓
React Dashboard
   ↓
Cards / Tables / Statistics

Dashboard information can vary depending on the authenticated user's role.


## 24. REST API Architecture

The default local API base URL is:

http://localhost:5000/api/v1

The backend contains the following major route families:

/auth              → Authentication
/hospitals         → Hospital administration
/users             → User administration
/doctors           → Doctor management
/patients          → Patient management
/appointments      → Appointment management
/beds              → Wards and beds
/ipd               → Inpatient workflows
/medicines         → Medicine inventory
/prescriptions     → Prescriptions
/lab               → Laboratory
/invoices          → Billing and payments
/ambulance         → Ambulance management
/payouts           → Payroll and payouts
/notifications     → Notifications
/dashboards        → Dashboard summaries

The health endpoint is outside the versioned API:

http://localhost:5000/health


## 25. API Request Flow

For example, suppose a doctor creates an appointment.

1. Doctor opens the appointment page.
2. React displays the appointment form.
3. Doctor enters the required information.
4. Axios sends the API request.
5. Express receives the request.
6. Authentication middleware checks the JWT.
7. Authorization checks the user's role/permissions.
8. Validation checks the request data.
9. Controller processes the request.
10. Service performs the business logic.
11. Prisma communicates with PostgreSQL.
12. Database stores the appointment.
13. Backend sends a response.
14. Axios receives the response.
15. React updates the UI.

Complete flow:

Doctor
  ↓
React Appointment Form
  ↓
Axios
  ↓
Express API
  ↓
JWT Authentication
  ↓
RBAC Authorization
  ↓
Validation
  ↓
Controller
  ↓
Service
  ↓
Prisma
  ↓
PostgreSQL
  ↓
Response
  ↓
React UI


## 26. API Response Structure

Successful API responses follow a standard structure:

{
  "success": true,
  "message": "Operation successful",
  "data": {}
}

Example:

{
  "success": true,
  "message": "Patient created successfully",
  "data": {
    "id": "123",
    "name": "Example Patient"
  }
}

Error response:

{
  "success": false,
  "message": "Something went wrong"
}

Validation errors may also contain an "errors" field.

For standard successful responses, the frontend reads the main payload from:

response.data.data


## 27. Prisma ORM

Prisma is used as the ORM between the Node.js backend and PostgreSQL.

Architecture:

Express
   ↓
Controller
   ↓
Service
   ↓
Prisma Client
   ↓
PostgreSQL

Prisma provides:

- Database queries
- Database schema management
- Migrations
- Prisma Client
- Prisma Studio

Example concept:

Application
      ↓
prisma.patient.findMany()
      ↓
PostgreSQL
      ↓
Patient Records


## 28. PostgreSQL Database

PostgreSQL is the primary relational database.

It stores persistent information such as:

- Users
- Hospitals
- Doctors
- Patients
- Appointments
- Wards
- Beds
- IPD records
- Medicines
- Prescriptions
- Laboratory records
- Invoices
- Payments
- Notifications

The database schema is managed through Prisma.


## 29. Validation

The project uses validation on both frontend and backend.

Backend:
- Joi

Frontend:
- Zod
- React Hook Form

Validation flow:

Frontend Form
      ↓
React Hook Form + Zod
      ↓
API Request
      ↓
Backend
      ↓
Joi Validation
      ↓
Business Logic
      ↓
Database

This helps prevent invalid data from entering the system.


## 30. Security Architecture

The project implements several security mechanisms.

### JWT Authentication

Protects authenticated APIs.

### Role-Based Access Control

Restricts operations based on user roles.

### bcryptjs

Used for password hashing.

### Helmet

Provides HTTP security-related headers.

### Rate Limiting

Helps limit excessive API requests.

### CORS

Controls which frontend origins are allowed to communicate with the backend.

### Environment Variables

Sensitive configuration such as database URLs and JWT secrets are stored outside source code.


## 31. Realtime Communication

The project uses:

- Socket.IO on the backend
- socket.io-client on the frontend

REST APIs are used for normal request/response operations.

Socket.IO is used where realtime communication is required.

Basic flow:

Backend
   │
   │ Socket.IO Event
   ▼
Connected Frontend
   │
   ▼
React UI Update

The realtime event names between frontend and backend should be tested for each realtime workflow.


## 32. Environment Configuration

Backend environment variables include:

NODE_ENV
PORT
API_VERSION
DATABASE_URL
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
JWT_ACCESS_EXPIRES_IN
JWT_REFRESH_EXPIRES_IN
CORS_ORIGINS
SOCKET_CORS_ORIGINS
RATE_LIMIT_WINDOW_MS
RATE_LIMIT_MAX
BCRYPT_ROUNDS
LOG_LEVEL
LOG_DIR
SUPER_ADMIN_EMAIL
SUPER_ADMIN_PASSWORD

Frontend variables:

VITE_API_BASE_URL
VITE_SOCKET_URL

Important:

Never put passwords, JWT secrets, database credentials, or other sensitive information into frontend VITE_ variables.

VITE_ variables are exposed to browser code.


## 33. Local Development

### Backend Setup

From the repository root:

cd .\medinfera-backend\medinfera-backend

Copy the example environment file:

Copy-Item .env.example .env

Install dependencies:

npm install

Generate Prisma Client:

npx prisma generate

Apply database migrations:

npx prisma migrate deploy

Start backend:

npm run dev

Backend runs by default at:

http://localhost:5000

Health endpoint:

http://localhost:5000/health


### Frontend Setup

Open another terminal.

From the repository root:

cd .\medinfera-frontend\medinfera-frontend

Create .env.local with:

VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000

Install dependencies:

npm install

Start frontend:

npm run dev

The frontend project uses port 3000.


## 34. Frontend Production Build

To create a production build:

npm run build

This creates:

dist/

To test the production build locally:

npm run preview

Important:

A successful frontend build only proves that the application compiles.

It does NOT prove that every API request, authentication flow, database operation, or realtime workflow works correctly.


## 35. Deployment Architecture

A possible deployment architecture is:

                  Internet
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
       Vercel                 Render
      Frontend                Backend
          │                     │
          │                     ▼
          │                 PostgreSQL
          │
          └────── REST API ─────┘

Frontend:

- Deploy React/Vite application on Vercel.
- Configure VITE_API_BASE_URL.
- Configure VITE_SOCKET_URL.

Backend:

- Deploy Node.js/Express application.
- Configure PostgreSQL connection.
- Configure JWT secrets.
- Configure CORS.
- Configure Socket.IO CORS.
- Apply Prisma migrations.

The deployed backend must allow the deployed frontend origin through CORS.


## 36. Current Integration Status

The project currently has corresponding frontend services and backend route modules for the major application areas.

However, some workflows still require end-to-end testing and alignment.

### Authentication

The frontend attempts /auth/me during session restoration before establishing a fresh access token.

The refresh interceptor also needs to correctly unwrap the backend's standard response envelope before storing renewed tokens.

### Appointments

Some frontend generic update/delete operations differ from the backend's currently exposed status and rescheduling operations.

### Invoices and Payments

Some frontend invoice/payment paths differ from the backend routes.

### Payouts

Some frontend create/update/delete paths differ from the backend payroll and payout routes.

### Realtime Events

Socket.IO event names between frontend and backend need to be verified for each realtime workflow.

These are integration tasks that should be resolved and tested before treating every workflow as production-ready.


## 37. How to Test Frontend and Backend Integration

The correct way to verify integration is to test complete workflows.

### Login Test

Login Page
   ↓
Enter email/password
   ↓
POST /auth/login
   ↓
Backend validates credentials
   ↓
JWT generated
   ↓
Frontend receives response
   ↓
Dashboard opens


### Patient Test

Create Patient
   ↓
Frontend sends POST request
   ↓
Backend validates request
   ↓
Prisma creates patient
   ↓
PostgreSQL stores patient
   ↓
Backend returns response
   ↓
Frontend displays patient


### Appointment Test

Login
   ↓
Open Appointment Page
   ↓
Select Doctor
   ↓
Check Availability
   ↓
Select Time Slot
   ↓
Create Appointment
   ↓
Backend stores appointment
   ↓
Verify database
   ↓
Verify appointment appears in frontend


### Billing Test

Create Invoice
   ↓
Backend stores invoice
   ↓
Record Payment
   ↓
Database updated
   ↓
Revenue Statistics Updated
   ↓
Dashboard Updated


## 38. Database Workflow

The database architecture follows:

Prisma Schema
      ↓
Migration
      ↓
PostgreSQL
      ↓
Prisma Client
      ↓
Backend Services
      ↓
REST API
      ↓
Frontend

Useful commands:

npm run db:generate

npm run db:migrate

npx prisma migrate deploy

npm run db:push

npm run db:studio

npm run lint

For production and shared databases, reviewed migrations should generally be preferred over db:push.


## 39. Security Before Production

Before production deployment:

1. Replace all example JWT secrets.
2. Use a strong administrator password.
3. Never commit .env files.
4. Never commit .env.local.
5. Use HTTPS.
6. Restrict CORS to the actual frontend domain.
7. Protect database credentials.
8. Do not use real patient information in development.
9. Verify RBAC for every protected operation.
10. Verify audit logging where required.
11. Verify authentication and refresh-token behavior.
12. Test Socket.IO authentication and CORS.
13. Test all major API workflows against the production database.


## 40. Complete End-to-End Project Flow

The entire MedInfera system can be understood using the following flow:

                         USER
                           │
                           ▼
                  React Frontend
                           │
                     React Router
                           │
                           ▼
                  Axios / Socket.IO
                           │
                           ▼
                 Node.js + Express
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
      Authentication              Authorization
           JWT                          RBAC
             │                           │
             └─────────────┬─────────────┘
                           ▼
                       Validation
                           │
                           ▼
                       Controller
                           │
                           ▼
                         Service
                           │
                           ▼
                       Prisma ORM
                           │
                           ▼
                     PostgreSQL
                           │
                           ▼
                    Database Response
                           │
                           ▼
                     API Response
                           │
                           ▼
                         Axios
                           │
                           ▼
                     React State/UI


## 41. Example: Complete Appointment Workflow

One complete real-world example is appointment booking.

Step 1:
Patient logs into the application.

Step 2:
Frontend sends credentials to:

POST /auth/login

Step 3:
Backend verifies the credentials.

Step 4:
Backend generates authentication tokens.

Step 5:
Patient opens the appointment section.

Step 6:
Frontend requests available doctors and appointment slots.

Step 7:
Patient selects a doctor and available time.

Step 8:
Frontend sends appointment data to the backend.

Step 9:
Authentication middleware verifies the JWT.

Step 10:
Authorization checks whether the user can perform the operation.

Step 11:
Validation verifies the request data.

Step 12:
Controller receives the request.

Step 13:
Service performs appointment business logic.

Step 14:
Prisma communicates with PostgreSQL.

Step 15:
Appointment is stored.

Step 16:
Backend returns a structured response.

Step 17:
Frontend updates the appointment list.

Step 18:
Relevant users can receive notifications depending on the configured workflow.


## 42. Example: Complete Patient Admission Workflow

Patient
   ↓
Registration
   ↓
Patient Record
   ↓
Doctor Consultation
   ↓
Admission Decision
   ↓
IPD Admission
   ↓
Ward Selection
   ↓
Bed Assignment
   ↓
Treatment / Care
   ↓
Possible Bed Transfer
   ↓
Discharge
   ↓
Billing


## 43. Example: Pharmacy Workflow

Doctor
   ↓
Patient Consultation
   ↓
Prescription
   ↓
Prescription Stored
   ↓
Pharmacy
   ↓
Check Medicine Inventory
   ↓
Medicine Dispensing
   ↓
Inventory Updated


## 44. Example: Laboratory Workflow

Doctor
   ↓
Lab Test Request
   ↓
Lab Order
   ↓
Laboratory Processing
   ↓
Test Result
   ↓
Result Stored
   ↓
Doctor/Authorized User Views Result


## 45. Project Architecture in One Line

"MedInfera follows a full-stack client-server architecture where a React/Vite frontend communicates with a Node.js/Express REST API, which handles authentication, authorization and business logic, uses Prisma ORM to access PostgreSQL, and uses Socket.IO for realtime communication."


## 46. Interview Explanation

If an interviewer asks:

"Explain your project."

You can answer:

"MedInfera is a full-stack Hospital Management System developed to centralize and digitize hospital operations. The frontend is built using React and Vite, while the backend uses Node.js and Express. PostgreSQL is used as the relational database and Prisma is used as the ORM.

The system provides modules for authentication, role-based access control, hospital and user management, doctors, patients, appointments, wards and beds, IPD, medicines, prescriptions, laboratory operations, invoices, payments, ambulances, payroll, notifications and dashboards.

For communication, the frontend uses Axios to consume REST APIs exposed by the Express backend. Socket.IO is used for realtime communication. Authentication is implemented using JWT access and refresh tokens, while bcryptjs is used for password hashing. The backend also uses Joi for validation, Helmet for HTTP security headers, rate limiting and CORS.

The overall flow is from the React frontend to the Express API, then through authentication, authorization, validation and business logic, followed by Prisma database operations in PostgreSQL. The result is returned to the frontend and displayed to the user.

The project can be deployed with the frontend as a Vite application on a platform such as Vercel and the backend on a service such as Render, with PostgreSQL as the database."


## 47. Important Technologies and Their Purpose

React
→ Builds the frontend user interface.

Vite
→ Frontend development and production build tool.

React Router
→ Handles frontend navigation.

Axios
→ Sends HTTP requests from frontend to backend.

TanStack Query
→ Manages server-side data fetching and caching.

React Hook Form
→ Handles frontend forms.

Zod
→ Frontend validation.

Node.js
→ Backend JavaScript runtime.

Express
→ REST API framework.

Prisma
→ ORM for PostgreSQL.

PostgreSQL
→ Relational database.

JWT
→ Authentication and protected API access.

bcryptjs
→ Password hashing.

Joi
→ Backend request validation.

Socket.IO
→ Realtime communication.

Helmet
→ HTTP security headers.

Winston
→ Application logging.

Rate Limiting
→ Helps protect APIs from excessive requests.


## 48. Final Project Summary

MedInfera is a full-stack, modular Hospital Management System that combines hospital administration, clinical workflows, pharmacy, laboratory, billing, ambulance, payroll, notifications and dashboard functionality into one platform.

The architecture separates responsibilities between the frontend, backend and database:

Frontend:
React + Vite

Backend:
Node.js + Express

ORM:
Prisma

Database:
PostgreSQL

Authentication:
JWT

Authorization:
RBAC

Realtime:
Socket.IO

Validation:
Zod + Joi

Security:
bcryptjs + Helmet + Rate Limiting + CORS

The complete system follows:

User
 ↓
React Frontend
 ↓
Axios / Socket.IO
 ↓
Express Backend
 ↓
JWT Authentication
 ↓
RBAC Authorization
 ↓
Validation
 ↓
Business Logic
 ↓
Prisma ORM
 ↓
PostgreSQL
 ↓
Response
 ↓
React UI

This architecture allows the application to provide a centralized platform for managing major hospital operations while maintaining separation between presentation, business logic, authentication, database access and realtime communication.

