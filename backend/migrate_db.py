#!/usr/bin/env python
"""Migrate database to add missing columns."""
import asyncio

async def main():
    try:
        from src.db.database import engine
        from sqlalchemy import text

        print("[*] Migrating database...")

        async with engine.begin() as conn:
            # Add missing tags column if it doesn't exist
            try:
                await conn.execute(text("""
                    ALTER TABLE tasks
                    ADD COLUMN IF NOT EXISTS tags TEXT
                """))
                print("[+] Added 'tags' column")
            except Exception as e:
                print(f"[!] Column 'tags' may already exist: {str(e)}")

            # Verify table structure
            result = await conn.execute(text("""
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_name = 'tasks'
                ORDER BY ordinal_position
            """))

            print("[+] Current table structure:")
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
