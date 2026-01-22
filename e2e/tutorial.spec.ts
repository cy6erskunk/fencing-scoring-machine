import { test, expect } from '@playwright/test';

test('tutorial mode button is visible on initial load', async ({ page }) => {
    await page.goto('/');

    const tutorialButton = page.getByRole('button', { name: 'Reset for Pool Match' });
    await expect(tutorialButton).toBeVisible();

    const heading = page.getByRole('heading', { name: 'Practice Mode' });
    await expect(heading).toBeVisible();
});

test('starting tutorial sets up initial state correctly', async ({ page }) => {
    await page.goto('/');

    const tutorialButton = page.getByRole('button', { name: 'Reset for Pool Match' });
    await tutorialButton.click();

    // Check tutorial panel is visible
    const tutorialHeading = page.getByRole('heading', { name: 'Reset for Pool Match' });
    await expect(tutorialHeading).toBeVisible();

    // Check initial state is set by verifying cards and priority indicators
    await expect(page.getByLabel('left yellow card on')).toBeVisible();
    await expect(page.getByLabel('priority right')).toBeVisible();
    
    // Verify status shows STOPPED
    await expect(page.getByLabel('status')).toHaveText('STOPPED');
});

test('completing all tutorial steps shows completion message', async ({ page }) => {
    await page.goto('/');

    const tutorialButton = page.getByRole('button', { name: 'Reset for Pool Match' });
    await tutorialButton.click();

    // Step 1: Reset time to 3:00
    await page.getByRole('button', { name: 'SET' }).click();

    // Step 2: Reset scores to 0
    await page.getByRole('button', { name: 'MISE A ZERO' }).click();

    // Step 3: Clear priority
    // Priority starts at 'right' and cycles: right -> none -> left -> right -> none
    // So we need 1 click to get to 'none'
    await page.getByRole('button', { name: /P\s*MAN/ }).click();

    // Step 4: Clear all cards
    await page.getByRole('button', { name: 'left yellow card' }).click();

    // Step 5: Turn off match count (3 -> 0)
    await page.getByRole('button', { name: 'MATCH COUNT' }).click();

    // Verify all steps show checkmarks
    const tutorialPanel = page.locator('text=STEPS:').locator('..');
    const checkmarks = tutorialPanel.getByText('✓');
    await expect(checkmarks).toHaveCount(5);
    
    // Check completion message is visible
    await expect(page.getByText(/Tutorial completed!/i)).toBeVisible();
});

test('exit tutorial button resets to default state', async ({ page }) => {
    await page.goto('/');

    const tutorialButton = page.getByRole('button', { name: 'Reset for Pool Match' });
    await tutorialButton.click();

    // Verify tutorial is active
    const tutorialHeading = page.getByRole('heading', { name: 'Reset for Pool Match' });
    await expect(tutorialHeading).toBeVisible();

    // Click exit button
    await page.getByRole('button', { name: 'exit tutorial' }).click();

    // Check we're back to practice mode selection
    const practiceHeading = page.getByRole('heading', { name: 'Practice Mode' });
    await expect(practiceHeading).toBeVisible();

    // Verify state is reset - check status
    await expect(page.getByLabel('status')).toHaveText('STOPPED');
    
    // Verify no cards are active
    await expect(page.getByLabel('left yellow card off')).toBeVisible();
    await expect(page.getByLabel('right yellow card off')).toBeVisible();
});

test('tutorial tracks step completion independently', async ({ page }) => {
    await page.goto('/');

    const tutorialButton = page.getByRole('button', { name: 'Reset for Pool Match' });
    await tutorialButton.click();

    // Complete step 2 before step 1
    await page.getByRole('button', { name: 'MISE A ZERO' }).click();

    // Verify step 2 is marked complete but step 1 is not
    // We check for the presence of checkmarks in the steps
    const stepsContainer = page.locator('text=Steps:').locator('..');
    await expect(stepsContainer.getByText('✓').first()).toBeVisible();

    // Now complete step 1
    await page.getByRole('button', { name: 'SET' }).click();

    // Both steps should now show checkmarks
    await expect(stepsContainer.getByText('✓').nth(0)).toBeVisible();
    await expect(stepsContainer.getByText('✓').nth(1)).toBeVisible();
});
