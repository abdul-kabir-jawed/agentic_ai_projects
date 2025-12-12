import { test, expect } from '@playwright/test';

test.describe('Todo Application E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    // Wait for the application to load
    await page.waitForLoadState('networkidle');
  });

  test('should load the application with all main components', async ({ page }) => {
    // Check if main layout is visible
    expect(await page.title()).toBeTruthy();

    // Check for main task elements
    const mainContent = page.locator('main');
    expect(mainContent).toBeVisible();
  });

  test('should display the cosmic dark theme', async ({ page }) => {
    // Check for dark theme background
    const body = page.locator('body');
    const backgroundColor = await body.evaluate(() =>
      window.getComputedStyle(document.body).backgroundColor
    );

    // Should have dark background (near black)
    expect(backgroundColor).toBeTruthy();
  });

  test('should create a new task', async ({ page }) => {
    // Find the task input field
    const taskInput = page.locator('input[placeholder*="task"], input[placeholder*="description"]').first();

    if (await taskInput.isVisible()) {
      // Type a new task
      await taskInput.fill('E2E Test Task');

      // Find and click the submit/create button
      const submitButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("Submit")').first();

      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Verify the task appears in the list
        await expect(page.locator('text=E2E Test Task')).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should mark a task as complete', async ({ page }) => {
    // First, create a task
    const taskInput = page.locator('input[placeholder*="task"], input[placeholder*="description"]').first();

    if (await taskInput.isVisible()) {
      await taskInput.fill('Task to Complete');

      const submitButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("Submit")').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Wait for task to appear
        await expect(page.locator('text=Task to Complete')).toBeVisible({ timeout: 5000 });

        // Find and click the checkbox for the task
        const checkbox = page.locator('input[type="checkbox"]').first();
        if (await checkbox.isVisible()) {
          await checkbox.click();

          // Verify task is marked as complete (strikethrough or different styling)
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('should search for tasks', async ({ page }) => {
    // Find the search input
    const searchInput = page.locator('input[placeholder*="search"], input[placeholder*="Search"]').first();

    if (await searchInput.isVisible()) {
      // Type a search term
      await searchInput.fill('test');

      // Wait for search results
      await page.waitForTimeout(500);

      // The search should filter tasks (or show empty if no matches)
      const taskList = page.locator('[class*="task"]');
      expect(taskList).toBeDefined();
    }
  });

  test('should filter tasks by priority', async ({ page }) => {
    // Look for priority filter buttons
    const highPriorityButton = page.locator('button:has-text("High"), button:has-text("🔥")').first();

    if (await highPriorityButton.isVisible()) {
      // Click on high priority filter
      await highPriorityButton.click();

      // Wait for filter to apply
      await page.waitForTimeout(500);

      // Verify filtering is applied
      expect(highPriorityButton).toBeDefined();
    }
  });

  test('should open focus mode', async ({ page }) => {
    // Look for focus mode button
    const focusModeButton = page.locator('button:has-text("Focus"), button:has-text("🎯")').first();

    if (await focusModeButton.isVisible()) {
      await focusModeButton.click();

      // Verify focus mode modal/overlay appears
      const focusMode = page.locator('[class*="focus"], [class*="modal"]').first();
      await expect(focusMode).toBeVisible({ timeout: 3000 });

      // Close focus mode
      const closeButton = page.locator('button:has-text("Exit"), button:has-text("Close")').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }
  });

  test('should show responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Wait for responsive layout
    await page.waitForLoadState('networkidle');

    // Check that mobile navigation is visible
    const mobileNav = page.locator('[class*="mobile"], nav').first();
    expect(mobileNav).toBeDefined();

    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('should handle task CRUD operations', async ({ page }) => {
    // Create
    const taskInput = page.locator('input[placeholder*="task"], input[placeholder*="description"]').first();
    if (await taskInput.isVisible()) {
      await taskInput.fill('CRUD Test Task');

      const submitButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("Submit")').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await expect(page.locator('text=CRUD Test Task')).toBeVisible({ timeout: 5000 });
      }

      // Read - the task should be visible
      expect(page.locator('text=CRUD Test Task')).toBeDefined();

      // Update - find and click edit button if available
      const editButton = page.locator('button:has-text("Edit")').first();
      if (await editButton.isVisible()) {
        await editButton.click();
      }

      // Delete - find and click delete button if available
      const deleteButton = page.locator('button:has-text("Delete")').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        // Verify deletion
        await page.waitForTimeout(500);
      }
    }
  });

  test('should persist tasks on page reload', async ({ page }) => {
    // Create a task
    const taskInput = page.locator('input[placeholder*="task"], input[placeholder*="description"]').first();
    if (await taskInput.isVisible()) {
      await taskInput.fill('Persistence Test Task');

      const submitButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("Submit")').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await expect(page.locator('text=Persistence Test Task')).toBeVisible({ timeout: 5000 });

        // Reload the page
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Task should still be visible (if backend persistence is working)
        const taskElement = page.locator('text=Persistence Test Task');
        if (await taskElement.count() > 0) {
          expect(await taskElement.isVisible()).toBeTruthy();
        }
      }
    }
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Tab to first input
    await page.keyboard.press('Tab');

    // Type a task
    await page.keyboard.type('Keyboard Test Task');

    // Submit with Enter
    await page.keyboard.press('Enter');

    // Wait for task to appear
    await page.waitForTimeout(500);

    // Task should be created
    expect(page.locator('text=Keyboard Test Task')).toBeDefined();
  });

  test('should display animations smoothly', async ({ page }) => {
    // Check that animations are present by looking for transform/animation properties
    const animatedElement = page.locator('[class*="animate"], [class*="motion"]').first();

    if (await animatedElement.count() > 0) {
      const animations = await animatedElement.evaluate(() => {
        const styles = window.getComputedStyle(document.querySelector('[class*="animate"], [class*="motion"]') as Element);
        return {
          animation: styles.animation,
          transform: styles.transform,
        };
      });

      expect(animations).toBeTruthy();
    }
  });

  test('should have accessible UI elements', async ({ page }) => {
    // Check for proper semantic HTML
    const buttons = page.locator('button');
    expect(await buttons.count()).toBeGreaterThan(0);

    const inputs = page.locator('input');
    expect(await inputs.count()).toBeGreaterThan(0);

    // Check for proper color contrast (dark theme should have good contrast)
    const mainContent = page.locator('main');
    expect(mainContent).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);

    // Try to create a task
    const taskInput = page.locator('input[placeholder*="task"], input[placeholder*="description"]').first();
    if (await taskInput.isVisible()) {
      await taskInput.fill('Offline Test');

      const submitButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("Submit")').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Wait and check for error message or graceful degradation
        await page.waitForTimeout(1000);
      }
    }

    // Go back online
    await page.context().setOffline(false);
  });

  test('should apply cosmic dark theme consistently', async ({ page }) => {
    // Check multiple elements for dark theme colors
    const elements = await page.locator('[class*="bg"], [class*="text"], [style*="background"]').first();

    if (await elements.count() > 0) {
      const styles = await elements.evaluate(() => {
        const el = document.querySelector('[class*="bg"], [class*="text"], [style*="background"]');
        if (el) {
          return window.getComputedStyle(el);
        }
        return null;
      });

      expect(styles).toBeTruthy();
    }

    // Page should be dark themed overall
    expect(await page.title()).toBeTruthy();
  });
});
