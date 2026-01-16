#!/usr/bin/env python3
"""Add profile_picture_url column to users table."""
import os
from dotenv import load_dotenv
from sqlalchemy import text, create_engine

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("NEON_DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL or NEON_DATABASE_URL must be set")

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    # Check if column exists
    check_query = text("""
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'users'
            AND column_name = 'profile_picture_url'
        )
    """)

    result = conn.execute(check_query)
    exists = result.scalar()

    if not exists:
        print("Adding profile_picture_url column to users table...")
        alter_query = text("""
            ALTER TABLE users ADD COLUMN profile_picture_url TEXT DEFAULT NULL;
        """)
        conn.execute(alter_query)
        conn.commit()
        print("[OK] Column added successfully!")
    else:
        print("[OK] Column profile_picture_url already exists")

engine.dispose()
print("Done!")
