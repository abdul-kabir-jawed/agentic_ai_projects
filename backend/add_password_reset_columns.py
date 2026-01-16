#!/usr/bin/env python
"""Add password reset columns to users table."""
import sqlite3
import time

def add_columns():
    """Add password_reset_token and password_reset_expires columns to users table."""
    db_path = "todo_app.db"

    # Retry logic in case database is locked
    for attempt in range(5):
        try:
            conn = sqlite3.connect(db_path, timeout=5.0)
            cursor = conn.cursor()

            # Check if columns already exist
            cursor.execute("PRAGMA table_info(users)")
            columns = {col[1] for col in cursor.fetchall()}

            if 'password_reset_token' not in columns:
                print("Adding password_reset_token column...")
                cursor.execute("ALTER TABLE users ADD COLUMN password_reset_token TEXT")
            else:
                print("password_reset_token column already exists")

            if 'password_reset_expires' not in columns:
                print("Adding password_reset_expires column...")
                cursor.execute("ALTER TABLE users ADD COLUMN password_reset_expires TEXT")
            else:
                print("password_reset_expires column already exists")

            conn.commit()
            conn.close()
            print("Columns added successfully!")
            return True
        except sqlite3.OperationalError as e:
            if "database is locked" in str(e) and attempt < 4:
                print(f"Database locked, retrying in 2 seconds... (attempt {attempt + 1}/5)")
                time.sleep(2)
            else:
                print(f"Error: {e}")
                return False
        except Exception as e:
            print(f"Unexpected error: {e}")
            return False

if __name__ == "__main__":
    add_columns()
