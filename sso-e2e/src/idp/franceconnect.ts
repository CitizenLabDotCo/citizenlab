import { IdpLogin } from "./types";

/**
 * FranceConnect integration is a hub: the user first lands on a FranceConnect
 * page that lists test identity providers, picks one ("FranceConnect - Identity
 * Provider 1" / "FIP1" in the sandbox), then enters test credentials on that
 * provider's page.
 *
 * The exact selectors and the provider tile label vary by sandbox version, so
 * this handler is intentionally a best-effort skeleton — confirm it with
 * `npx playwright codegen` against the integration /authorize URL before relying
 * on it. FRANCECONNECT_PROVIDER_LABEL overrides the tile to click.
 */
export const franceconnectLogin: IdpLogin = async ({ page, creds }) => {
  const providerLabel = creds.FRANCECONNECT_PROVIDER_LABEL ?? "FIP1";

  // Step 1: choose a test identity provider on the FranceConnect hub.
  await page
    .getByRole("button", { name: new RegExp(providerLabel, "i") })
    .click();

  // Step 2: authenticate on the chosen provider's page.
  await page.fill('input[name="login"]', creds.FRANCECONNECT_TEST_USER ?? "");
  await page.fill(
    'input[name="password"]',
    creds.FRANCECONNECT_TEST_PASSWORD ?? ""
  );
  await page.click('button[type="submit"]');

  // Step 3: FranceConnect consent screen ("Continuer" / "Continue").
  const consent = page.getByRole("button", { name: /continuer|continue/i });
  if (await consent.isVisible().catch(() => false)) {
    await consent.click();
  }
};
