import { test, expect } from '@playwright/test';

test('app loads with title and scoring header visible', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('Fencing Scoring Machine Remote Simulator');

    const header = page.getByRole('heading', { name: 'FENCING SCORING' });
    await expect(header).toBeVisible();
});


