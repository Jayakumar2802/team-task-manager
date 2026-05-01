# 🧑‍💻 Team Task Manager (Full-Stack Application)

A full-stack web application to manage team projects and tasks.  
Users can create projects, assign tasks, track progress, and collaborate efficiently.

---

## 🚀 Live Demo

- 🌐 Frontend: https://team-task-manager-production-95c1.up.railway.app
- ⚙️ Backend API: https://pleasant-growth-production-0af0.up.railway.app
- 📘 API Docs (Swagger): https://pleasant-growth-production-0af0.up.railway.app/docs

---

## 🧩 Features

### 🔐 Authentication
- User signup & login
- JWT-based authentication
- Secure password hashing

### 📁 Project Management
- Create projects
- Add/remove team members
- Role-based access (Admin / Member)

### ✅ Task Management
- Create tasks
- Assign tasks to users
- Update task status:
  - To Do
  - In Progress
  - Done
- Set priority:
  - Low / Medium / High

### 📊 Dashboard
- Total tasks overview
- Tasks by status
- Tasks per user
- Overdue tasks tracking

### 🔔 Additional Features
- Comments on tasks
- File attachments
- Notifications
- Activity logs

---

## 🛠️ Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- Axios
- React Router
- Recharts

### Backend
- Python (FastAPI)
- SQLAlchemy ORM
- JWT Authentication

### Database
- PostgreSQL (Railway)

### Deployment
- Railway (Frontend + Backend + DB)

---

## 📁 Project Structure

team-task-manager/
│
├── backend/
│ ├── app/
│ │ ├── models/
│ │ ├── routers/
│ │ ├── schemas/
│ │ └── database/
│ ├── main.py
│ └── requirements.txt
│
├── frontend/
│ ├── src/
│ ├── components/
│ ├── pages/
│ ├── services/
│ └── package.json
│
└── README.md


---

## ⚙️ Setup Instructions (Local)

### 🔹 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/team-task-manager.git
cd team-task-manager
```

2. Backend Setup

cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt

Create .env file:
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key

Run backend:
python main.py

3. Frontend Setup

cd frontend
npm install
npm run dev
