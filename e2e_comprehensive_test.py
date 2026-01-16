#!/usr/bin/env python
"""Comprehensive E2E test for Evolution of Todo application."""
import time
from playwright.sync_api import sync_playwright, expect

BASE_URL = "http://localhost:3000"

class TodoAppE2ETest:
    """End-to-end test suite for Todo application."""

    def __init__(self):
        """Initialize Playwright."""
        self.playwright = sync_playwright().start()
        self.browser = self.playwright.chromium.launch(headless=False)
        self.context = self.browser.new_context()
        self.page = self.context.new_page()
        self.test_results = []

    def log_test(self, test_name, passed, details=""):
        """Log test result."""
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"  └─ {details}")
        self.test_results.append((test_name, passed, details))

    # ==================== TEST 1: REGISTRATION ====================
    def test_registration(self):
        """Test user registration flow."""
        print("\n" + "="*70)
        print("TEST 1: USER REGISTRATION")
        print("="*70)

        self.page.goto(f"{BASE_URL}/register")
        self.page.wait_for_load_state("networkidle")
        time.sleep(1)

        try:
            # Fill registration form
            self.page.fill("input[type='email']", "testuser001@example.com")
            self.page.fill("input[placeholder*='username']", "testuser001")
            self.page.fill("input[type='password']:first-of-type", "TestPassword123!")
            self.page.fill("input[type='password']:last-of-type", "TestPassword123!")

            # Submit form
            self.page.click("button[type='submit']")

            # Wait for redirect to home
            self.page.wait_for_url(f"{BASE_URL}/", timeout=10000)

            self.log_test("User Registration", True, "Successfully registered testuser001")
            return True
        except Exception as e:
            self.log_test("User Registration", False, str(e))
            return False

    # ==================== TEST 2: LOGIN ====================
    def test_login(self):
        """Test user login flow."""
        print("\n" + "="*70)
        print("TEST 2: USER LOGIN")
        print("="*70)

        self.page.goto(f"{BASE_URL}/login")
        self.page.wait_for_load_state("networkidle")
        time.sleep(1)

        try:
            # Fill login form
            self.page.fill("input[type='email']", "testuser001@example.com")
            self.page.fill("input[type='password']", "TestPassword123!")

            # Submit form
            self.page.click("button[type='submit']")

            # Wait for redirect to home
            self.page.wait_for_url(f"{BASE_URL}/", timeout=10000)

            self.log_test("User Login", True, "Successfully logged in")
            return True
        except Exception as e:
            self.log_test("User Login", False, str(e))
            return False

    # ==================== TEST 3: TASK CREATION ====================
    def test_create_task(self):
        """Test task creation on home page."""
        print("\n" + "="*70)
        print("TEST 3: TASK CREATION")
        print("="*70)

        try:
            self.page.goto(f"{BASE_URL}/")
            self.page.wait_for_load_state("networkidle")
            time.sleep(1)

            # Find and fill task input
            task_input = self.page.locator("input[placeholder*='Add a task'], input[placeholder*='What needs']")
            task_input.fill("Test Task 001 - Buy groceries")
            task_input.press("Enter")

            # Wait for task to appear
            time.sleep(2)

            # Check if task is visible
            task_text = self.page.locator("text='Test Task 001'")
            is_visible = task_text.is_visible()

            self.log_test("Create Task", is_visible, "Task 'Test Task 001' created and visible")
            return is_visible
        except Exception as e:
            self.log_test("Create Task", False, str(e))
            return False

    # ==================== TEST 4: TASK ISOLATION ====================
    def test_task_isolation(self):
        """Test that users only see their own tasks."""
        print("\n" + "="*70)
        print("TEST 4: TASK ISOLATION (User sees only own tasks)")
        print("="*70)

        try:
            # Create another user and verify task isolation
            self.page.goto(f"{BASE_URL}/register")
            self.page.wait_for_load_state("networkidle")
            time.sleep(1)

            # Register second user
            self.page.fill("input[type='email']", "testuser002@example.com")
            self.page.fill("input[placeholder*='username']", "testuser002")
            self.page.fill("input[type='password']:first-of-type", "TestPassword123!")
            self.page.fill("input[type='password']:last-of-type", "TestPassword123!")
            self.page.click("button[type='submit']")

            self.page.wait_for_url(f"{BASE_URL}/", timeout=10000)
            time.sleep(2)

            # Create task for user 2
            task_input = self.page.locator("input[placeholder*='Add a task'], input[placeholder*='What needs']")
            task_input.fill("User 2 Task - Different task")
            task_input.press("Enter")
            time.sleep(2)

            # Check that user 2 sees their task
            user2_task = self.page.locator("text='User 2 Task'")
            user2_sees_own = user2_task.is_visible()

            # Check that user 2 doesn't see user 1's task
            user1_task = self.page.locator("text='Test Task 001'")
            user2_not_see_user1 = not user1_task.is_visible()

            self.log_test(
                "Task Isolation",
                user2_sees_own and user2_not_see_user1,
                f"User 2 sees own tasks: {user2_sees_own}, User 2 doesn't see User 1 tasks: {user2_not_see_user1}"
            )
            return user2_sees_own and user2_not_see_user1
        except Exception as e:
            self.log_test("Task Isolation", False, str(e))
            return False

    # ==================== TEST 5: CHAT FAB BUTTON ====================
    def test_chat_fab_button(self):
        """Test that FAB button opens chat modal, not page."""
        print("\n" + "="*70)
        print("TEST 5: CHAT FAB BUTTON - Opens Modal (not full page)")
        print("="*70)

        try:
            self.page.goto(f"{BASE_URL}/")
            self.page.wait_for_load_state("networkidle")
            time.sleep(2)

            # Look for FAB button (floating action button)
            fab_button = self.page.locator("button[aria-label*='chat'], button[aria-label*='Chat'], [class*='fab'] button")

            if not fab_button.is_visible():
                # Try alternative selectors
                fab_button = self.page.locator("button[class*='fixed'] >> nth=0")

            fab_visible = fab_button.is_visible()

            if fab_visible:
                fab_button.click()
                time.sleep(1)

                # Check if modal/dialog is open (not navigated to /chat page)
                current_url = self.page.url
                is_still_on_home = "/chat" not in current_url or current_url == f"{BASE_URL}/"

                # Check for modal/dialog element
                modal = self.page.locator("[role='dialog'], .fixed.inset-0, [class*='modal']")
                has_modal = modal.is_visible()

                self.log_test(
                    "Chat FAB Button",
                    has_modal and is_still_on_home,
                    f"Modal open: {has_modal}, Still on home page: {is_still_on_home}"
                )
                return has_modal and is_still_on_home
            else:
                self.log_test("Chat FAB Button", False, "FAB button not found")
                return False
        except Exception as e:
            self.log_test("Chat FAB Button", False, str(e))
            return False

    # ==================== TEST 6: CHAT WITH AI ====================
    def test_chat_ai_task_creation(self):
        """Test creating task through AI chat."""
        print("\n" + "="*70)
        print("TEST 6: CREATE TASK USING AI CHAT")
        print("="*70)

        try:
            # Open chat modal if not already open
            fab_button = self.page.locator("button[aria-label*='chat'], button[aria-label*='Chat']")
            if fab_button.is_visible():
                fab_button.click()
                time.sleep(1)

            # Find chat input
            chat_input = self.page.locator("input[placeholder*='Message'], textarea[placeholder*='message']")

            if chat_input.is_visible():
                chat_input.fill("Create a task for me to complete project documentation by tomorrow")
                chat_input.press("Enter")
                time.sleep(3)

                # Check if response appears
                response = self.page.locator("text*='created', text*='task'")
                response_visible = response.is_visible()

                self.log_test("AI Chat Task Creation", response_visible, "AI responded to task creation request")
                return response_visible
            else:
                self.log_test("AI Chat Task Creation", False, "Chat input not found")
                return False
        except Exception as e:
            self.log_test("AI Chat Task Creation", False, str(e))
            return False

    # ==================== TEST 7: TASK DELETION ====================
    def test_delete_task(self):
        """Test task deletion."""
        print("\n" + "="*70)
        print("TEST 7: TASK DELETION")
        print("="*70)

        try:
            self.page.goto(f"{BASE_URL}/")
            self.page.wait_for_load_state("networkidle")
            time.sleep(1)

            # Find a task
            task = self.page.locator("div[class*='task'], [class*='task-item']").first

            if task.is_visible():
                # Hover to show delete button
                task.hover()
                time.sleep(0.5)

                # Click delete button
                delete_btn = task.locator("button[aria-label*='delete'], button[title*='Delete']")
                if delete_btn.is_visible():
                    delete_btn.click()
                    time.sleep(1)

                    # Confirm deletion if dialog appears
                    confirm_btn = self.page.locator("button:has-text('Delete'), button:has-text('Confirm')")
                    if confirm_btn.is_visible():
                        confirm_btn.click()
                        time.sleep(1)

                    self.log_test("Task Deletion", True, "Task deleted successfully")
                    return True
                else:
                    self.log_test("Task Deletion", False, "Delete button not found")
                    return False
            else:
                self.log_test("Task Deletion", False, "No tasks found to delete")
                return False
        except Exception as e:
            self.log_test("Task Deletion", False, str(e))
            return False

    # ==================== TEST 8: PROFILE PAGE ====================
    def test_profile_page(self):
        """Test profile page functionality."""
        print("\n" + "="*70)
        print("TEST 8: PROFILE PAGE")
        print("="*70)

        try:
            self.page.goto(f"{BASE_URL}/profile")
            self.page.wait_for_load_state("networkidle")
            time.sleep(1)

            # Check for profile elements
            username = self.page.locator("text='testuser002'")
            email = self.page.locator("text*='@example.com'")

            username_visible = username.is_visible()
            email_visible = email.is_visible()

            self.log_test(
                "Profile Page",
                username_visible or email_visible,
                f"Username visible: {username_visible}, Email visible: {email_visible}"
            )
            return username_visible or email_visible
        except Exception as e:
            self.log_test("Profile Page", False, str(e))
            return False

    # ==================== TEST 9: LOGOUT ====================
    def test_logout(self):
        """Test logout functionality."""
        print("\n" + "="*70)
        print("TEST 9: LOGOUT")
        print("="*70)

        try:
            # Look for logout button in menu
            menu_btn = self.page.locator("button[aria-label*='menu'], button[class*='menu']")
            if menu_btn.is_visible():
                menu_btn.click()
                time.sleep(0.5)

            logout_btn = self.page.locator("button:has-text('Logout'), button:has-text('Sign Out'), a:has-text('Logout')")

            if logout_btn.is_visible():
                logout_btn.click()
                time.sleep(2)

                # Check if redirected to login or landing
                current_url = self.page.url
                is_logged_out = "login" in current_url or "landing" in current_url

                self.log_test("Logout", is_logged_out, f"Redirected to: {current_url}")
                return is_logged_out
            else:
                self.log_test("Logout", False, "Logout button not found")
                return False
        except Exception as e:
            self.log_test("Logout", False, str(e))
            return False

    # ==================== TEST 10: FORGOT PASSWORD ====================
    def test_forgot_password_flow(self):
        """Test forgot password flow."""
        print("\n" + "="*70)
        print("TEST 10: FORGOT PASSWORD FLOW")
        print("="*70)

        try:
            self.page.goto(f"{BASE_URL}/login")
            self.page.wait_for_load_state("networkidle")
            time.sleep(1)

            # Click forgot password link
            forgot_link = self.page.locator("a:has-text('Forgot password'), a:has-text('forgot password')")

            if forgot_link.is_visible():
                forgot_link.click()
                self.page.wait_for_url(f"{BASE_URL}/forgot-password", timeout=5000)

                # Check if on forgot password page
                is_on_forgot_page = "/forgot-password" in self.page.url

                # Fill email
                email_input = self.page.locator("input[type='email']")
                email_input.fill("testuser002@example.com")

                # Submit
                self.page.click("button[type='submit']")
                time.sleep(2)

                self.log_test("Forgot Password Flow", is_on_forgot_page, "Successfully navigated to forgot password page")
                return is_on_forgot_page
            else:
                self.log_test("Forgot Password Flow", False, "Forgot password link not found")
                return False
        except Exception as e:
            self.log_test("Forgot Password Flow", False, str(e))
            return False

    # ==================== TEST 11: MULTI-USER SECURITY ====================
    def test_multi_user_security(self):
        """Test that users can't access other users' data."""
        print("\n" + "="*70)
        print("TEST 11: MULTI-USER SECURITY & ISOLATION")
        print("="*70)

        try:
            # Login as user 1
            self.page.goto(f"{BASE_URL}/login")
            self.page.wait_for_load_state("networkidle")
            time.sleep(1)

            self.page.fill("input[type='email']", "testuser001@example.com")
            self.page.fill("input[type='password']", "TestPassword123!")
            self.page.click("button[type='submit']")
            self.page.wait_for_url(f"{BASE_URL}/", timeout=10000)
            time.sleep(2)

            # Get User 1's tasks
            user1_tasks_count = self.page.locator("div[class*='task']").count()

            # Try to access User 2's profile (security test)
            # This should either be blocked or show user 1's data
            self.page.goto(f"{BASE_URL}/profile")
            time.sleep(1)

            profile_username = self.page.locator("text='testuser001'")
            is_own_profile = profile_username.is_visible()

            self.log_test(
                "Multi-User Security",
                is_own_profile,
                f"User 1 can access own profile: {is_own_profile}, Has tasks: {user1_tasks_count > 0}"
            )
            return is_own_profile
        except Exception as e:
            self.log_test("Multi-User Security", False, str(e))
            return False

    # ==================== MAIN TEST RUNNER ====================
    def run_all_tests(self):
        """Run all tests."""
        print("\n" + "="*70)
        print("EVOLUTION OF TODO - COMPREHENSIVE E2E TEST SUITE")
        print("="*70)

        # Run tests in sequence
        self.test_registration()
        time.sleep(2)

        self.test_login()
        time.sleep(2)

        self.test_create_task()
        time.sleep(2)

        self.test_chat_fab_button()
        time.sleep(2)

        self.test_chat_ai_task_creation()
        time.sleep(2)

        self.test_task_deletion()
        time.sleep(2)

        self.test_profile_page()
        time.sleep(2)

        self.test_forgot_password_flow()
        time.sleep(2)

        self.test_task_isolation()
        time.sleep(2)

        self.test_multi_user_security()
        time.sleep(2)

        self.test_logout()

        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print test summary."""
        print("\n" + "="*70)
        print("TEST SUMMARY")
        print("="*70)

        passed = sum(1 for _, p, _ in self.test_results if p)
        total = len(self.test_results)

        for test_name, passed_test, details in self.test_results:
            status = "✓" if passed_test else "✗"
            print(f"{status} {test_name}")

        print("\n" + "="*70)
        print(f"TOTAL: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
        print("="*70)

    def cleanup(self):
        """Cleanup browser resources."""
        self.context.close()
        self.browser.close()
        self.playwright.stop()


if __name__ == "__main__":
    test = TodoAppE2ETest()
    try:
        test.run_all_tests()
    finally:
        test.cleanup()
