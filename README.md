# TaskFlow — Team Task Manager

A production-ready full-stack MERN application for managing projects, assigning tasks, and tracking team progress with role-based access control.

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| HTTP Client | Axios |

---

## 📁 Project Structure

```
naukari-assesment/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Auth logic
│   │   ├── projectController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT verification
│   │   └── roleMiddleware.js  # Role-based access
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   └── taskRoutes.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── api.js          # Axios client + all API calls
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── TaskCard.jsx
    │   │   ├── ProjectCard.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx # Global auth state
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Projects.jsx
    │   │   └── ProjectPage.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    └── package.json
```

---

## ⚙️ Environment Variables

### Backend — `backend/.env`
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/team-task-manager?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
```

### Frontend — `frontend/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🛠️ Local Setup & Run

### 1. Clone / open the project
```bash
cd naukari-assesment
```

### 2. Setup & start the Backend
```bash
cd backend
npm install
# Copy and fill in your env vars
copy .env.example .env
npm run dev
```
> Backend runs at **http://localhost:5000**

### 3. Setup & start the Frontend
```bash
cd frontend
npm install
# Copy and fill in your env vars
copy .env.example .env
npm run dev
```
> Frontend runs at **http://localhost:5173**

---

## 🔗 API Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/auth/me` | Private | Get current user |
| GET | `/api/auth/users` | Private | Get all users |

### Projects
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/projects` | Admin | Create project |
| GET | `/api/projects` | Private | Get projects |
| GET | `/api/projects/:id` | Private | Get project |
| DELETE | `/api/projects/:id` | Admin | Delete project |
| PATCH | `/api/projects/:id/members` | Admin | Add member |

### Tasks
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/tasks/stats` | Private | Dashboard stats |
| POST | `/api/tasks` | Admin | Create task |
| GET | `/api/tasks` | Private | Get tasks |
| PATCH | `/api/tasks/:id` | Private | Update task |
| DELETE | `/api/tasks/:id` | Admin | Delete task |

---

## 👥 Role-Based Access

| Feature | Admin | Member |
|---------|-------|--------|
| Create/Delete Projects | ✅ | ❌ |
| Add members to project | ✅ | ❌ |
| Create/Delete Tasks | ✅ | ❌ |
| View all tasks | ✅ | ❌ |
| View assigned tasks | ✅ | ✅ |
| Update task status | ✅ | ✅ |

---

## 🚀 Railway Deployment

### Backend
1. Create a new Railway project
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Add environment variables:
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — a secure random string
   - `PORT` — Railway sets this automatically
5. Deploy!

### Frontend
1. Create another Railway service (or use Vercel/Netlify)
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   - `VITE_API_URL` — your deployed backend URL (e.g. `https://your-backend.railway.app/api`)
4. Build command: `npm run build`
5. Output directory: `dist`

### MongoDB
Use **MongoDB Atlas** (free tier):
1. Create cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Whitelist all IPs: `0.0.0.0/0` (for Railway)
3. Copy the connection string into `MONGO_URI`

---

## 📋 Features

- 🔐 **JWT Authentication** — Secure signup/login with bcrypt password hashing
- 👥 **Role-Based Access Control** — Admin and Member roles with granular permissions
- 📁 **Project Management** — Create, delete, and add members to projects
- ✅ **Task Management** — Create tasks, assign to members, set deadlines
- 📊 **Dashboard** — Live stats: total, completed, pending, overdue tasks
- 🎨 **Dark UI** — Premium dark-mode design with Tailwind CSS
- 📱 **Responsive** — Works on mobile, tablet, and desktop
