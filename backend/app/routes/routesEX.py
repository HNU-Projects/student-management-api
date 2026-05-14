# # Student Routes — Explanation

# This file contains all API routes related to **students** in a FastAPI application.
# It supports:

# * Creating students
# * Viewing students
# * Updating students
# * Deleting students
# * Searching & filtering
# * Authentication & authorization
# * Caching

# The file uses:

# * **FastAPI** → API framework
# * **SQLAlchemy** → database operations
# * **Pydantic Schemas** → validation
# * **Caching** → faster responses

# ---

# # Imports

# ```python
# from fastapi import APIRouter, Depends, HTTPException, Query, status
# ```

# ### Important FastAPI utilities:

# * `APIRouter` → groups student routes together
# * `Depends` → injects dependencies like DB/session/user
# * `HTTPException` → returns API errors
# * `Query` → validates query parameters
# * `status` → HTTP status codes

# ---

# ```python
# from sqlalchemy.orm import Session
# from sqlalchemy import func
# ```

# * `Session` → database connection/session
# * `func` → SQL functions like COUNT or AVG

# ---

# ```python
# from app.core.dependencies import get_current_user, get_db, require_admin
# ```

# ### Dependencies

# * `get_db` → provides database session
# * `get_current_user` → authenticates logged-in user
# * `require_admin` → allows admins only

# ---

# ```python
# from app.models.student import Student
# from app.models.user import User
# ```

# Database models.

# * `Student` → students table
# * `User` → users table

# ---

# ```python
# from app.schemas.student import StudentCreate, StudentResponse, StudentUpdate
# ```

# Pydantic schemas for validation.

# * `StudentCreate` → request body for create
# * `StudentResponse` → returned response
# * `StudentUpdate` → update data

# ---

# # Router & Logger

# ```python
# router = APIRouter()
# logger = get_logger(__name__)
# ```

# * `router` stores all student endpoints
# * `logger` records important actions

# ---

# # CREATE STUDENT

# ```python
# @router.post("/")
# ```

# Endpoint:

# ```http
# POST /students/
# ```

# Creates a new student record.

# ---

# ## Main Logic

# ### 1) Permission Check

# ```python
# if current_user.role != "admin" and payload.user_id != current_user.id:
# ```

# * Admin can create for anyone
# * Normal users can create only their own record

# ---

# ### 2) Verify User Exists

# ```python
# db.query(User).filter(User.id == payload.user_id).first()
# ```

# Checks that the target user exists.

# ---

# ### 3) Prevent Duplicate Records

# ```python
# db.query(Student).filter(Student.user_id == payload.user_id)
# ```

# One user cannot have multiple student profiles.

# ---

# ### 4) Unique University ID

# ```python
# Student.university_id == payload.university_id
# ```

# Ensures every university ID is unique.

# ---

# ### 5) Create & Save Student

# ```python
# student = Student(**payload.model_dump())
# ```

# Converts request data into Student object.

# Then:

# ```python
# db.add(student)
# db.commit()
# db.refresh(student)
# ```

# * `add()` → adds to session
# * `commit()` → saves in DB
# * `refresh()` → reloads updated object

# ---

# ### 6) Logging

# ```python
# logger.info(...)
# ```

# Stores audit information.

# ---

# ### 7) Cache Invalidation

# ```python
# cache_manager.invalidate_prefix("students:list")
# ```

# Clears old cached student lists after adding new data.

# ---

# # LIST STUDENTS

# ```python
# @router.get("/")
# ```

# Endpoint:

# ```http
# GET /students/
# ```

# Returns all students.

# Admin only:

# ```python
# Depends(require_admin)
# ```

# ---

# # Filters

# The endpoint supports optional filters:

# ### Search

# ```python
# search
# ```

# Searches by:

# * student name
# * university ID

# Using:

# ```python
# ilike()
# ```

# for case-insensitive matching.

# ---

# ### Department Filter

# ```python
# Student.department == department
# ```

# ---

# ### Status Filter

# ```python
# Student.status == status
# ```

# ---

# ### GPA Filters

# ```python
# Student.gpa >= gpa_min
# Student.gpa <= gpa_max
# ```

# ---

# # Pagination

# ```python
# offset(skip).limit(limit)
# ```

# Example:

# ```http
# GET /students/?skip=10&limit=5
# ```

# * Skip first 10 students
# * Return next 5

# ---

# # GET MY PROFILE

# ```python
# @router.get("/me")
# ```

# Endpoint:

# ```http
# GET /students/me
# ```

# Returns the logged-in user's own student profile.

# ---

# # GET STUDENT BY ID

# ```python
# @router.get("/{student_id}")
# ```

# Example:

# ```http
# GET /students/5
# ```

# Returns a specific student.

# ---

# # Caching

# First checks cache:

# ```python
# cache_manager.get_json(cache_key)
# ```

# If found → returns cached data directly.

# If not found → queries database.

# ---

# # Permission Check

# ```python
# if current_user.role != "admin" and student.user_id != current_user.id:
# ```

# * Admin can view everyone
# * Students can view only themselves

# ---

# # Cache Storage

# ```python
# cache_manager.set_json(cache_key, student_data)
# ```

# Stores student data for faster future requests.

# ---

# # Important Concepts Used

# | Concept        | Purpose                               |
# | -------------- | ------------------------------------- |
# | Authentication | Verify logged-in user                 |
# | Authorization  | Control permissions                   |
# | Validation     | Validate request data                 |
# | ORM            | Interact with DB using Python objects |
# | Caching        | Improve performance                   |
# | Pagination     | Reduce large responses                |
# | Logging        | Track actions                         |

# ---

# # Overall Flow

# Example when creating a student:

# 1. Authenticate user
# 2. Validate request body
# 3. Check permissions
# 4. Verify user exists
# 5. Prevent duplicates
# 6. Save student to DB
# 7. Clear cache
# 8. Return response
