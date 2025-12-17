#!/usr/bin/env python
"""Initialize database tables."""
import asyncio
import sys

async def main():
    try:
        from src.db.database import engine, init_db, DATABASE_URL
        from src.models.task import Task

        print("[*] Initializing database...")
        print(f"[*] Database URL: {DATABASE_URL[:50]}...")

        await init_db()

        print("[+] Database initialized successfully!")
        print("[+] Tables created:")
        print("    - tasks")

        await engine.dispose()
        sys.exit(0)
    except Exception as e:
        print(f"[-] Error initializing database: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
