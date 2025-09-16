import { test, expect } from '@playwright/test';

test('left yellow card toggles without affecting others', async ({ page }) => {
    await page.goto('/');

    const leftYellowBtn = page.getByRole('button', { name: 'left yellow card' });
    const leftRedBtn = page.getByRole('button', { name: 'left red card' });
    const rightYellowBtn = page.getByRole('button', { name: 'right yellow card' });
    const rightRedBtn = page.getByRole('button', { name: 'right red card' });

    await expect(leftYellowBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByLabel('left yellow card off')).toBeVisible();

    await leftYellowBtn.click();
    await expect(leftYellowBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByLabel('left yellow card on')).toBeVisible();
    await expect(leftRedBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(rightYellowBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(rightRedBtn).toHaveAttribute('aria-pressed', 'false');

    await leftYellowBtn.click();
    await expect(leftYellowBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByLabel('left yellow card off')).toBeVisible();
});

test('left red card toggles without affecting others', async ({ page }) => {
    await page.goto('/');

    const leftYellowBtn = page.getByRole('button', { name: 'left yellow card' });
    const leftRedBtn = page.getByRole('button', { name: 'left red card' });
    const rightYellowBtn = page.getByRole('button', { name: 'right yellow card' });
    const rightRedBtn = page.getByRole('button', { name: 'right red card' });

    await expect(leftRedBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByLabel('left red card off')).toBeVisible();

    await leftRedBtn.click();
    await expect(leftRedBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByLabel('left red card on')).toBeVisible();
    await expect(leftYellowBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(rightYellowBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(rightRedBtn).toHaveAttribute('aria-pressed', 'false');

    await leftRedBtn.click();
    await expect(leftRedBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByLabel('left red card off')).toBeVisible();
});

test('right yellow card toggles without affecting others', async ({ page }) => {
    await page.goto('/');

    const leftYellowBtn = page.getByRole('button', { name: 'left yellow card' });
    const leftRedBtn = page.getByRole('button', { name: 'left red card' });
    const rightYellowBtn = page.getByRole('button', { name: 'right yellow card' });
    const rightRedBtn = page.getByRole('button', { name: 'right red card' });

    await expect(rightYellowBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByLabel('right yellow card off')).toBeVisible();

    await rightYellowBtn.click();
    await expect(rightYellowBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByLabel('right yellow card on')).toBeVisible();
    await expect(leftYellowBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(leftRedBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(rightRedBtn).toHaveAttribute('aria-pressed', 'false');

    await rightYellowBtn.click();
    await expect(rightYellowBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByLabel('right yellow card off')).toBeVisible();
});

test('right red card toggles without affecting others', async ({ page }) => {
    await page.goto('/');

    const leftYellowBtn = page.getByRole('button', { name: 'left yellow card' });
    const leftRedBtn = page.getByRole('button', { name: 'left red card' });
    const rightYellowBtn = page.getByRole('button', { name: 'right yellow card' });
    const rightRedBtn = page.getByRole('button', { name: 'right red card' });

    await expect(rightRedBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByLabel('right red card off')).toBeVisible();

    await rightRedBtn.click();
    await expect(rightRedBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByLabel('right red card on')).toBeVisible();
    await expect(leftYellowBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(leftRedBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(rightYellowBtn).toHaveAttribute('aria-pressed', 'false');

    await rightRedBtn.click();
    await expect(rightRedBtn).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByLabel('right red card off')).toBeVisible();
});


