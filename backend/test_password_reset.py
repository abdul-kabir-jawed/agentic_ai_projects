#!/usr/bin/env python
"""Test script for password reset endpoints."""
import requests
import json
import re
import subprocess

BASE_URL = "http://localhost:8000/api/v1"

def extract_reset_code_from_logs():
    """Extract reset code from backend logs."""
    try:
        # Run ps to find Python processes with password reset
        result = subprocess.run(
            ["findstr", "/i", "PASSWORD RESET", "..\\todo_list_hackathon\\evolution-of-todo\\backend\\todo_app.db"],
            capture_output=True,
            text=True,
            timeout=2
        )
        # This won't work - we'll extract it differently
    except:
        pass
    return None

def test_password_reset():
    """Test the complete password reset flow."""

    # Register a new test user
    print("=" * 60)
    print("STEP 1: Registering test user...")
    print("=" * 60)
    register_data = {
        "email": "fulltest.reset@example.com",
        "username": "fulltestreset789",
        "password": "OriginalPassword123",
        "full_name": "Full Test Reset User"
    }

    resp = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    print(f"Status: {resp.status_code}")
    if resp.status_code != 201:
        print(f"Error: {resp.text}")
        return

    user = resp.json()["user"]
    print(f"User registered: {user['email']}")

    # Step 2: Request password reset
    print("\n" + "=" * 60)
    print("STEP 2: Requesting password reset...")
    print("=" * 60)
    reset_request = {"email": "fulltest.reset@example.com"}

    resp = requests.post(f"{BASE_URL}/auth/forgot-password", json=reset_request)
    print(f"Status: {resp.status_code}")

    if resp.status_code != 200:
        print(f"Error: {resp.text}")
        return

    data = resp.json()
    print(f"Message: {data.get('message')}")
    print(f"Email: {data.get('email')}")

    # For testing, we'll extract the code from the database
    # In production, this would be sent via email
    print("\nNote: In production, a reset code would be sent via email.")
    print("For testing, we simulate the code: 123456")
    test_reset_code = "123456"

    # We need to get the actual reset code from the database for testing
    # Let's login first to get a token, then check the reset request
    import sqlite3
    try:
        conn = sqlite3.connect("todo_app.db", timeout=2)
        cursor = conn.cursor()
        cursor.execute("SELECT password_reset_token FROM users WHERE email = ?", ("fulltest.reset@example.com",))
        result = cursor.fetchone()
        if result and result[0]:
            test_reset_code = result[0]
            print(f"Retrieved actual reset code from database: {test_reset_code}")
        conn.close()
    except Exception as e:
        print(f"Could not retrieve code from database: {e}")
        print("Using default test code")

    # Step 3: Verify reset code
    print("\n" + "=" * 60)
    print("STEP 3: Verifying reset code...")
    print("=" * 60)
    verify_request = {
        "email": "fulltest.reset@example.com",
        "code": test_reset_code
    }

    resp = requests.post(f"{BASE_URL}/auth/verify-reset-code", json=verify_request)
    print(f"Status: {resp.status_code}")

    if resp.status_code != 200:
        print(f"Error: {resp.text}")
        return

    data = resp.json()
    print(f"Message: {data.get('message')}")

    # Step 4: Reset password
    print("\n" + "=" * 60)
    print("STEP 4: Resetting password...")
    print("=" * 60)
    reset_data = {
        "email": "fulltest.reset@example.com",
        "code": test_reset_code,
        "new_password": "NewPassword456!"
    }

    resp = requests.post(f"{BASE_URL}/auth/reset-password", json=reset_data)
    print(f"Status: {resp.status_code}")

    if resp.status_code != 200:
        print(f"Error: {resp.text}")
        return

    data = resp.json()
    print(f"Message: {data.get('message')}")

    # Step 5: Try to login with new password
    print("\n" + "=" * 60)
    print("STEP 5: Logging in with new password...")
    print("=" * 60)
    login_data = {
        "username": "fulltestreset789",
        "password": "NewPassword456!"
    }

    resp = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"Status: {resp.status_code}")

    if resp.status_code != 200:
        print(f"Error: {resp.text}")
        return

    data = resp.json()
    print(f"Login successful!")
    print(f"User: {data['user']['username']}")
    print(f"Email: {data['user']['email']}")
    print(f"Access Token: {data['access_token'][:50]}...")

    print("\n" + "=" * 60)
    print("PASSWORD RESET FLOW TEST COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    test_password_reset()
