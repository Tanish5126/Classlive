# ClassLive Backend: Project Context

> Read this file fully before writing any code. It is the source of truth for the project.

## 1. What we are building
Backend API for **ClassLive**, a Virtual Classroom (like a mini Google Classroom).
There is **no frontend**. Only a REST API, a Socket.io server, and one tiny HTML test page.

Users are **teachers** and **students**.
- Users join classes and take quizzes.
- Mock screen sharing (fake, no real video) and attendance tracking.
- Real-time classroom updates via Socket.io.
- Firebase push notifications for class schedules.

## 2. Tech stack (mandatory)
- Node.js + Express.js (REST API, modular routes and controllers)
- MongoDB Atlas + Mongoose ODM
- JWT authentication + Firebase Auth
- Socket.io (real-time)
- Firebase Admin SDK (push notifications via FCM)
- Middleware: JWT auth, role-based authorization, validation

## 3. Roles and permissions
| Action | Teacher | Student |
|---|---|---|
| Register / login | Yes | Yes |
| View classes, sessions, quizzes | Yes | Yes |
| Create / update classes | Yes | No |
| Create / update sessions | Yes | No |
| Create quizzes | Yes | No |
| Mark attendance | Yes | TBD (see section 8) |
| View own attendance | n/a | Yes (own only) |
| Submit quiz answers | No | Yes |
| View own submissions | n/a | Yes (own only) |
| View all submissions / attendance | Yes | No |
| Send notifications | Yes | No |
| Mock screen share (Socket.io) | Yes | No (server must ignore it) |

Role is stored in the user document and inside the JWT. The server enforces it. Never trust the client.

## 4. API endpoints
**Auth**
- POST /api/auth/register
- POST /api/auth/login

**Classes**
- GET /api/classes
- GET /api/classes/:id
- POST /api/classes (teacher)
- PUT /api/classes/:id (teacher)

**Sessions**
- POST /api/sessions
- GET /api/sessions
- GET /api/sessions/:id
- PUT /api/sessions/:id

**Attendance**
- POST /api/attendance
- GET /api/attendance
- GET /api/attendance/student/:id

**Quizzes**
- GET /api/quizzes
- GET /api/quizzes/:id
- POST /api/quizzes (teacher)

**Submissions**
- POST /api/submissions
- GET /api/submissions
- GET /api/submissions/student/:id

**Notifications**
- POST /api/notifications/send

The exam asks for "all CRUD operations", so add DELETE endpoints where sensible (classes, sessions, quizzes), teacher only.

## 5. Folder structure
```
classlive-backend/
├── src/
│   ├── config/        db.js, firebase.js
│   ├── models/        User, Class, Session, Attendance, Quiz, Submission
│   ├── routes/        one file per resource (*.routes.js)
│   ├── controllers/   one file per resource (*.controller.js)
│   ├── middleware/    auth, role, validate, error
│   ├── validators/    input rules per resource
│   ├── sockets/       index.js, classroom.socket.js
│   ├── services/      notification.service.js
│   ├── utils/         generateToken.js, ApiError.js
│   ├── app.js         Express app, middleware, routes
│   └── server.js      starts HTTP + Socket.io
├── public/            test-client.html (only frontend file)
├── docs/              swagger.json, Postman collection
├── .env / .env.example / .gitignore / package.json / README.md
```
Request flow: route -> middleware (auth, role, validate) -> controller -> model -> MongoDB.

## 6. Rules for the AI (important)
1. **Do NOT build optional features**: no Recordings API, no Breakouts API.
2. **Never hardcode secrets.** Use `.env` for the Mongo URI, JWT secret, Firebase credentials and port. Keep `.env.example` updated.
3. `.env` and the Firebase service account JSON must be in `.gitignore`.
4. Keep code beginner-readable: clear names, short comments explaining *why*, no clever tricks.
5. Build **one phase at a time**. Do not generate files from later phases.
6. Use a consistent JSON response shape: `{ success, message, data }`.
7. Use proper HTTP status codes (401 not logged in, 403 wrong role, 404 not found, 400 bad input).
8. Use CommonJS (`require`) or ES modules consistently. Pick one and tell me which.
9. After each phase, tell me how to run it and how to test it.
10. If something is unclear, ask before assuming.

## 7. Build phases
1. Setup, MongoDB connection, models, auth (JWT)
2. REST API: classes, sessions, quizzes, submissions, attendance, role middleware
3. Socket.io real-time classroom + test-client.html
4. Firebase push notifications
5. API docs (Postman/Swagger), README, deployment (bonus)

## 8. Open decisions
- **Attendance:** does a student get marked automatically when joining a session, or does the teacher mark it manually? (To be decided.)

## 9. Example user flow (must work)
1. Join a session room via Socket.io
2. POST /api/submissions -> take quiz
3. POST /api/attendance -> attendance marked

## 10. Deliverables
REST API with full CRUD, Socket.io server, API docs (Swagger or Postman), GitHub repo with README and setup steps, bonus: deploy on Render.
