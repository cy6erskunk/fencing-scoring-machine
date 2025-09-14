import { test, expect, Page } from '@playwright/test';

function priorityIndicators(page: Page) {
    return {
        left: page.getByLabel('priority left', { exact: true }),
        right: page.getByLabel('priority right', { exact: true })
    };
}

test('priority manual: none → left (only left visible)', async ({ page }) => {
    await page.goto('/');
    const pMan = page.getByRole('button', { name: /P\s*MAN/ });
    const { left, right } = priorityIndicators(page);

    await expect(left).toBeHidden();
    await expect(right).toBeHidden();

    await pMan.click();
    await expect(left).toBeVisible();
    await expect(right).toBeHidden();
});

test('priority manual: left → right (only right visible)', async ({ page }) => {
    await page.goto('/');
    const pMan = page.getByRole('button', { name: /P\s*MAN/ });
    const { left, right } = priorityIndicators(page);

    await pMan.click(); // none -> left
    await pMan.click(); // left -> right

    await expect(left).toBeHidden();
    await expect(right).toBeVisible();
});

test('priority manual: right → none (both hidden)', async ({ page }) => {
    await page.goto('/');
    const pMan = page.getByRole('button', { name: /P\s*MAN/ });
    const { left, right } = priorityIndicators(page);

    await pMan.click(); // none -> left
    await pMan.click(); // left -> right
    await pMan.click(); // right -> none

    await expect(left).toBeHidden();
    await expect(right).toBeHidden();
});

test('priority random: none → one side (exactly one visible)', async ({ page }) => {
    await page.goto('/');
    const pCas = page.getByRole('button', { name: /P\s*CAS/ });
    const { left, right } = priorityIndicators(page);

    await expect(left).toBeHidden();
    await expect(right).toBeHidden();

    await pCas.click();
    const leftVisible = await left.isVisible();
    const rightVisible = await right.isVisible();
    expect(Number(leftVisible) + Number(rightVisible)).toBe(1);
});

test('priority random: assigned → none (clears)', async ({ page }) => {
    await page.goto('/');
    const pCas = page.getByRole('button', { name: /P\s*CAS/ });
    const { left, right } = priorityIndicators(page);

    await pCas.click(); // assign
    await pCas.click(); // clear

    await expect(left).toBeHidden();
    await expect(right).toBeHidden();
});
