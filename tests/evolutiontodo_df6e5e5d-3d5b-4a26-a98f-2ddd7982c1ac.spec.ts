
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('EvolutionTodo_2026-01-14', async ({ page, context }) => {
  
    // Navigate to URL
    await page.goto('http://localhost:3000');

    // Navigate to URL
    await page.goto('http://localhost:3000');

    // Navigate to URL
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

    // Take screenshot
    await page.screenshot({ path: 'homepage-test.png', { fullPage: true } });

    // Navigate to URL
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // Take screenshot
    await page.screenshot({ path: 'homepage.png', { fullPage: true } });

    // Click element
    await page.click('text=Create one');

    // Take screenshot
    await page.screenshot({ path: 'registration-page.png', { fullPage: true } });

    // Take screenshot
    await page.screenshot({ path: 'registration-page-2.png', { fullPage: true } });

    // Navigate to URL
    await page.goto('http://localhost:3000/register');

    // Navigate to URL
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // Navigate to URL
    await page.goto('http://localhost:3000', { waitUntil: 'commit' });

    // Take screenshot
    await page.screenshot({ path: 'login-page.png', { fullPage: true } });

    // Take screenshot
    await page.screenshot({ path: 'login-page-loaded.png', { fullPage: true } });

    // Navigate to URL
    await page.goto('http://localhost:3000', { waitUntil: 'commit' });

    // Navigate to URL
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

    // Take screenshot
    await page.screenshot({ path: 'frontend-login.png', { fullPage: true } });

    // Take screenshot
    await page.screenshot({ path: 'frontend-login-2.png', { fullPage: true } });

    // Navigate to URL
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
});