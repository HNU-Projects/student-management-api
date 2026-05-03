from sqlalchemy import text
from app.db.session import SessionLocal
from app.models.student import Student

def clear_students():
    db = SessionLocal()
    try:
        db.execute(text("TRUNCATE TABLE students CASCADE"))
        db.commit()
        print("Students table cleared successfully.")
    except Exception as e:
        print(f"Error clearing table: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clear_students()
