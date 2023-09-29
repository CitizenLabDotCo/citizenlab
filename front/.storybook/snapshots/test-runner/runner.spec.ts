import { test, expect } from '@playwright/test';
import stories from '../snapshot-tests.json';

test.describe('Button', () => {
  for (const story of stories) {
    test(`snapshot test: ${story}`, async ({ page }) => {
      await page.goto(`http://localhost:6006/?path=/story/${story}`);
      await page.waitForTimeout(1000);
  
      expect(
        await page
          .locator('#storybook-preview-iframe')
          .screenshot({ animations: 'disabled' })
        ).toMatchSnapshot(`${story}.png`)
    })
  }
})