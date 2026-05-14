# # Small Dream Summary for `student.py` ☕✨

# Imagine we have a university system,
# and the backend needs to manage student data in a clean and organized way.

# Instead of every route handling data differently,
# we created a file called:

# # `student.py`

# Its job is:

# # Defining the shape of student data

# It decides:

# * what data the user must send
# * what data is optional
# * what data the API should return

# ---

# # We have 4 main classes 👀

# ---

# # 1. StudentBase

# This is:

# # The parent/base class

# It contains all common student fields like:

# * university_id
# * name
# * GPA
# * department
# * birth_date
# * enrollment_date
# * status

# It also includes validation like:

# ```python
# gpa: float = Field(ge=0, le=4.0)
# ```

# This means GPA must be between 0 and 4.0 only.

# --------------------------------------------------

# # 2. StudentCreate

# This is used for:

# # Creating a new student

# When we do:

# ```text
# POST /students
# ```

# it takes everything from `StudentBase`
# and adds:

# ```python
# user_id
# ```

# because every student is linked to a user account.

# --------------------------------------------------

# # 3. StudentUpdate

# This is used for:

# # Updating student data

# For example:

# ```text
# PUT /students/{id}
# ```

# All fields here are:

# # Optional

# because when updating,
# we may only want to change one field like phone number,
# not send everything again.

# --------------------------------------------------

# # 4. StudentResponse

# This is used for:

# # Returning data to the user

# Like in:

# ```text
# GET /students
# ```

# It inherits from `StudentBase`
# and adds:

# * `id`
# * `user_id`

# because these come from the database.

# ---

# # The most important line 

# ```python
# model_config = ConfigDict(from_attributes=True)
# ```

# This helps Pydantic read data directly from
# SQLAlchemy objects.

# Because:

# * SQLAlchemy returns Python objects
# * Pydantic converts them into clean JSON responses

# Without this line, errors may happen.

# ---

# # Final Summary

# This file is basically:

# # The manager of student data

# It handles:

# * input
# * update
# * output

# It keeps the code clean, safe, and professional 
