# Student Management System API

Backend system to manage university students using FastAPI.
Focus on security, performance, and clean architecture.

---

## Overview

This project provides a RESTful API for managing student records.
It supports authentication, role-based access, advanced querying, and system monitoring.

You will build and run a complete backend system used in real applications.

---

## Features

* JWT authentication
* Role-based authorization
* Full CRUD for students
* Filtering by department and GPA
* Pagination support
* Students access only their own data
* Redis caching for performance
* Structured logging system
* Monitoring dashboard
* Pytest testing
* Docker support
* Simple frontend integration

---

## Tech Stack

* FastAPI
* PostgreSQL
* Redis
* SQLAlchemy
* Pydantic
* Pytest
* Docker

---

## Project Structure

```
app/
  core/
  db/
  models/
  schemas/
  routes/
  services/
  utils/
  cache/
  middlewares/
  monitoring/

tests/
docker/
scripts/
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/student-management-system.git
cd student-management-system
```

---

### 2. Create environment variables

Create `.env` file

```
DATABASE_URL=postgresql://user:password@localhost:5432/db
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REDIS_URL=redis://localhost:6379
```

---

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

### 4. Run the server

```bash
uvicorn app.main:app --reload
```

API will run on
[http://127.0.0.1:8000](http://127.0.0.1:8000)

Docs available at
[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## Docker Setup

Run full system

```bash
docker compose up --build
```

This will start

* FastAPI app
* PostgreSQL
* Redis

---

## API Overview

### Authentication

* POST /auth/register
* POST /auth/login

---

### Students

* GET /students
* GET /students/{id}
* POST /students
* PUT /students/{id}
* DELETE /students/{id}

---

## Roles

Admin

* Full control over students

Student

* View and update own profile only

---

## Testing

Run tests

```bash
pytest
```

Tests cover

* authentication
* protected routes
* CRUD operations
* edge cases

---

## Caching

* Redis used for GET requests
* Cache invalidated on update or delete

---

## Logging and Monitoring

Logs include

* API requests
* response time
* errors

Monitoring shows

* request count
* error rate
* system status

---

## License

This project is for educational use.
