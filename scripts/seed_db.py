import sys
import os
from datetime import date, timedelta
import random

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.user import User
from app.models.student import Student
from app.utils.hashing import hash_password

def seed():
    db = SessionLocal()
    try:
        print("Cleaning up old data...")
        db.query(Student).delete()
        db.query(User).delete()
        db.commit()

        print("Creating Admin user...")
        admin = User(
            email="admin@example.com",
            password=hash_password("admin123"),
            role="admin"
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

        print("Creating Sample Students...")
        departments = ["Computer Science", "Engineering", "Business", "Medicine", "Arts"]
        genders = ["male", "female"]
        statuses = ["active", "active", "active", "graduated", "suspended"]
        
        first_names = ["Ahmed", "Sara", "Mohamed", "Mona", "Omar", "Layla", "Youssef", "Nour", "Khaled", "Hana"]
        last_names = ["Ali", "Hassan", "Ibrahim", "Zaki", "Mansour", "Said", "Fahmy", "Salem"]

        for i in range(1, 16):
            student_user = User(
                email=f"student{i}@example.com",
                password=hash_password("password123"),
                role="student"
            )
            db.add(student_user)
            db.commit()
            db.refresh(student_user)

            student = Student(
                university_id=f"2024{i:04d}",
                name=f"{random.choice(first_names)} {random.choice(last_names)}",
                birth_date=date(2000, 1, 1) + timedelta(days=random.randint(0, 1000)),
                gender=random.choice(genders),
                phone_number=f"+2010{random.randint(10000000, 99999999)}",
                gpa=round(random.uniform(2.0, 4.0), 2),
                department=random.choice(departments),
                enrollment_date=date(2024, 9, 1),
                status=random.choice(statuses),
                user_id=student_user.id
            )
            db.add(student)
        
        db.commit()
        print(f"Successfully seeded 15 students and 16 users!")
        print("Admin Credentials: admin@example.com / admin123")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
