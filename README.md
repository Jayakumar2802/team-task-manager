# Team Task Manager - Setup Instructions

## Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **MySQL** or **PostgreSQL** database

---

## Database Setup

### Option 1: MySQL

1. Install MySQL if not already installed
2. Create the database:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE team_task_manager;
```

3. Import the schema:

```bash
mysql -u root -p team_task_manager < database_schema.sql
```

### Option 2: PostgreSQL

1. Install PostgreSQL if not already installed
2. Create the database:

```bash
psql -U postgres
```

```sql
CREATE DATABASE team_task_manager;
```

3. Update the SQL schema for PostgreSQL (replace `AUTO_INCREMENT` with `SERIAL`)

---

## Backend Setup

### 1. Navigate to backend directory

```bash
cd backend
```

### 2. Create virtual environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=mysql+pymysql://root:your_password@localhost/team_task_manager
SECRET_KEY=your-secret-key-change-in-production
```

> **Note:** Update `your_password` with your actual MySQL password

### 5. Run the backend server

```bash
python main.py
```

The API will be available at `http://localhost:8000`

---

## Frontend Setup

### 1. Navigate to frontend directory

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

---

## API Documentation

Once the backend is running, visit:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

## Testing the Application

1. Start MySQL/PostgreSQL
2. Run backend: `python main.py` (from backend directory)
3. Run frontend: `npm run dev` (from frontend directory)
4. Open `http://localhost:3000` in your browser
5. Sign up with a new account
6. Create a project
7. Add members and create tasks

---

## Project Structure

```
team-task-manager/
├── backend/
│   ├── app/
│   │   ├── auth/          # Authentication utilities
│   │   ├── database/      # Database configuration
│   │   ├── models/        # SQLAlchemy models
│   │   ├── routers/       # API endpoints
│   │   └── schemas/       # Pydantic schemas
│   ├── main.py            # FastAPI application
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # Auth context
│   │   ├── pages/         # Page components
│   │   └── services/      # API services
│   ├── package.json       # Node dependencies
│   └── vite.config.js     # Vite configuration
├── database_schema.sql    # Database schema
└── README.md              # This file
```

---

## Troubleshooting

### Database Connection Error

- Verify MySQL/PostgreSQL is running
- Check credentials in `.env` file
- Ensure database exists

### CORS Error

- Update `allow_origins` in `main.py` if using a different port

### Token Expiration

- JWT tokens expire after 30 minutes
- Re-login to get a new token

---

## Default Users

After signing up, the first user will be a regular member. To create an admin:

1. Sign up through the API
2. Manually update the role in the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your_email';
```