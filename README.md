# 🎓 StudentFlow - Student Management System

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A premium, full-stack Student Management System built for the **R & Python** university project. It features a high-performance **FastAPI** backend and a stunning, glassmorphic **Next.js** frontend with full **Arabic & English** internationalization.

---

## ✨ Features

### 🔐 Security & Identity
- **JWT Authentication**: Secure token-based authentication with auto-refresh and secure storage.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `Admin` and `Student` roles.
- **Identity Synchronization**: Changes to student profiles automatically propagate to user identity records.
- **Password Hashing**: Industry-standard Argon2/Bcrypt hashing via Passlib.

### 🏛️ Student Management
- **Full CRUD**: Create, read, update, and delete student records with detailed profiles.
- **Advanced Filtering**: Search students by name, ID, department, or GPA range.
- **Academic Profiles**: Track GPA, enrollment dates, and student status (Active, Graduated, Suspended).
- **Data Validation**: Strict Pydantic models for request validation and response formatting.

### 📊 Admin Monitoring & Audit Logs
- **Live Audit Logs**: Track every single action on the platform (Who, What, When) in real-time.
- **System Health**: Monitor Database, Redis, and API status directly from the admin panel.
- **Performance Metrics**: View request counts, error rates, and response latencies per endpoint.
- **Observability Stack**: Integrated Prometheus scraping and Grafana dashboards.

### 🌍 Modern UI/UX
- **Glassmorphism Design**: A premium, state-of-the-art aesthetic with vibrant colors and subtle gradients.
- **Bi-Directional Support (i18n)**: Seamless switching between **English (LTR)** and **Arabic (RTL)**.
- **Responsive Layout**: Optimized for desktop, tablet, and mobile views.
- **Micro-Animations**: Smooth transitions using Framer Motion for a premium feel.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy 2.x, Alembic |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis 7 (Cache-Aside pattern for student lists) |
| **Auth** | JWT (python-jose), Passlib |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS 4, Framer Motion, Lucide Icons |
| **i18n** | `next-intl` (English & Arabic) |
| **Monitoring** | Prometheus, Grafana, custom In-App Dashboard |
| **DevOps** | Docker, Docker Compose |

---

## 🚀 Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- [Git](https://git-scm.com/)

### Quick Start (Docker)
The easiest way to get the system running is using Docker Compose.

1. **Clone & Enter**:
   ```bash
   git clone https://github.com/Mohamediibra7im/student-management-api.git
   cd student-management-api
   ```

2. **Launch Services**:
   ```bash
   docker compose up --build
   ```

3. **Access**:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Grafana**: [http://localhost:3001](http://localhost:3001) (Admin/Admin)

---

## 🏗️ Project Structure

```text
├── backend/                  # FastAPI backend
│   ├── app/                  # Application core
│   │   ├── routes/           # API Endpoints
│   │   ├── models/           # Database Models
│   │   ├── schemas/          # Pydantic Schemas
│   │   ├── monitoring/       # Metrics & Audit logic
│   │   └── cache/            # Redis Management
│   ├── alembic/              # Database Migrations
│   ├── tests/                # Pytest Suite (49+ tests)
│   └── scripts/              # Data Seeding & Performance Tests
├── frontend/                 # Next.js frontend
│   ├── app/                  # App Router & Layouts
│   ├── features/             # Modular business logic
│   ├── components/           # Reusable UI components
│   ├── messages/             # i18n JSON (En/Ar)
│   └── lib/                  # Axios, Utils, Config
└── monitoring/               # Monitoring configuration (Prometheus/Grafana)
```

---

## 🔑 Default Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `admin123` |
| **Student** | `student@example.com` | `password123` |

---

## 🧪 Testing & Validation

### Backend Tests
The project includes an exhaustive test suite covering all core logic.

```bash
cd backend
pytest tests/ -v
```

### Cache Performance
To verify Redis performance, run the custom performance script:
```bash
python scripts/test_cache_performance.py
```

---

## 📡 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/auth/login` | `POST` | Authenticate user & return JWT |
| `/users/me` | `GET` | Get current user profile |
| `/users/{id}` | `PUT` | [Admin] Update any user record |
| `/students/` | `GET` | [Admin] List students with filters |
| `/students/` | `POST` | Create new student record |
| `/students/{id}` | `PATCH` | Partial update student profile |
| `/monitoring/metrics`| `GET` | [Admin] Get system audit logs & metrics |

---

## 👥 Team Task Distribution

- **Mohamed** — Backend Core (Lead)
- **Nadia** — Authentication & Authorization
- **Haidy** — Student APIs
- **Salah** — Caching + Logging + Monitoring
- **Khairy** — Testing + Frontend + DevOps


---

## 📄 License
This project was developed for **Semester 6 — Project for R & Python** subject.
Educational purposes only.
