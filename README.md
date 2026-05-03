# Team Task Manager

A full-stack team task management app.

## Tech Stack

- Frontend: React + Vite
- Backend: Spring Boot 3 + Java 21
- Database: H2 (local fallback) or PostgreSQL (production)
- Auth: JWT + Spring Security

## Run Locally

### Backend

```powershell
cd C:\Ethara\backend
mvn spring-boot:run
```

The backend runs on `http://127.0.0.1:8080` by default.

### Frontend

```powershell
cd C:\Ethara\frontend
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## Deploy On Railway

Deploy as **two Railway services** in the same project:

1. Backend service from `backend/`
2. Frontend service from `frontend/`

### 1. Backend Service (Spring Boot)

- Root Directory: `backend`
- Build Command: `mvn clean package -DskipTests`
- Start Command: `java -jar target/task-manager-1.0.0.jar`

Add these environment variables in the backend service:

- `JWT_SECRET` = a strong random secret (32+ chars)
- `SPRING_DATASOURCE_URL` = JDBC URL for Railway Postgres, example:
	`jdbc:postgresql://<host>:<port>/<database>`
- `SPRING_DATASOURCE_USERNAME` = postgres username
- `SPRING_DATASOURCE_PASSWORD` = postgres password
- `SPRING_DATASOURCE_DRIVER_CLASS_NAME` = `org.postgresql.Driver`
- `JPA_DATABASE_PLATFORM` = `org.hibernate.dialect.PostgreSQLDialect`

Optional but recommended:

- `CORS_ALLOWED_ORIGINS` = your frontend URL
- `CORS_ALLOWED_ORIGIN_PATTERNS` = `https://*.up.railway.app`

Notes:

- `PORT` is auto-provided by Railway and is already supported.
- If datasource variables are missing, backend falls back to H2.

### 2. Frontend Service (Vite)

- Root Directory: `frontend`
- Build Command: `npm ci && npm run build`
- Start Command: `npm run start`

Add this environment variable in the frontend service:

- `VITE_API_BASE` = backend base API URL, for example:
	`https://<your-backend-service>.up.railway.app/api`

Why this matters:

- Local dev uses Vite proxy (`/api` -> `localhost:8080`).
- Railway frontend uses `VITE_API_BASE` to call backend directly.

### 3. Verify It Is Running

After both deploys are green:

1. Open frontend Railway URL.
2. Sign up a user.
3. Confirm login works.
4. Check backend health by calling:
	 `https://<backend-url>/api/auth/me` with a bearer token.

If login fails in browser with CORS error:

- Set `CORS_ALLOWED_ORIGINS` on backend to include your frontend URL exactly.
- Redeploy backend.

## App Behavior

- First signup becomes global `ADMIN`.
- Later signups become `MEMBER`.

## REST API

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/{id}`
- `GET /api/projects/{id}/members`
- `POST /api/projects/{id}/members`
- `GET /api/tasks`
- `GET /api/tasks/project/{projectId}`
- `POST /api/tasks`
- `PATCH /api/tasks/{id}`
- `DELETE /api/tasks/{id}`
- `GET /api/tasks/dashboard/stats`
