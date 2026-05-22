import { IdpLogin } from "./types";

/**
 * Standard Keycloak login form (used by the ID-Porten test realm). The default
 * Keycloak login theme renders `#username`, `#password`, and a submit `#kc-login`.
 * If the realm uses a custom theme, confirm selectors with:
 *   npx playwright codegen <issuer>/protocol/openid-connect/auth?...
 */
export const keycloakLogin: IdpLogin = async ({ page, creds }) => {
  await page.fill("#username", creds.KEYCLOAK_TEST_USER ?? "");
  await page.fill("#password", creds.KEYCLOAK_TEST_PASSWORD ?? "");
  await page.click("#kc-login");
};
