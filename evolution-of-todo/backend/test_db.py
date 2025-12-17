#!/usr/bin/env python
"""Test database connectivity."""
import asyncio
from sqlalchemy import select

async def main():
    try:
        from src.db.database import engine, async_session
        from src.models.task import Task

        print("[*] Testing database connection...")

        # Test connection
        async with async_session() as session:
            result = await session.execute(select(Task))
            tasks = result.scalars().all()
            print(f"[+] Successfully queried database. Found {len(tasks)} tasks")

        print("[+] Test passed!")

    except Exception as e:
        print(f"[-] Error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
