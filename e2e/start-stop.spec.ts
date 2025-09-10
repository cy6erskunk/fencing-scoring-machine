import { test, expect } from '@playwright/test';

test('start/stop toggles between STOPPED and RUNNING', async ({ page }) => {
    await page.goto('/');

    // Initially STOPPED
    await expect(page.getByText('STOPPED')).toBeVisible();

    // Click START STOP -> RUNNING
    await page.getByRole('button', { name: 'START STOP' }).click();
    await expect(page.getByText('RUNNING')).toBeVisible();

    // Click START STOP again -> STOPPED
    await page.getByRole('button', { name: 'START STOP' }).click();
    await expect(page.getByText('STOPPED')).toBeVisible();
});


test('timer runs down to 0 and auto-stops', async ({ page }) => {
    // Use Playwright's fake timers
    await page.clock.install();

    await page.goto('/');

    // Ensure initial state
    await expect(page.getByText('STOPPED')).toBeVisible();

    // Set to 1 minute by double-clicking SET
    const setButton = page.getByRole('button', { name: 'SET' });
    await setButton.click();
    await setButton.dblclick();
    await expect(page.getByText('1:00')).toBeVisible();

    // Start timer
    await page.getByRole('button', { name: 'START STOP' }).click();

    // Advance timers by 60s and verify auto-stop
    // Some environments require running timers rather than just jumping time.
    // runFor executes timer callbacks due within the given duration.
    void (await page.clock.runFor?.(60_000) ?? await page.clock.fastForward(60_000));
    await expect(page.getByText('0:00')).toBeVisible();
    await expect(page.getByText('STOPPED')).toBeVisible();
});


