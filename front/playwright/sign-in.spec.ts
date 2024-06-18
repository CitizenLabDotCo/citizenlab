import { test, expect } from '@playwright/test';

const randomString = () => Math.random().toString(36).substring(7);
const randomEmail = () => `${randomString()}@example.com`;

test.describe('Sign in page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForResponse(/me/);
    await page.waitForResponse(/homepage/);
    await page.locator('#e2e-navbar-login-menu-item').click();
    await expect(page.locator('#e2e-authentication-modal')).toBeVisible();
  });

  test('has a working email field', async ({ page }) => {
    await page.locator('#email').fill('test');
    await expect(page.locator('#email')).toHaveValue('test');
  });

  test('has a working password field', async ({ page }) => {
    await page.locator('#password').fill('test');
    await expect(page.locator('#password')).toHaveValue('test');
  });

  test('shows an error when no email is provided', async ({ page }) => {
    await page.locator('#password').fill('test');
    await page.locator('#e2e-signin-password-submit-button').click();
    await expect(page.locator('#e2e-email-container')).toBeVisible();
    const scope = page.locator('#e2e-email-container');
    await expect(
      scope.locator('[data-testid="error-message-text"]')
    ).toBeVisible();
  });

  test('shows an error when no valid email is provided', async ({ page }) => {
    await page.locator('#email').fill('test@t');
    await page.locator('#password').fill('test');
    await page.locator('#e2e-signin-password-submit-button').click();
    await expect(page.locator('#e2e-email-container')).toBeVisible();
    const scope = page.locator('#e2e-email-container');
    await expect(
      scope.locator('[data-testid="error-message-text"]')
    ).toBeVisible();
  });

  test('shows an error when no password is provided', async ({ page }) => {
    await page.locator('#email').fill('test@test.com');
    await page.locator('#e2e-signin-password-submit-button').click();
    await expect(page.locator('#e2e-password-container')).toBeVisible();
    const scope = page.locator('#e2e-password-container');
    await expect(
      scope.locator('[data-testid="error-message-text"]')
    ).toBeVisible();
  });

  test('has a working link to the password recovery page', async ({ page }) => {
    await page.locator('.e2e-password-recovery-link').click();
    await expect(page).toHaveURL(new RegExp('/en/password-recovery'));
  });

  test('has a working link to the sign up flow', async ({ page }) => {
    await page.locator('#e2e-goto-signup').click();
    await expect(
      page.locator('#e2e-sign-up-email-password-container')
    ).toBeVisible();
  });

  test('logs in with valid credentials', async ({ page }) => {
    const email = 'admin@citizenlab.co';
    const password = 'democracy2.0';
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    await page.locator('#e2e-signin-password-submit-button').click();
    await expect(page.locator('#e2e-user-menu-container')).toBeVisible();
  });

  test('shows an error when trying to log in with invalid credentials', async ({
    page,
  }) => {
    const email = randomEmail();
    const password = randomString();
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    await page.locator('#e2e-signin-password-submit-button').click();
    await expect(page.locator('.e2e-error-message')).toHaveText(
      /The provided information is not correct/
    );
  });
});
