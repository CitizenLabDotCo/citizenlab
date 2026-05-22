import { test } from "@playwright/test";

import { getMethod, hasRequiredEnv } from "../src/methods";
import {
  apiLogin,
  setLoginCookie,
  startVerification,
  expectVerified,
} from "../src/platform";

/**
 * One spec, run once per Playwright "project" (= verification method). Pick the
 * method with `--project=<name>` and serve the app at that method's host using
 * the matching `start:sso:*` script (see README).
 *
 * Platform login uses a configurable test user. For a meaningful assertion this
 * should be an UNVERIFIED user — otherwise `verified` is already true and the
 * test passes without exercising the flow. Defaults to the seeded admin.
 */
const PLATFORM_USER_EMAIL =
  process.env.PLATFORM_USER_EMAIL ?? "admin@govocal.com";
const PLATFORM_USER_PASSWORD =
  process.env.PLATFORM_USER_PASSWORD ?? "democracy2.0";

test("verifies the user via SSO", async ({ page, context }, testInfo) => {
  const method = getMethod(testInfo.project.name);
  // Use the context's request so it shares the cookie jar with the browser
  // (the standalone `request` fixture would not carry cl2_jwt).
  const request = context.request;

  test.skip(
    !!method.manualOnly,
    `${method.displayName} requires an app-push / hardware token — drive it by hand.`
  );
  test.skip(
    !hasRequiredEnv(method),
    `Missing credentials for ${
      method.displayName
    }: set ${method.requiredEnv.join(", ")} in sso-e2e/.env`
  );

  if (!method.idpLogin) {
    throw new Error(`No IdP login handler registered for ${method.name}`);
  }

  // 1. Log in to the platform without the UI by planting the JWT cookie.
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) throw new Error(`No baseURL configured for ${method.name}`);
  const jwt = await apiLogin(
    request,
    PLATFORM_USER_EMAIL,
    PLATFORM_USER_PASSWORD
  );
  await setLoginCookie(context, baseURL, jwt);

  // 2. Kick off verification → browser is redirected to the external IdP.
  await startVerification(page, method.name);

  // 3. Drive the IdP's login form. Playwright spans origins natively, so the
  //    redirect back to /auth/:provider/callback and the cookies just persist.
  await method.idpLogin({ page, creds: process.env });

  // 4. Wait for the callback round-trip to settle, then assert verification.
  await page.waitForLoadState("networkidle");
  await expectVerified(request);
});
