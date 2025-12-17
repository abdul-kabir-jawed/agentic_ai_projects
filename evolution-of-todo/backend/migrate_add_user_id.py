#!/usr/bin/env python
"""Migrate database to add user_id foreign key to tasks."""
import asyncio

async def main():
    try:
        from src.db.database import engine, init_db
        from sqlalchemy import text

        print("[*] Initializing database and adding user_id column to tasks table...")

        # First, ensure all tables are created
        await init_db()
        print("[+] Database tables initialized")

        async with engine.begin() as conn:
            # Add user_id column if it doesn't exist (without foreign key for now)
            try:
                await conn.execute(text("""
                    ALTER TABLE tasks
                    ADD COLUMN IF NOT EXISTS user_id INTEGER
                """))
                print("[+] Added 'user_id' column")
            except Exception as e:
                if "already exists" in str(e).lower():
                    print("[+] Column 'user_id' already exists")
                else:
                    print(f"[!] Error: {str(e)}")

        # Now add the foreign key constraint
        async with engine.begin() as conn:
            try:
                await conn.execute(text("""
                    ALTER TABLE tasks
                    ADD CONSTRAINT fk_tasks_user_id FOREIGN KEY (user_id) REFERENCES users(id)
                """))
                print("[+] Added foreign key constraint")
            except Exception as e:
                if "already exists" in str(e).lower():
                    print("[+] Foreign key constraint already exists")
                else:
                    print(f"[!] Note: {str(e)}")

        # Create index for user_id
        async with engine.begin() as conn:
            try:
                await conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)
                """))
                print("[+] Created index on 'user_id'")
            except Exception as e:
                print(f"[!] Index may already exist: {str(e)}")

        # Verify table structure
        async with engine.begin() as conn:
            result = await conn.execute(text("""
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_name = 'tasks'
                ORDER BY ordinal_position
            """))

            print("[+] Updated table structure:")
            for row in result.fetchall():
                print(f"    - {row[0]}: {row[1]}")

        print("[+] Migration complete!")
        await engine.dispose()

    except Exception as e:
        print(f"[-] Error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
