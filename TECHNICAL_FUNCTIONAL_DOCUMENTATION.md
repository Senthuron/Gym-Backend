## GymMini Backend – Technical & Functional Documentation

This document provides a deeper **technical** and **functional** view of the GymMini backend, complementing the main `README.md`. It covers:

- High‑level system architecture
- Folder and file structure
- Core logic areas (authentication, dashboards, integrations, etc.)
- Deployment and rollback procedures
- Known risks and technical debt

---

## High-Level System Architecture

- **Architecture Style**
  - Node.js + Express.js REST API.
  - MongoDB as primary data store, accessed via Mongoose ODM.
  - Stateless authentication using JSON Web Tokens (JWT).
  - Role-based access control (RBAC) at middleware level.
  - Socket.io for real-time communication layered on top of the HTTP server.
  - Nodemailer-based email integration for transactional emails (OTP, credentials, notifications).

- **Runtime Components**
  - **API Server (`server.js`)**
    - Loads environment configuration via `dotenv`.
    - Connects to MongoDB using `config/database.js`.
    - Configures CORS with environment‑aware origin rules.
    - Registers JSON parsing, URL-encoded parsing, and development logging middleware.
    - Mounts modular routers under the `/api` prefix.
    - Exposes a health-check endpoint at `/`.
    - Instantiates an HTTP server and attaches Socket.io via `utils/socket.js`.
  - **Database**
    - Single MongoDB database, with collections defined via Mongoose models in `models/`.
    - No separate read/write replicas or sharding assumed.
  - **External Services**
    - SMTP-compatible email provider (e.g., Gmail) via Nodemailer.
    - UI frontend(s) (React/Next.js or similar) consuming the REST API and Socket.io, controlled by CORS configuration.

- **Data Flow Overview**
  1. **Request** hits Express route (e.g., `/api/members`).
  2. **Middleware** stack runs:
     - CORS, JSON body parsing.
     - Authentication (`authenticateToken`) when required.
     - Role guards (`requireAdmin`, `requireTrainer`, `requireMember`) and Zod-based validation (where configured).
  3. **Controller** function executes domain logic:
     - Validates business rules.
     - Reads/writes data using Mongoose models.
     - Uses utilities (e.g., `sendEmail`) when needed.
  4. **Response** is returned as JSON with a consistent structure:
     - `success: boolean`
     - `message: string`
     - Optional `data` object.
  5. **Real-time notifications** (when implemented) are emitted through Socket.io to interested clients.

---

## Folder and File Structure Explanation

Root overview:

- `server.js`
  - Main application entry point.
  - Creates Express app, connects to DB, configures CORS and middleware.
  - Registers all API routes.
  - Creates HTTP server and initializes Socket.io.

- `package.json`
  - Metadata and dependency list.
  - Defines npm scripts:
    - `start`: `node server.js`
    - `dev`: `nodemon server.js`
    - `seed`: `node utils/seedAdmin.js`

- `config/`
  - **`database.js`**
    - Reads `MONGODB_URI` from environment.
    - Establishes MongoDB connection via Mongoose.
    - Handles connection events and logs connection status/errors.
  - **`email.js`**
    - Creates and exports a Nodemailer transporter.
    - Configured via `EMAIL_SERVICE`, `EMAIL_USER`, and `EMAIL_PASSWORD`.

- `controllers/`
  - Each file encapsulates business logic for a specific domain:
    - `authController`: Login, registration, OTP and password reset flows.
    - `memberController`: CRUD operations and search/filter for members.
    - `sessionController`: Create/update/cancel gym sessions and apply filters.
    - `attendanceController`: Mark and fetch attendance for members.
    - `dashboardController`: Aggregate metrics for admin dashboards.
    - `trainerController`: Manage trainer profiles and associated data.
    - `userController`: User management (cross-role operations).
    - `employeeController`: CRUD for employees.
    - `employeeAttendanceController`: Employee attendance lifecycle.
    - `dietPlanController`: CRUD for diet plans.
    - `workoutPlanController`: CRUD for workout plans.
    - `feedbackController`: Manage feedback submitted by users.

- `middleware/`
  - **`auth.js`**
    - `authenticateToken`: Parses and verifies JWT (`Authorization: Bearer <token>`).
    - Role-specific guards:
      - `requireAdmin`
      - `requireTrainer` (trainer or admin)
      - `requireMember` (member or admin)
  - **`validate.js`**
    - Connects Zod schemas from `validators/` to Express routes.
    - Returns standardized validation error responses.

- `models/`
  - Mongoose schemas that define the persistent data model:
    - `User`: Core authentication entity with role, email, password hash, and common fields.
      - Pre-save hook to hash passwords via bcryptjs.
      - Instance method for password comparison.
    - `Admin`: Admin-specific data (may extend or reference `User`).
    - `Member`: Member profile and membership-related metadata.
    - `Trainer`: Trainer details (bio, specialization, association to sessions).
    - `Employee`: Non-trainer staff records.
    - `Session`: Gym sessions/classes (date/time, trainer, capacity, members).
    - `Attendance`: Member/session attendance records.
    - `EmployeeAttendance`: Employee attendance records.
    - `DietPlan`: Diet plans associated to members.
    - `WorkoutPlan`: Workout plans associated to members.
    - `Feedback`: Feedback entries (ratings, comments, author, timestamps).
    - `OTP`: One-time password entries tied to users for password reset.

- `routes/`
  - Route-level definitions mapping HTTP methods + paths to controller functions:
    - `auth.js` → `/api/auth`
    - `members.js` → `/api/members`
    - `sessions.js` → `/api/sessions`
    - `attendance.js` → `/api/attendance`
    - `dashboard.js` → `/api/dashboard`
    - `trainers.js` → `/api/trainers`
    - `users.js` → `/api/users`
    - `employees.js` → `/api/employees`
    - `employeeAttendance.js` → `/api/employee-attendance`
    - `dietPlanRoutes.js` → `/api/diet-plans`
    - `workoutPlanRoutes.js` → `/api/workout-plans`
    - `feedback.js` → `/api/feedback`
  - Applies authentication, role-based middleware, and validators where appropriate.

- `validators/`
  - Zod schemas that define request validation rules:
    - `authValidator.js`: Login, registration, password reset payloads, etc.
    - `memberValidator.js`: Creation and update rules for member data.
    - `sessionValidator.js`: Session creation/update structure.
    - `trainerValidator.js`: Trainer payload structures.
  - These schemas are plugged into routes through `middleware/validate.js`.

- `utils/`
  - **`seedAdmin.js`**
    - Script to create default admin and test users based on env vars (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, etc.).
    - Invoked via `npm run seed`.
  - **`sendEmail.js`**
    - Helper that consumes the Nodemailer transporter to send emails (OTP, credentials, notifications).
  - **`socket.js`**
    - Initializes Socket.io with the HTTP server.
    - Defines connection handlers, room-joining, and high-level event plumbing.
  - **`migrateToUsers.js`**
    - One-off migration script to unify user storage, referenced in `USER_STORAGE_FIX.md`.

- Documentation files:
  - `README.md`: High-level overview, setup, and integration details.
  - `ROLE_BASED_AUTH.md`: Detailed documentation of roles, permissions, and auth flows.
  - `PASSWORD_RESET_API.md`: Detailed API contract for password reset endpoints.
  - `EMAIL_SETUP_GUIDE.md`: Email configuration steps and troubleshooting.
  - `POSTMAN_GUIDE.md`: How to use Postman collections to test the API.
  - `USER_STORAGE_FIX.md`: Notes on user storage migration.

---

## Core Logic Areas

### 1. Authentication & Authorization

- **JWT Authentication**
  - Implemented in `authController` and `middleware/auth.js`.
  - Tokens are signed with `JWT_SECRET` and include at least user ID and role.
  - Tokens are validated on protected routes, with decoded payload attached to `req.user`.
  - Expiration behavior is controlled via `JWT_EXPIRES_IN`.

- **User Lifecycle**
  - **Registration**
    - Validation via Zod (in `validators/authValidator.js`).
    - User password is hashed before saving using bcryptjs.
    - Appropriate role is assigned (`admin`, `trainer`, `member`, or `user` depending on route).
  - **Login**
    - Credentials verified against hashed password using model methods.
    - On success, a JWT is issued and returned in the response.

- **Role-Based Access Control**
  - `requireAdmin`: Ensures only admins can access admin-only routes (e.g., user management, some dashboards).
  - `requireTrainer`: Allows trainers and admins (e.g., trainer dashboards, session management).
  - `requireMember`: Allows members and admins (e.g., member self-service dashboards).
  - Enforcement is done at the router level by applying the appropriate middleware chain.

- **Password Reset (OTP Flow)**
  - Detailed in `PASSWORD_RESET_API.md`.
  - **Core steps**:
    1. **Forgot Password** (`/api/auth/forgot-password`):
       - Generates a numeric OTP and stores it in the `OTP` collection with expiry.
       - Sends OTP via email using `utils/sendEmail.js`.
    2. **Verify OTP** (`/api/auth/verify-otp`):
       - Confirms OTP correctness and non-expiration.
    3. **Reset Password** (`/api/auth/reset-password`):
       - Sets new password (hashed) for the corresponding user.
       - Invalidates or deletes used OTP entries.

### 2. Dashboard & Analytics

- **`dashboardController`**
  - Aggregates information from multiple collections:
    - **Members**: Count of active members.
    - **Expiring Memberships**: Memberships expiring within a defined time window (e.g., 7 days).
    - **Sessions**: Weekly session count and upcoming sessions.
    - **Attendance**: Attendance percentages or counts across given periods.
  - Likely uses MongoDB aggregation pipelines or combined Mongoose queries.
  - Endpoint is exposed under `/api/dashboard` and typically protected for admin-level users.

### 3. Member, Trainer, Employee & Session Management

- **Members (`memberController`)**
  - Full CRUD operations.
  - Filtering & searching (by name, membership status, etc.).
  - Association with sessions, diet plans, workout plans, and attendance.

- **Trainers (`trainerController`)**
  - CRUD operations for trainer profiles.
  - Link trainers with sessions and potentially specialized data (e.g., expertise).

- **Employees (`employeeController`, `employeeAttendanceController`)**
  - Staff records distinct from trainers.
  - Separate attendance tracking model.

- **Sessions (`sessionController`)**
  - Create/update sessions with trainer, schedule, and capacity details.
  - Cancel sessions via dedicated route (e.g., `/api/sessions/:id/cancel`).
  - Retrieve sessions with filters (by trainer, date range, status).

### 4. Attendance

- **Member Attendance (`attendanceController`)**
  - Marks attendance for sessions (check-in style).
  - Fetches attendance for specific sessions or members.

- **Employee Attendance (`employeeAttendanceController`)**
  - Tracks daily/shift attendance for employees.
  - May include status (present, absent, late, etc.).

### 5. Diet & Workout Plans

- **Diet Plans (`dietPlanController`)**
  - Creates and maintains diet plans linked to members.
  - Contains fields like calories, meal breakdown, and notes.

- **Workout Plans (`workoutPlanController`)**
  - Creates and maintains workout plans per member.
  - Includes sets, reps, exercises, and schedule.

### 6. Feedback System

- **Feedback (`feedbackController`)**
  - Accepts submissions from members or other roles.
  - Stores ratings, comments, and metadata (e.g., createdBy, timestamps).
  - Potential feed for admin dashboards or reports.

### 7. Integrations: Email & Real-Time (Socket.io)

- **Email Integration**
  - Centralized transporter in `config/email.js`.
  - `utils/sendEmail.js` wraps these details and simplifies message sending.
  - Uses environment variables for SMTP configuration.
  - Used heavily in:
    - OTP-based password reset.
    - Possibly in user invitation/credential emails.

- **Socket.io Integration**
  - Socket server initialization in `utils/socket.js`, invoked from `server.js`:
    - `const server = http.createServer(app);`
    - `socketUtils.init(server);`
  - Handles:
    - Connection and disconnection events.
    - User room joins (e.g., room per user ID or role).
    - Broadcasting or targeted events (e.g., dashboard updates, notifications).
  - CORS settings should be aligned with HTTP CORS configuration for frontend connectivity.

---

## Deployment and Rollback Procedure

> Note: There is no dedicated deployment script or Docker configuration in this repository; the steps below describe a **generic** deployment approach for Node.js + MongoDB services based on the current codebase.

### Deployment Procedure

1. **Prepare Environment**
   - Provision a server or container runtime (e.g., Linux VM, Docker container, PaaS instance).
   - Install:
     - Node.js (LTS)
     - Access to MongoDB (managed cluster or self-hosted).
   - Create a dedicated system user or container for the app if running on bare metal/VM.

2. **Clone and Install**
   - Clone the repository to the target environment:
     ```bash
     git clone <repo-url> gymmini-backend
     cd gymmini-backend
     npm install
     ```

3. **Configure Environment Variables**
   - Copy `.env.example` to `.env` and set environment-specific values:
     - `NODE_ENV=production`
     - `PORT=<desired_port>`
     - `MONGODB_URI=<prod_mongo_uri>`
     - `JWT_SECRET=<strong_secret>`
     - `JWT_EXPIRES_IN=<desired_expiry>`
     - `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASSWORD`
     - `FRONTEND_URL=<comma_separated_allowed_frontend_urls>`
   - Secure `.env` file with appropriate file permissions.

4. **Seed Admin User (First-Time Only)**
   - For a fresh environment, create initial admin/test users:
     ```bash
     npm run seed
     ```
   - Confirm that the admin user can log in from the frontend or via API.

5. **Start the Application**
   - Development (non-production):
     ```bash
     npm run dev
     ```
   - Production (preferably under a process manager like PM2 or systemd):
     ```bash
     npm start
     ```
   - Configure process manager (e.g., PM2) to:
     - Auto-restart on crash.
     - Start on boot.

6. **Networking & Security**
   - Expose only the required port (e.g., 80/443 via reverse proxy, or direct access to `PORT`).
   - Prefer terminating HTTPS at a reverse proxy (Nginx, Caddy, etc.) that forwards traffic to the Node.js app.
   - Ensure MongoDB is not publicly exposed, or is securely firewalled and whitelisted.

7. **Monitoring & Logs**
   - Capture stdout/stderr logs via process manager or external logging.
   - Optionally integrate with monitoring tools for:
     - Health check at `/`.
     - Response times and error rates.

### Rolling Out Updates

When deploying a new version:

1. **Pull Latest Code**
   ```bash
   git pull origin main
   npm install --production    # or npm ci
   ```

2. **Run Database Migration Scripts (If Any)**
   - If `utils/migrateToUsers.js` or other migration scripts are relevant to your update:
     - Back up the database.
     - Run migration scripts in a controlled manner (see `USER_STORAGE_FIX.md`).

3. **Restart the Application**
   - Restart via process manager:
     ```bash
     pm2 restart gymmini-backend
     # or
     systemctl restart gymmini-backend
     ```

4. **Smoke Test**
   - Hit `/` health check.
   - Hit a key secure endpoint (login and one dashboard endpoint) to confirm:
     - Auth works.
     - DB connection is healthy.
     - CORS is configured correctly for the production frontend.

### Rollback Procedure

Because the repo has no formal migration/versioning tool or blue‑green deployment configuration, rollbacks are **manual but straightforward**:

1. **Application Rollback**
   - Identify previous stable git commit or tag.
   - Check out that revision:
     ```bash
     git checkout <previous-stable-commit>
     npm install --production    # ensure dependencies match
     ```
   - Restart the process:
     ```bash
     pm2 restart gymmini-backend
     ```

2. **Database Rollback**
   - If the new release introduced schema/data changes:
     - Restore the database from the latest backup **taken before** the deployment.
     - Or run a dedicated rollback migration script if one was created.
   - This is **critical** because the project does not include a structured migration framework (like Mongoose migrations or Prisma Migrate).

3. **Configuration Rollback**
   - If `.env` changes caused the issue:
     - Revert `.env` to previously known working configuration (keep secure backups or use secret management tools).

4. **Verification**
   - Re-run smoke tests and confirm the previous behavior is restored.

---

## Known Risks and Technical Debt

This section captures notable **risks**, **limitations**, and **technical debt** observed in the current codebase and likely operational environment.

### 1. Lack of Automated Tests

- **Issue**
  - No automated unit, integration, or end-to-end tests are present.
  - All validation relies on manual/adhoc testing via Postman or similar tools.
- **Risk**
  - Regression bugs can be introduced easily during refactors or feature additions.
  - Production stability relies heavily on manual QA.
- **Mitigation**
  - Introduce Jest + supertest for critical routes (auth, dashboard, member CRUD, password reset).
  - Add smoke tests to CI/CD pipeline before deployments.

### 2. Missing Structured Migrations

- **Issue**
  - No formal DB migration framework is in place; schema changes rely on:
    - Updating Mongoose models.
    - Ad-hoc scripts (`utils/migrateToUsers.js`) and manual procedures (`USER_STORAGE_FIX.md`).
- **Risk**
  - Applying schema changes across environments may be error-prone.
  - Rollbacks are harder and often require restoring from backups.
- **Mitigation**
  - Adopt a migration tool (e.g., migrate-mongo, mongoose-migrate, or custom migration runner).
  - Document forward and backward migration scripts for each major release.

### 3. CORS and Security Configuration

- **Issue**
  - Development mode allows any `localhost`/`127.0.0.1` origin.
  - Production relies on `FRONTEND_URL` env var; misconfiguration can either:
    - Overly restrict valid clients.
    - Accidentally permit unwanted origins if not carefully set.
- **Risk**
  - Potential for CORS misconfigurations leading to security or UX issues.
- **Mitigation**
  - Maintain environment‑specific configuration examples.
  - Validate `FRONTEND_URL` carefully (no trailing slashes, correct protocols).
  - Consider a deny-by-default posture for CORS.

### 4. Socket.io Security and Hardening

- **Issue**
  - Socket.io is initialized globally; detailed auth and authorization for real-time channels is not fully visible in this doc.
- **Risk**
  - Without strict auth on Socket.io connections and events, unauthorized clients could:
    - Subscribe to sensitive rooms.
    - Receive or emit unwanted events.
- **Mitigation**
  - Require JWT validation on Socket.io connection (e.g., via auth handshake).
  - Enforce room membership policies based on authenticated user roles.
  - Audit emitted event payloads and sanitize input.

### 5. Operational Concerns (Monitoring, Rate Limiting)

- **Issue**
  - No built-in rate limiting, request throttling, or security middleware beyond basic JWT and input validation.
  - No integrated monitoring, metrics, or alerting inside the app code.
- **Risk**
  - API may be vulnerable to brute-force attacks, request floods, or abuse.
  - Harder to detect performance degradation or errors in real time.
- **Mitigation**
  - Add:
    - Rate limiting middleware (e.g., `express-rate-limit`) for auth endpoints and other sensitive routes.
    - Basic metrics endpoints or integrate with external APM/monitoring.

### 6. Inconsistent Validation Strategy

- **Issue**
  - Migration from `express-validator` to Zod is partially done:
    - Some older routes may still rely on `express-validator`.
    - Newer routes use Zod schemas in `validators/`.
- **Risk**
  - Inconsistent validation rules across endpoints.
  - Potential for unvalidated or weakly validated input on legacy paths.
- **Mitigation**
  - Standardize validation with Zod across all routes.
  - Deprecate and remove use of `express-validator` once migration is complete.

### 7. Secrets Management

- **Issue**
  - JWT secrets, email credentials, and DB URIs are stored in `.env` files.
- **Risk**
  - Mismanagement of `.env` files (committing to VCS, weak secrets) can cause security incidents.
- **Mitigation**
  - Use secret management solutions in production (e.g., environment-level secrets, vaults).
  - Enforce strong JWT secrets and database credentials.
  - Keep `.env` files out of version control and backups.

---

## Summary

The GymMini backend is a modular, MVC-style Node.js/Express service with a rich functional surface (auth, members, sessions, dashboards, attendance, diet/workout plans, feedback, real-time updates, and email). This document should serve as a reference for:

- Understanding the architecture and key flows.
- Navigating folders and core logic.
- Planning deployments and rollbacks.
- Identifying and addressing key technical risks over time.

