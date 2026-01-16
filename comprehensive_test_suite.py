#!/usr/bin/env python
"""Comprehensive test suite for Evolution of Todo application."""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"
FRONTEND_URL = "http://localhost:3000"

class ComprehensiveTestSuite:
    """Test all features of the Todo application."""

    def __init__(self):
        """Initialize test suite."""
        import time
        # Create unique usernames based on timestamp
        timestamp = str(int(time.time()))
        self.user1_email = f"e2euser1.{timestamp}@example.com"
        self.user2_email = f"e2euser2.{timestamp}@example.com"
        self.user1_username = f"e2euser1_{timestamp}"
        self.user2_username = f"e2euser2_{timestamp}"

        self.test_results = []
        self.user1_token = None
        self.user2_token = None
        self.user1_id = None
        self.user2_id = None
        self.task_ids = []

    def log_test(self, test_name, passed, details=""):
        """Log test result."""
        status = "[PASS]" if passed else "[FAIL]"
        print(f"{status} | {test_name:<50} | {details}")
        self.test_results.append((test_name, passed, details))

    def print_header(self, title):
        """Print section header."""
        print("\n" + "="*100)
        print(f"  {title}")
        print("="*100)

    # ==================== TEST 1: USER REGISTRATION ====================
    def test_01_user_registration(self):
        """Test user registration for two test users."""
        self.print_header("TEST 1: USER REGISTRATION")

        # Register User 1 with unique credentials
        user1_data = {
            "email": self.user1_email,
            "username": self.user1_username,
            "password": "TestPassword123!",
            "full_name": "E2E Test User 1"
        }

        try:
            resp = requests.post(f"{BASE_URL}/auth/register", json=user1_data)
            if resp.status_code == 201:
                user1 = resp.json()["user"]
                self.user1_id = user1["id"]
                self.user1_token = resp.json()["access_token"]
                self.log_test("User 1 Registration", True, f"ID: {self.user1_id}, Email: {user1['email']}")
            elif resp.status_code == 400:
                # User already exists, try login
                # Login user 1
                login_resp = requests.post(f"{BASE_URL}/auth/login", json={
                    "username": "e2euser1",
                    "password": "TestPassword123!"
                })
                if login_resp.status_code == 200:
                    user1 = login_resp.json()["user"]
                    self.user1_id = user1["id"]
                    self.user1_token = login_resp.json()["access_token"]
                    self.log_test("User 1 Registration", True, f"User already exists - Logged in (ID: {self.user1_id})")
                else:
                    self.log_test("User 1 Registration", False, f"Login failed: {login_resp.status_code}")
            else:
                self.log_test("User 1 Registration", False, f"Status: {resp.status_code}")
                return
        except Exception as e:
            self.log_test("User 1 Registration", False, str(e))
            return

        # Register User 2
        user2_data = {
            "email": self.user2_email,
            "username": self.user2_username,
            "password": "TestPassword123!",
            "full_name": "E2E Test User 2"
        }

        try:
            resp = requests.post(f"{BASE_URL}/auth/register", json=user2_data)
            if resp.status_code == 201:
                user2 = resp.json()["user"]
                self.user2_id = user2["id"]
                self.user2_token = resp.json()["access_token"]
                self.log_test("User 2 Registration", True, f"ID: {self.user2_id}, Email: {user2['email']}")
            elif resp.status_code == 400:
                # User already exists, try login
                self.log_test("User 2 Registration", True, "User already exists (expected)")
                # Login user 2
                login_resp = requests.post(f"{BASE_URL}/auth/login", json={
                    "username": "e2euser2",
                    "password": "TestPassword123!"
                })
                if login_resp.status_code == 200:
                    user2 = login_resp.json()["user"]
                    self.user2_id = user2["id"]
                    self.user2_token = login_resp.json()["access_token"]
                    self.log_test("User 2 Login", True, f"ID: {self.user2_id}")
            else:
                self.log_test("User 2 Registration", False, f"Status: {resp.status_code}")
        except Exception as e:
            self.log_test("User 2 Registration", False, str(e))

    # ==================== TEST 2: LOGIN & AUTHENTICATION ====================
    def test_02_login_authentication(self):
        """Test login and token-based authentication."""
        self.print_header("TEST 2: LOGIN & AUTHENTICATION")

        login_data = {
            "username": "e2euser1",
            "password": "TestPassword123!"
        }

        try:
            resp = requests.post(f"{BASE_URL}/auth/login", json=login_data)
            if resp.status_code == 200:
                data = resp.json()
                token = data["access_token"]
                user = data["user"]
                self.log_test("Login Success", True, f"User: {user['username']}, Token received")

                # Test that token grants access to authenticated endpoints
                headers = {"Authorization": f"Bearer {token}"}
                me_resp = requests.get(f"{BASE_URL}/auth/me", headers=headers)
                if me_resp.status_code == 200:
                    self.log_test("Token Authentication", True, "Token grants access to /me endpoint")
                else:
                    self.log_test("Token Authentication", False, f"Status: {me_resp.status_code}")
            else:
                self.log_test("Login Success", False, f"Status: {resp.status_code}")
        except Exception as e:
            self.log_test("Login Success", False, str(e))

    # ==================== TEST 3: TASK CREATION ====================
    def test_03_task_creation(self):
        """Test creating tasks for users."""
        self.print_header("TEST 3: TASK CREATION")

        # Create task as User 1
        task_data = {
            "description": "E2E Test Task 1 - Buy groceries",
            "is_daily": False,
            "priority": "high"
        }

        headers = {"Authorization": f"Bearer {self.user1_token}"}

        try:
            resp = requests.post(f"{BASE_URL}/tasks", json=task_data, headers=headers)
            if resp.status_code == 201:
                task = resp.json()
                self.task_ids.append(task["id"])
                self.log_test("User 1 Create Task", True, f"Task ID: {task['id']}, Desc: {task['description']}")
            else:
                self.log_test("User 1 Create Task", False, f"Status: {resp.status_code}, Response: {resp.text}")
        except Exception as e:
            self.log_test("User 1 Create Task", False, str(e))

        # Create another task as User 1
        task_data2 = {
            "description": "E2E Test Task 2 - Complete project",
            "is_daily": True,
            "priority": "medium"
        }

        try:
            resp = requests.post(f"{BASE_URL}/tasks", json=task_data2, headers=headers)
            if resp.status_code == 201:
                task = resp.json()
                self.task_ids.append(task["id"])
                self.log_test("User 1 Create 2nd Task", True, f"Task ID: {task['id']}")
            else:
                self.log_test("User 1 Create 2nd Task", False, f"Status: {resp.status_code}")
        except Exception as e:
            self.log_test("User 1 Create 2nd Task", False, str(e))

        # Create task as User 2
        headers2 = {"Authorization": f"Bearer {self.user2_token}"}
        task_data3 = {
            "description": "User 2 Task - Different task",
            "is_daily": False,
            "priority": "low"
        }

        try:
            resp = requests.post(f"{BASE_URL}/tasks", json=task_data3, headers=headers2)
            if resp.status_code == 201:
                task = resp.json()
                self.log_test("User 2 Create Task", True, f"Task ID: {task['id']}")
            else:
                self.log_test("User 2 Create Task", False, f"Status: {resp.status_code}")
        except Exception as e:
            self.log_test("User 2 Create Task", False, str(e))

    # ==================== TEST 4: TASK ISOLATION ====================
    def test_04_task_isolation(self):
        """Test that users only see their own tasks."""
        self.print_header("TEST 4: TASK ISOLATION - USER ONLY SEES OWN TASKS")

        headers1 = {"Authorization": f"Bearer {self.user1_token}"}
        headers2 = {"Authorization": f"Bearer {self.user2_token}"}

        # Get User 1's tasks
        try:
            resp = requests.get(f"{BASE_URL}/tasks", headers=headers1)
            if resp.status_code == 200:
                user1_tasks = resp.json()
                user1_task_count = len(user1_tasks) if isinstance(user1_tasks, list) else user1_tasks.get("total", 0)
                self.log_test("User 1 Task List", True, f"User 1 sees {user1_task_count} tasks (their own)")
            else:
                self.log_test("User 1 Task List", False, f"Status: {resp.status_code}")
        except Exception as e:
            self.log_test("User 1 Task List", False, str(e))

        # Get User 2's tasks
        try:
            resp = requests.get(f"{BASE_URL}/tasks", headers=headers2)
            if resp.status_code == 200:
                user2_tasks = resp.json()
                user2_task_count = len(user2_tasks) if isinstance(user2_tasks, list) else user2_tasks.get("total", 0)
                self.log_test("User 2 Task List", True, f"User 2 sees {user2_task_count} tasks (their own)")
            else:
                self.log_test("User 2 Task List", False, f"Status: {resp.status_code}")
        except Exception as e:
            self.log_test("User 2 Task List", False, str(e))

        # Verify isolation - User 1 should not see User 2's tasks
        try:
            resp = requests.get(f"{BASE_URL}/tasks", headers=headers1)
            user1_tasks = resp.json()

            # Check if User 1's task list contains "User 2 Task"
            has_user2_task = False
            if isinstance(user1_tasks, list):
                has_user2_task = any("User 2" in task.get("description", "") for task in user1_tasks)

            self.log_test(
                "Task Isolation Verified",
                not has_user2_task,
                f"User 1 cannot see User 2's tasks: {not has_user2_task}"
            )
        except Exception as e:
            self.log_test("Task Isolation Verified", False, str(e))

    # ==================== TEST 5: TASK COMPLETION ====================
    def test_05_task_completion(self):
        """Test marking tasks as complete/incomplete."""
        self.print_header("TEST 5: TASK COMPLETION")

        if not self.task_ids:
            self.log_test("Task Completion", False, "No tasks to complete")
            return

        headers = {"Authorization": f"Bearer {self.user1_token}"}
        task_id = self.task_ids[0]

        try:
            update_data = {"is_completed": True}
            resp = requests.patch(f"{BASE_URL}/tasks/{task_id}", json=update_data, headers=headers)
            if resp.status_code == 200:
                task = resp.json()
                self.log_test("Mark Task Complete", True, f"Task {task_id} is now complete: {task.get('is_completed')}")
            else:
                self.log_test("Mark Task Complete", False, f"Status: {resp.status_code}")
        except Exception as e:
            self.log_test("Mark Task Complete", False, str(e))

    # ==================== TEST 6: TASK DELETION ====================
    def test_06_task_deletion(self):
        """Test deleting tasks."""
        self.print_header("TEST 6: TASK DELETION")

        if len(self.task_ids) < 2:
            self.log_test("Task Deletion", False, "Not enough tasks to delete")
            return

        headers = {"Authorization": f"Bearer {self.user1_token}"}
        task_id = self.task_ids[1]

        try:
            resp = requests.delete(f"{BASE_URL}/tasks/{task_id}", headers=headers)
            if resp.status_code in [200, 204]:
                self.log_test("Delete Task", True, f"Task {task_id} deleted successfully")
            else:
                self.log_test("Delete Task", False, f"Status: {resp.status_code}")
        except Exception as e:
            self.log_test("Delete Task", False, str(e))

    # ==================== TEST 7: PROFILE ACCESS ====================
    def test_07_profile_access(self):
        """Test accessing user profile."""
        self.print_header("TEST 7: PROFILE ACCESS")

        headers = {"Authorization": f"Bearer {self.user1_token}"}

        try:
            resp = requests.get(f"{BASE_URL}/auth/me", headers=headers)
            if resp.status_code == 200:
                profile = resp.json()
                self.log_test("Get Profile", True, f"User: {profile['username']}, Email: {profile['email']}")
            else:
                self.log_test("Get Profile", False, f"Status: {resp.status_code}")
        except Exception as e:
            self.log_test("Get Profile", False, str(e))

        # Get user stats
        try:
            resp = requests.get(f"{BASE_URL}/auth/me/stats", headers=headers)
            if resp.status_code == 200:
                stats = resp.json()
                self.log_test(
                    "Get User Stats",
                    True,
                    f"Total: {stats.get('total_tasks', 0)}, Completed: {stats.get('completed_tasks', 0)}"
                )
            else:
                self.log_test("Get User Stats", False, f"Status: {resp.status_code}")
        except Exception as e:
            self.log_test("Get User Stats", False, str(e))

    # ==================== TEST 8: LOGOUT ====================
    def test_08_logout(self):
        """Test logout functionality."""
        self.print_header("TEST 8: LOGOUT")

        headers = {"Authorization": f"Bearer {self.user1_token}"}

        try:
            resp = requests.post(f"{BASE_URL}/auth/logout", headers=headers)
            if resp.status_code == 204:
                self.log_test("Logout", True, "User logged out successfully")

                # Verify token is blacklisted
                me_resp = requests.get(f"{BASE_URL}/auth/me", headers=headers)
                if me_resp.status_code in [401, 403]:
                    self.log_test("Token Blacklist", True, "Token blacklisted after logout")
                else:
                    self.log_test("Token Blacklist", False, f"Token still valid: {me_resp.status_code}")
            else:
                self.log_test("Logout", False, f"Status: {resp.status_code}")
        except Exception as e:
            self.log_test("Logout", False, str(e))

    # ==================== TEST 9: FORGOT PASSWORD ====================
    def test_09_forgot_password(self):
        """Test forgot password flow."""
        self.print_header("TEST 9: FORGOT PASSWORD FLOW")

        # Request password reset
        reset_request = {"email": self.user1_email}

        try:
            resp = requests.post(f"{BASE_URL}/auth/forgot-password", json=reset_request)
            if resp.status_code == 200:
                data = resp.json()
                self.log_test("Request Password Reset", True, f"Message: {data.get('message')}")
            else:
                self.log_test("Request Password Reset", False, f"Status: {resp.status_code}")
                return
        except Exception as e:
            self.log_test("Request Password Reset", False, str(e))
            return

        # Get reset code from database (for testing)
        import sqlite3
        try:
            conn = sqlite3.connect("backend/todo_app.db", timeout=2)
            cursor = conn.cursor()
            cursor.execute(
                "SELECT password_reset_token FROM users WHERE email = ?",
                (self.user1_email,)
            )
            result = cursor.fetchone()
            reset_code = result[0] if result else None
            conn.close()

            if reset_code:
                # Verify reset code
                verify_request = {
                    "email": self.user1_email,
                    "code": reset_code
                }

                resp = requests.post(f"{BASE_URL}/auth/verify-reset-code", json=verify_request)
                if resp.status_code == 200:
                    self.log_test("Verify Reset Code", True, "Reset code verified")
                else:
                    self.log_test("Verify Reset Code", False, f"Status: {resp.status_code}")

                # Complete password reset
                reset_data = {
                    "email": self.user1_email,
                    "code": reset_code,
                    "new_password": "NewPassword456!"
                }

                resp = requests.post(f"{BASE_URL}/auth/reset-password", json=reset_data)
                if resp.status_code == 200:
                    self.log_test("Complete Password Reset", True, "Password reset successfully")
                else:
                    self.log_test("Complete Password Reset", False, f"Status: {resp.status_code}")
            else:
                self.log_test("Verify Reset Code", False, "Could not retrieve reset code")
        except Exception as e:
            self.log_test("Forgot Password Flow", False, str(e))

    # ==================== TEST 10: MULTI-USER SECURITY ====================
    def test_10_multi_user_security(self):
        """Test multi-user security and isolation."""
        self.print_header("TEST 10: MULTI-USER SECURITY & ISOLATION")

        headers1 = {"Authorization": f"Bearer {self.user1_token}"}
        headers2 = {"Authorization": f"Bearer {self.user2_token}"}

        # Test 1: User 1 cannot modify User 2's tasks
        if self.task_ids:
            try:
                task_id = self.task_ids[0]
                update_data = {"description": "Hacked by User 2"}
                resp = requests.patch(f"{BASE_URL}/tasks/{task_id}", json=update_data, headers=headers2)

                # Should fail with 403 Forbidden or 404 Not Found
                is_secure = resp.status_code in [403, 404, 401]
                self.log_test(
                    "User 2 Cannot Modify User 1 Task",
                    is_secure,
                    f"Status: {resp.status_code} (expected 403/404)"
                )
            except Exception as e:
                self.log_test("User 2 Cannot Modify User 1 Task", False, str(e))

        # Test 2: User cannot access other user's profile
        try:
            # Try to access User 1's profile as User 2 (if endpoint allows it, it should return only User 2's data)
            resp = requests.get(f"{BASE_URL}/auth/me", headers=headers2)
            if resp.status_code == 200:
                profile = resp.json()
                # Should get User 2's profile, not User 1's
                is_own_profile = profile["username"] == "e2euser2"
                self.log_test(
                    "User Gets Own Profile Only",
                    is_own_profile,
                    f"User 2 sees own profile: {is_own_profile}"
                )
            else:
                self.log_test("User Gets Own Profile Only", False, f"Status: {resp.status_code}")
        except Exception as e:
            self.log_test("User Gets Own Profile Only", False, str(e))

        # Test 3: Invalid token access
        invalid_headers = {"Authorization": "Bearer invalid_token_12345"}
        try:
            resp = requests.get(f"{BASE_URL}/auth/me", headers=invalid_headers)
            is_secure = resp.status_code in [401, 403]
            self.log_test(
                "Invalid Token Rejected",
                is_secure,
                f"Status: {resp.status_code} (expected 401/403)"
            )
        except Exception as e:
            self.log_test("Invalid Token Rejected", False, str(e))

    # ==================== MAIN TEST RUNNER ====================
    def run_all_tests(self):
        """Run all tests."""
        print("\n" + "="*100)
        print("  EVOLUTION OF TODO - COMPREHENSIVE TEST SUITE")
        print("  Testing: Registration, Login, Tasks, Isolation, Profile, Security, Password Reset")
        print("="*100)

        self.test_01_user_registration()
        self.test_02_login_authentication()
        self.test_03_task_creation()
        self.test_04_task_isolation()
        self.test_05_task_completion()
        self.test_06_task_deletion()
        self.test_07_profile_access()
        self.test_08_logout()
        self.test_09_forgot_password()
        self.test_10_multi_user_security()

        self.print_summary()

    def print_summary(self):
        """Print test summary."""
        self.print_header("TEST SUMMARY")

        passed = sum(1 for _, p, _ in self.test_results if p)
        total = len(self.test_results)

        for test_name, passed_test, details in self.test_results:
            status = "[+]" if passed_test else "[-]"
            print(f"{status} | {test_name:<50} | {details}")

        print("\n" + "="*100)
        print(f"  TOTAL: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
        print("="*100 + "\n")


if __name__ == "__main__":
    test_suite = ComprehensiveTestSuite()
    test_suite.run_all_tests()
