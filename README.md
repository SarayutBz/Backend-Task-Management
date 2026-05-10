# Mini Task Manager

ระบบจัดการงานแบบ Kanban สำหรับทีม สร้างด้วย Vue 3 + Node.js + MySQL

## Tech Stack

**Frontend** — Vue 3, TypeScript, Pinia, Vue Router, Axios  
**Backend**  — Node.js, Express, MySQL2, JWT, bcryptjs  
**DevOps**   — Docker Compose, GitHub Actions CI/CD

## Features

- ระบบ Auth ด้วย JWT (register / login)
- สร้างและจัดการ Project
- เชิญสมาชิกและกำหนด Role (owner / member)
- Kanban board — drag card เปลี่ยน status ได้
- Task detail — assign, due date, description
- Comment ใน task
- Role-based access control ทุก endpoint

## Architecture

```
frontend/          Vue 3 + TypeScript + Pinia
backend/
  src/
    config/        MySQL connection pool
    middleware/    JWT auth + role guard
    routes/        auth / projects / tasks / members / comments
sql/
  schema.sql       DDL ทุก table
  seed.sql         Mock data
docker-compose.yml MySQL + Backend
```

## Getting Started

### รันด้วย Docker (แนะนำ)

```bash
git clone https://github.com/SarayutBz/task-manager.git
cd task-manager
docker compose up -d
```

- Backend: http://localhost:3000  
- Frontend: http://localhost:5173 (รัน dev server แยก)

### รัน Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### รัน Backend แบบ manual

```bash
cd backend
cp .env.example .env   # แก้ DB config ให้ตรง
mysql -u root -p < sql/schema.sql
mysql -u root -p < sql/seed.sql
npm run dev
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | สมัครสมาชิก |
| POST | /api/auth/login | เข้าสู่ระบบ |
| GET | /api/projects | ดู projects ทั้งหมด |
| POST | /api/projects | สร้าง project |
| GET | /api/tasks/:projectId | ดู board |
| POST | /api/tasks/:projectId | สร้าง task |
| PATCH | /api/tasks/:taskId/move | ย้าย task |
| POST | /api/members/:projectId | เชิญ member |
| GET | /api/comments/:taskId | ดู comments |
| POST | /api/comments/:taskId | เพิ่ม comment |

## Database Schema

<img width="907" height="745" alt="Image" src="https://github.com/user-attachments/assets/7a4c5675-1b1b-4364-8197-5813480501da" />
