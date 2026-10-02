# ClassLive Backend 🎓

> A Virtual Classroom REST API and Real-Time Socket.io Server built with Node.js, Express, MongoDB Atlas, Socket.io, and Firebase Admin.

---

## 📖 1. Project Overview & Features

**ClassLive** is a backend service for a virtual classroom platform (like a mini Google Classroom). It provides a full REST API, a real-time Socket.io server, and a lightweight web test client.

### Key Features
- **Authentication & RBAC**: JWT-based authentication, password hashing with `bcryptjs`, role enforcement (`teacher` vs `student`), and Firebase ID token login.
- **Classes Management**: Teachers create and manage classes; students discover and join classes.
- **Live Class Sessions**: Teachers schedule sessions and broadcast live status with automated push notifications.
- **Interactive Quizzes**: Teachers create quizzes with multiple-choice questions; answers are hidden from students until submitted, where they are automatically graded on the server.
- **Attendance Verification**: Real-time attendance logging enforcing live-session status checks with duplicate protection.
- **Real-Time Classroom (Socket.io)**: Session rooms, real-time participant listings, teacher-only mock screen sharing, and synchronized quiz launches.
- **Push Notifications (FCM)**: Class topic push alerts (`class_<classId>`) powered by Firebase Admin SDK (with optional dry-run mode for simulation).
- **Interactive Documentation**: Swagger UI at `/api-docs/` and a ready-to-import Postman collection.

---

## 🛠️ 2. Tech Stack

- **Runtime**: Node.js (CommonJS)
- **Framework**: Express.js
- **Database**: MongoDB Atlas + Mongoose ODM (v9)
- **Real-Time Communication**: Socket.io (v4)
- **Authentication**: JWT (`jsonwebtoken`) + Firebase Admin Auth
- **Push Notifications**: Firebase Admin Cloud Messaging (FCM v14 modular API)
- **Input Validation**: `express-validator`
- **Documentation**: OpenAPI 3.0 / Swagger UI (`swagger-ui-express`) & Postman Collection v2.1

---

## 📁 3. Folder Structure

```text
classlive-backend/
├── docs/
│   ├── swagger.json                     # OpenAPI 3.0 API specifications
│   └── ClassLive.postman_collection.json # Postman collection v2.1 (collection-level Bearer auth)
├── public/
│   └── test-client.html                 # Browser test client for Socket.io testing
├── scripts/
│   └── seed.js                          # Database seeder (teacher, student, class, session, quiz)
├── src/
│   ├── config/
│   │   ├── db.js                        # MongoDB Mongoose connection
│   │   └── firebase.js                  # Firebase Admin modular initialization (v14)
│   ├── controllers/                     # Route controllers (auth, class, session, quiz, etc.)
│   ├── middleware/                      # Auth, role check, validation handler, and error handler
│   ├── models/                          # Mongoose models (User, Class, Session, Quiz, Submission, Attendance)
│   ├── routes/                          # Express route definitions
│   ├── services/                        # Notification service (FCM topic delivery)
│   ├── sockets/                         # Socket.io connection auth and classroom event handlers
│   ├── utils/                           # Token generation and ApiError class
│   ├── app.js                           # Express application setup
│   └── server.js                        # HTTP + Socket.io server entry point
├── .env.example                         # Environment variable template
├── .gitignore                           # Git ignore rules
└── package.json                         # Project dependencies and scripts
```

---

## 📋 4. Prerequisites

Before running the server, make sure you have:
1. **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/)).
2. **MongoDB Atlas Account**: A cloud MongoDB Atlas database (or a local MongoDB instance).
3. **Firebase Project**: A Firebase project on the [Firebase Console](https://console.firebase.google.com/) for push notifications and Firebase auth (optional for local testing using `FCM_DRY_RUN=true`).

---

## 🚀 5. Step-by-Step Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/Tanish5126/Classlive.git
cd Classlive
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create your `.env` file from the provided `.env.example`:
```bash
cp .env.example .env
```

> **Note**: The default port for the server is **`5001`** (configured in `.env.example`). If `PORT` is omitted, the fallback is `5000`.

### Step 4: How to Get the MongoDB Atlas URI
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. In the sidebar, select **Database**.
3. Click the **Connect** button next to your cluster.
4. Select **Drivers** (Node.js).
5. Copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/classlive?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your database user credentials.
7. Paste this URI into your `.env` file as `MONGO_URI`.

### Step 5: How to Get the Firebase Service Account JSON & Where to Put It
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click the gear icon (**Project settings**) at the top left.
3. Open the **Service accounts** tab.
4. Click **Generate new private key**, then confirm by clicking **Generate key**.
5. Save the downloaded `.json` file in your project root as:
   ```text
   firebase-service-account.json
   ```
   *(This filename matches the `.gitignore` pattern `*firebase*.json` so it will never be committed to Git).*
6. In your `.env` file, ensure:
   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   FCM_DRY_RUN=true
   ```

---

## 🏃 6. How to Run

- **Development Mode** (auto-reloads on file save via `nodemon`):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

---

## 🌱 7. How to Seed Test Data

To quickly seed your database with pre-made demo accounts, a class, a live session, and a quiz, run:
```bash
npm run seed
```

### What It Prints
The seed script outputs ready-to-copy tokens and MongoDB ObjectIDs directly in your terminal:
```text
=============================================
ClassLive Seed Completed Successfully!
=============================================
TEACHER_TOKEN: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
STUDENT_TOKEN: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
CLASS_ID:      651f1a2b3c4d5e6f7a8b9c0d
SESSION_ID:    651f1a2b3c4d5e6f7a8b9c0e
QUIZ_ID:       651f1a2b3c4d5e6f7a8b9c0f
=============================================
```
- **Teacher Account**: `teacher@test.com` / `123456`
- **Student Account**: `student@test.com` / `123456`

---

## 🧪 8. How to Test

### A. Health Check
Verify the server is running:
```bash
curl http://localhost:5001/api/health
```
**Response:**
```json
{
  "success": true,
  "message": "ClassLive API running"
}
```

### B. Swagger UI Interactive Documentation
Open your browser and navigate to:
```text
http://localhost:5001/api-docs/
```
1. Click **Authorize** at the top right.
2. Paste **only the token** (no `Bearer` prefix and no quotes) — e.g. copy `TEACHER_TOKEN` or `STUDENT_TOKEN` and paste it directly.
3. Try out any endpoint directly in your browser.

### C. Postman Collection
1. Open [Postman](https://www.postman.com/) and click **Import**.
2. Select the file: `docs/ClassLive.postman_collection.json`.
3. In Postman, click on the **ClassLive API Collection** root folder and open the **Variables** tab:
   - `baseUrl` is set to `http://localhost:5001`.
   - `token`: Run `Auth > Login`, copy the returned JWT token, and paste it into the `token` variable.
4. All protected requests automatically inherit this Bearer token at the collection level.

### D. Real-Time Socket.io Classroom (Two-Tab Example)
Test the interactive real-time classroom using the built-in test client:
1. Open two separate browser tabs to:
   ```text
   http://localhost:5001/test-client.html
   ```
2. **Tab 1 (Teacher)**:
   - In **JWT Token**, paste `TEACHER_TOKEN`.
   - In **Session ID**, paste `SESSION_ID`.
   - In **Quiz ID**, paste `QUIZ_ID`.
   - Click **1. Connect**, then click **2. Join Session**.
   - Tab 1 logs: `joined-ok` and `participants: [ Teacher ]`.
3. **Tab 2 (Student)**:
   - In **JWT Token**, paste `STUDENT_TOKEN`.
   - In **Session ID**, paste the same `SESSION_ID`.
   - Click **1. Connect**, then click **2. Join Session**.
   - Both tabs immediately receive `user-joined` and updated `participants: [ Teacher, Student ]`.
4. **Test Real-Time Broadcasts**:
   - In **Tab 1 (Teacher)**, click **Start Screen Share** → Both tabs log `screen-share-started: { by: "Test Teacher" }`.
   - In **Tab 1 (Teacher)**, click **Start Quiz** → Both tabs log `quiz-started: { quizId: "...", startedBy: "Test Teacher" }`.
   - In **Tab 2 (Student)**, click **Start Screen Share** → Only Tab 2 receives `error-message: { message: "Only teachers can do this" }`.

---

## 🔒 9. Role Permissions Table

| Action | Teacher | Student |
|---|:---:|:---:|
| Register / Login | ✅ | ✅ |
| View Classes, Sessions, Quizzes | ✅ | ✅ |
| Create Classes | ✅ | ❌ |
| Update / Delete Classes | ✅ (Creator only) | ❌ |
| Join a Class (`/join`) | ❌ | ✅ |
| Create Sessions | ✅ (Class owner only) | ❌ |
| Update / Delete Sessions | ✅ (Creator only) | ❌ |
| Create Quizzes | ✅ (Class owner only) | ❌ |
| View Quiz Answers (`correctAnswer`) | ✅ | ❌ (Hidden) |
| Update / Delete Quizzes | ✅ (Creator only) | ❌ |
| Submit Quiz Answers | ❌ | ✅ |
| View All Quiz Submissions | ✅ | ❌ |
| View Own Quiz Submissions | ✅ | ✅ (Own only) |
| Mark Session Attendance | ✅ (For any student) | ✅ (Own only, session must be "live") |
| View All Attendance Records | ✅ | ❌ |
| View Own Attendance Records | ✅ | ✅ (Own only) |
| Send Push Notifications to Class | ✅ (Class owner only) | ❌ |
| Socket.io: Start/Stop Screen Share | ✅ | ❌ (Server rejects) |
| Socket.io: Start Quiz broadcast | ✅ | ❌ (Server rejects) |

---

## 🌐 10. List of All REST Endpoints

### Health
- `GET /api/health` - Check API server health (Public)

### Authentication
- `POST /api/auth/register` - Register a new account (`student` or `teacher`) (Public)
- `POST /api/auth/login` - Authenticate with email and password (Public)
- `POST /api/auth/firebase-login` - Login or sign up with a Firebase ID token (Public)
- `PUT /api/auth/fcm-token` - Update FCM push notification token (Authenticated)
- `GET /api/auth/me` - Get profile of the current authenticated user (Authenticated)

### Classes
- `GET /api/classes` - Get all classes (Authenticated)
- `POST /api/classes` - Create a new class (Teacher only)
- `GET /api/classes/:id` - Get class details by ID (Authenticated)
- `PUT /api/classes/:id` - Update class details (Teacher creator only)
- `DELETE /api/classes/:id` - Delete class (Teacher creator only)
- `POST /api/classes/:id/join` - Enroll into class without duplicates (Student only)

### Sessions
- `GET /api/sessions` - Get all sessions; optional filter `?classId=` (Authenticated)
- `POST /api/sessions` - Schedule a live class session (Teacher class owner only)
- `GET /api/sessions/:id` - Get session details by ID (Authenticated)
- `PUT /api/sessions/:id` - Update session (e.g. status: "live" / "ended") (Teacher creator only)
- `DELETE /api/sessions/:id` - Delete session (Teacher creator only)

### Quizzes
- `GET /api/quizzes` - Get all quizzes; optional filter `?classId=` (Authenticated, answers hidden from students)
- `POST /api/quizzes` - Create a new quiz for own class (Teacher only)
- `GET /api/quizzes/:id` - Get single quiz details (Authenticated, answers hidden from students)
- `PUT /api/quizzes/:id` - Update quiz questions/title (Teacher creator only)
- `DELETE /api/quizzes/:id` - Delete quiz (Teacher creator only)

### Submissions
- `POST /api/submissions` - Submit answers and get automatically graded score (Student only)
- `GET /api/submissions` - View all quiz submissions; optional filter `?quizId=` (Teacher only)
- `GET /api/submissions/student/:id` - View submissions for a student (Student self or any Teacher)

### Attendance
- `POST /api/attendance` - Mark attendance (Student self if session is "live"; Teacher for any student)
- `GET /api/attendance` - View all attendance records; optional filter `?sessionId=` (Teacher only)
- `GET /api/attendance/student/:id` - View attendance records for a student (Student self or any Teacher)

### Notifications
- `POST /api/notifications/send` - Send push notification to class topic `class_<classId>` (Teacher class owner only)

---

## ⚡ 11. List of All Socket.io Events

### Client-to-Server
- `join-session` `{ sessionId }`: Joins room `session:<sessionId>` after checking session exists.
- `leave-session` `{ sessionId }`: Leaves room `session:<sessionId>` and notifies participants.
- `start-quiz` `{ sessionId, quizId }`: (Teacher only) Triggers quiz alert to everyone in room.
- `start-screen-share` `{ sessionId }`: (Teacher only) Broadcasts mock screen share start.
- `stop-screen-share` `{ sessionId }`: (Teacher only) Broadcasts mock screen share stop.

### Server-to-Client
- `joined-ok` `{ sessionId, message }`: Confirms room join back to sender.
- `user-joined` `{ userId, name, role }`: Broadcast to room when another user joins.
- `user-left` `{ userId, name, role }`: Broadcast to room when a user leaves or disconnects.
- `participants` `[ { userId, name, role }, ... ]`: Current active participants in the room.
- `quiz-started` `{ quizId, startedBy }`: Sent to room when a teacher starts a quiz.
- `screen-share-started` `{ by }`: Sent to room when a teacher begins mock screen sharing.
- `screen-share-stopped`: Sent to room when a teacher ends mock screen sharing.
- `error-message` `{ message }`: Sent to socket when an unauthorized action or invalid input occurs.

---

## 🔄 12. Example User Flow

1. **Join Classroom**: Student joins a live session room via Socket.io (`join-session`).
2. **Take Quiz**: Student receives the quiz broadcast via Socket.io (`quiz-started`), answers questions, and submits (`POST /api/submissions`).
3. **Grading**: Server compares answers against `correctAnswer` indices and records the final score.
4. **Mark Attendance**: Student marks attendance while the session is "live" (`POST /api/attendance`).

---

## ☁️ 13. Deployment on Render

To deploy ClassLive to [Render](https://render.com) as a Web Service:

1. **Create Web Service**:
   - Link your GitHub repository.
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
2. **Environment Variables**:
   Under the service **Environment** settings, configure:
   - **Do not set PORT.** Render provides it automatically and the server reads `process.env.PORT`.
   - `MONGO_URI`: Your production MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random secret string.
   - `FCM_DRY_RUN`: `false` (or `true` for simulated notifications).
   - `FIREBASE_SERVICE_ACCOUNT_JSON`: Paste the entire contents of your `firebase-service-account.json` file as a single-line JSON string.
3. **Verify Deployment**:
   - Visit: `https://<your-render-subdomain>.onrender.com/api/health`
   - Test API Docs: `https://<your-render-subdomain>.onrender.com/api-docs/`

> **Note**: Render's free tier sleeps after inactivity, so the first request may take about a minute to respond.
