import { test, expect } from '@playwright/test';

test.describe('Button', () => {
  test('Button primary', async ({ page }) => {
    await page.goto('http://localhost:6006/?path=/story/example-button--primary');
    await page.waitForTimeout(1000);

    expect(await page.screenshot({ animations: 'disabled' })).toMatchSnapshot('button-primary.png')
  })
})