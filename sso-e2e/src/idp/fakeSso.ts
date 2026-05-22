import { IdpLogin } from "./types";

/**
 * The local fake-IdP express server (served at :8081/oauth/authorize). Selectors
 * mirror the existing — currently skipped — Cypress spec
 * `front/cypress/e2e/auth/sso_auth.cy.ts:18-20,50-53`.
 *
 * Set FAKE_SSO_PROFILE to pick a specific seeded profile (e.g. `jane_doe` for
 * the no-email case); otherwise the default profile is submitted.
 */
export const fakeSsoLogin: IdpLogin = async ({ page, creds }) => {
  await page.waitForSelector("#submit-button");

  if (creds.FAKE_SSO_PROFILE) {
    await page.selectOption("select#profile-select", creds.FAKE_SSO_PROFILE);
  }

  await page.click("#submit-button");
};
