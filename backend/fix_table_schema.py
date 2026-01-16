#!/usr/bin/env python
"""Fix the tasks table schema - recreate with correct id type."""
import asyncio

async def main():
    try:
        from src.db.database import engine
        from sqlalchemy import text
        from src.models.task import Task

        print("[*] Fixing database table schema...")

        async with engine.begin() as conn:
            # Check if tasks table has any data
            result = await conn.execute(text("SELECT COUNT(*) FROM tasks"))
            count = result.scalar()
            print(f"[*] Current task count: {count}")

            if count == 0:
                print("[*] Table is empty, dropping and recreating...")

                # Drop the existing table
                await conn.execute(text("DROP TABLE IF EXISTS tasks CASCADE"))
                print("[+] Dropped existing tasks table")
            else:
                print("[!] Table has data, creating migration...")
                # Create a backup table
                await conn.execute(text("""
                    CREATE TABLE tasks_backup AS SELECT * FROM tasks
                """))
                print("[+] Created backup table (tasks_backup)")

                # Drop the existing table
                await conn.execute(text("DROP TABLE tasks CASCADE"))
                print("[+] Dropped existing tasks table")

                # Create new table with correct schema
                await conn.execute(text("""
                    CREATE TABLE tasks (
                        id SERIAL PRIMARY KEY,
                        description VARCHAR NOT NULL,
                        is_completed BOOLEAN DEFAULT FALSE,
                        priority VARCHAR DEFAULT 'medium',
                        tags TEXT,
                        due_date TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))
                print("[+] Created new tasks table with correct schema")

                # Copy data from backup (excluding id, let new ones auto-generate)
                await conn.execute(text("""
                    INSERT INTO tasks (description, is_completed, priority, tags, due_date, created_at, updated_at)
                    SELECT description, is_completed, priority, tags, due_date, created_at, updated_at
                    FROM tasks_backup
                """))
                print("[+] Migrated data from backup table")

                # Drop backup table
                await conn.execute(text("DROP TABLE tasks_backup"))
                print("[+] Removed backup table")

            # Verify table structure
            result = await conn.execute(text("""
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_name = 'tasks'
                ORDER BY ordinal_position
            """))

            print("[+] Updated table structure:")
            for row in result.fetchall():
                print(f"    - {row[0]}: {row[1]}")

        print("[+] Schema fix complete!")
        await engine.dispose()

    except Exception as e:
        print(f"[-] Error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
