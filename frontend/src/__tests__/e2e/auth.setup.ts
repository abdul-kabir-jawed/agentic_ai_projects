import { test as setup, expect } from '@playwright/test';

/**
 * Authentication Setup for E2E Tests
 *
 * This setup file handles user authentication before running tests
 * that require an authenticated user.
 */

// Test user credentials (should match existing user in database)
export const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123!@#',
  name: 'Test User',
};

setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Fill in login form
  await page.fill('input[type="email"], input[name="email"]', TEST_USER.email);
  await page.fill('input[type="password"], input[name="password"]', TEST_USER.password);

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL('/', { timeout: 10000 });

  // Verify we're logged in by checking for dashboard elements
  await expect(page).toHaveURL('/');

  // Save storage state for use in other tests
  await page.context().storageState({ path: '.auth/user.json' });
});
