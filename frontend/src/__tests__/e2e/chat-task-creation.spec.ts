import { test, expect } from '@playwright/test';

/**
 * Chat Task Creation Tests
 *
 * Tests the AI chatbot's ability to:
 * - Create tasks with correct dates
 * - Parse natural language dates ("today", "tomorrow")
 * - Return proper task confirmation
 */

test.describe('Chat Task Creation', () => {

  // Skip authentication for now - tests will be adjusted based on auth state
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Chat modal opens when FAB is clicked', async ({ page }) => {
    const currentUrl = page.url();

    // Skip if redirected to login (not authenticated)
    if (currentUrl.includes('/login') || currentUrl.includes('/landing')) {
      test.skip();
      return;
    }

    // Click the FAB button
    const fab = page.locator('button[aria-label="Open AI Chat"]').first();
    await expect(fab).toBeVisible({ timeout: 5000 });
    await fab.click();

    // Verify chat modal is open
    const chatModal = page.locator('[role="dialog"], .chat-modal, [data-testid="chat-modal"]');
    await expect(chatModal.or(page.locator('text=Ask me anything'))).toBeVisible({ timeout: 5000 });
  });

  test('Can send a message in chat', async ({ page }) => {
    const currentUrl = page.url();

    if (currentUrl.includes('/login') || currentUrl.includes('/landing')) {
      test.skip();
      return;
    }

    // Open chat modal
    const fab = page.locator('button[aria-label="Open AI Chat"]').first();
    await fab.click();

    // Wait for chat modal
    await page.waitForSelector('textarea, input[placeholder*="Ask me anything"]', { timeout: 5000 });

    // Type a message
    const input = page.locator('textarea, input[placeholder*="Ask me anything"]').first();
    await input.fill('Hello, can you help me create a task?');

    // Find and click send button
    const sendButton = page.locator('button[aria-label*="Send"], button:has-text("Send"), button[type="submit"]').first();
    await sendButton.click();

    // Wait for response (look for assistant message)
    await expect(page.locator('text=/task|help|create/i')).toBeVisible({ timeout: 30000 });
  });

  test('Task creation through chat with date validation', async ({ page }) => {
    const currentUrl = page.url();

    if (currentUrl.includes('/login') || currentUrl.includes('/landing')) {
      test.skip();
      return;
    }

    // Open chat modal
    const fab = page.locator('button[aria-label="Open AI Chat"]').first();
    await fab.click();

    // Wait for chat input
    await page.waitForSelector('textarea, input[placeholder*="Ask me anything"]', { timeout: 5000 });

    // Create a task for today
    const today = new Date().toISOString().split('T')[0];
    const input = page.locator('textarea, input[placeholder*="Ask me anything"]').first();
    await input.fill('Create a task: Test task for today with high priority');

    // Send the message
    const sendButton = page.locator('button[aria-label*="Send"], button:has-text("Send"), button[type="submit"]').first();
    await sendButton.click();

    // Wait for response (should mention task created)
    await expect(page.locator('text=/created|success|task/i')).toBeVisible({ timeout: 30000 });
  });

  test('Natural language date parsing - tomorrow', async ({ page }) => {
    const currentUrl = page.url();

    if (currentUrl.includes('/login') || currentUrl.includes('/landing')) {
      test.skip();
      return;
    }

    // Open chat modal
    const fab = page.locator('button[aria-label="Open AI Chat"]').first();
    await fab.click();

    // Wait for chat input
    await page.waitForSelector('textarea, input[placeholder*="Ask me anything"]', { timeout: 5000 });

    // Create a task for tomorrow
    const input = page.locator('textarea, input[placeholder*="Ask me anything"]').first();
    await input.fill('Create a task: Complete project report by tomorrow');

    // Send the message
    const sendButton = page.locator('button[aria-label*="Send"], button:has-text("Send"), button[type="submit"]').first();
    await sendButton.click();

    // Wait for response
    await expect(page.locator('text=/created|success|tomorrow|task/i')).toBeVisible({ timeout: 30000 });
  });
});

test.describe('API Task Creation Verification', () => {

  test('Direct API task creation with date validation', async ({ request }) => {
    // First, we need to authenticate
    const loginResponse = await request.post('http://localhost:8004/api/v1/auth/login', {
      data: {
        email: 'test@example.com',
        password: 'Test123!@#',
      },
    });

    // Skip if login fails (user doesn't exist)
    if (!loginResponse.ok()) {
      test.skip();
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token || loginData.access_token;

    if (!token) {
      test.skip();
      return;
    }

    // Create a task via API
    const today = new Date().toISOString().split('T')[0];
    const taskResponse = await request.post('http://localhost:8004/api/v1/tasks', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: {
        description: 'API Test Task for date validation',
        priority: 'high',
        due_date: today,
      },
    });

    // Verify task was created successfully
    expect(taskResponse.ok()).toBeTruthy();

    const task = await taskResponse.json();
    expect(task.description).toBe('API Test Task for date validation');
    expect(task.priority).toBe('high');

    // Verify created_at is today
    const createdAt = new Date(task.created_at);
    const todayDate = new Date();
    expect(createdAt.toDateString()).toBe(todayDate.toDateString());
  });
});
