import { IdpLogin } from "./types";

/**
 * Auth0 Universal Login (the current/"new" widget). Fields are named `username`
 * and `password` with a submit `button[name="action"][value="default"]`.
 * Older Lock widgets differ — confirm with `playwright codegen` against the
 * tenant's /authorize URL if this doesn't match.
 */
export const auth0Login: IdpLogin = async ({ page, creds }) => {
  await page.fill('input[name="username"]', creds.AUTH0_TEST_USER ?? "");
  await page.fill('input[name="password"]', creds.AUTH0_TEST_PASSWORD ?? "");
  await page.click('button[type="submit"]');
};
