# BloodCare -- Blood Management System

BloodCare is a database-driven blood management system for managing
donors, hospitals, donations, blood stock, blood requests, blood issues,
and notifications.

## Project status

-   **Frontend:** deployed on Vercel for preview.
-   **Backend:** Node.js and Express, run locally.
-   **Database:** MySQL, run locally.
-   **College demonstration:** run the frontend, backend, and MySQL
    database on the same computer. The Vercel frontend is not
    automatically connected to your local database.

## Technology stack

**Frontend:** React, Vite, React Router, Axios, CSS, lucide-react.

**Backend:** Node.js, Express.js, MySQL2, JWT, bcryptjs, CORS, dotenv.

**Database:** MySQL 8.

## Main modules

### Admin

-   Admin dashboard
-   Manage donors and hospitals
-   Manage blood groups
-   Manage donations and blood stock
-   Review hospital blood requests
-   Manage blood issues
-   View notifications

### Donor

-   Donor dashboard and profile
-   My donations
-   Blood groups and compatibility information

### Hospital

-   Hospital dashboard
-   Submit and view blood requests
-   View blood stock
-   View issued blood details

### Notifications

-   In-app notifications
-   Unread notification count
-   Mark an individual notification as read
-   Mark all notifications as read

## Database concepts

The project includes the following database features; verify the final
SQL scripts before presenting them:

-   Relational tables and foreign-key relationships.
-   Views: `Available_Blood_Stock`, `Donor_Details`,
    `Hospital_Requests`.
-   Triggers to increase stock after a completed donation and decrease
    stock after blood is issued.
-   Stored procedures for selected registration and request operations.
-   Transactions using `COMMIT`, `ROLLBACK`, and `SAVEPOINT`.
-   Query analysis using `EXPLAIN`.

## Prerequisites

Install: - Node.js and npm - MySQL Server 8 - MySQL Workbench
(recommended) - Visual Studio Code

## Project setup

Clone the repository:

``` bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Blood-PROJECT
```

### 1. Set up MySQL

1.  Start MySQL Server.
2.  Open MySQL Workbench and connect to your local MySQL instance.
3.  Create the database if it does not already exist:

``` sql
CREATE DATABASE blood_management;
```

4.  Select `blood_management`.
5.  Import or execute your project's SQL schema and seed-data scripts.
6.  Confirm that the tables, views, triggers, and stored procedures are
    present.

Use your existing SQL scripts or database backup. Do not recreate tables
manually if the database already exists. Back up the database before
making schema changes.

### 2. Configure and run the backend

Open a terminal in the backend directory:

``` bash
cd backend
npm install
```

Create `backend/.env`:

``` env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_LOCAL_MYSQL_PASSWORD
DB_NAME=blood_management
JWT_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET
```

Replace the password with your local MySQL password and use a long,
private random value for `JWT_SECRET`. Never commit `.env` to GitHub.

Start the backend:

``` bash
npm start
```

The backend should run at `http://localhost:5000`. The root health-check
route is `http://localhost:5000/`.

### 3. Configure and run the frontend

Open a second terminal:

``` bash
cd frontend
npm install
```

For local demonstration, configure the frontend API base URL to point to
the local backend. If the project uses the Vite variable `VITE_API_URL`,
create `frontend/.env`:

``` env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

``` bash
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

If the API base URL is hard-coded, update it to
`http://localhost:5000/api` for local testing. Restart Vite after
changing environment variables.

## Backend API route groups

The Express application mounts these route groups:

  Route prefix           Purpose
  ---------------------- -------------------------
  `/api/auth`            Authentication
  `/api/donors`          Donor operations
  `/api/hospitals`       Hospital operations
  `/api/blood-groups`    Blood group information
  `/api/donations`       Donation operations
  `/api/stock`           Blood stock
  `/api/requests`        Hospital blood requests
  `/api/issues`          Blood issue operations
  `/api/notifications`   In-app notifications

Exact endpoints and request formats are defined in the route files under
`backend/routes`.

## College demonstration checklist

-   [ ] MySQL Server is running.
-   [ ] `blood_management` contains the required tables and sample data.
-   [ ] Views, triggers, and stored procedures are present.
-   [ ] Backend `.env` values are correct and private.
-   [ ] Backend starts without database connection errors.
-   [ ] Frontend API base URL points to the local backend.
-   [ ] Frontend starts successfully.
-   [ ] Test accounts for the required roles are available.
-   [ ] Sample donor, hospital, donation, stock, and request records are
    ready.
-   [ ] A fresh database backup is saved.

## Security notes

-   Never commit `.env` files, database passwords, JWT secrets, or real
    user credentials.
-   Do not store plain-text passwords; use password hashing.
-   Do not expose the local MySQL server directly to the public
    internet.
-   Use test data for classroom demonstrations where possible.

## Important deployment note

The Vercel deployment is a frontend preview. It does not make the local
Express backend or local MySQL database publicly accessible. For the
complete demonstration, run MySQL, the backend, and the frontend locally
on the same computer.

Check `backend/package.json` and `frontend/package.json` if the npm
scripts differ from the commands above.
