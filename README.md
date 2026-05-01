# Team Task Manager - Setup Instructions

## Prerequisites

* Node.js (v18 or higher)
* Python (v3.10 or higher)
* MySQL database

---

## Database Setup

### MySQL

```bash
mysql -u root -p
```

```sql
CREATE DATABASE team_task_manager;
```

```bash
mysql -u root -p team_task_manager < database_schema.sql
```

```sql
CREATE DATABASE team_task_manager;
```

---

## Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` file:

```env
DATABASE_URL=mysql+pymysql://root:your_password@localhost/team_task_manager
SECRET_KEY=your-secret-key
```

Run backend:

```bash
python main.py
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Run Application

* Backend → http://localhost:8000
* Frontend → http://localhost:3000

---

## Features

* Authentication (JWT)
* Project Management
* Task Assignment
* Dashboard Analytics
* Role-Based Access

---

## Tech Stack

* React.js
* FastAPI
* MySQL

---

## Author

Jayakumar
