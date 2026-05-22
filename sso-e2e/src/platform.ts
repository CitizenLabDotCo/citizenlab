import {
  APIRequestContext,
  BrowserContext,
  Page,
  expect,
} from "@playwright/test";

/**
 * Platform-side helpers — the Go Vocal app, as opposed to the external IdP.
 * The auth shortcut mirrors `front/cypress/support/commands.ts:172-192`: POST
 * the credentials to `web_api/v1/user_token`, then plant the `cl2_jwt` cookie
 * so we skip the interactive platform login and go straight to verification.
 */

const JWT_COOKIE = "cl2_jwt";

/** POSTs credentials to the user-token endpoint and returns the JWT. */
export const apiLogin = async (
  request: APIRequestContext,
  email: string,
  password: string
): Promise<string> => {
  const res = await request.post("web_api/v1/user_token", {
    headers: { "Content-Type": "application/json" },
    data: { auth: { email, password } },
  });
  expect(
    res.ok(),
    `user_token failed (${res.status()}): ${await res.text()}`
  ).toBeTruthy();
  const body = (await res.json()) as { jwt: string };
  return body.jwt;
};

/** Plants the JWT as the `cl2_jwt` cookie for the given baseURL, logging the user in. */
export const setLoginCookie = async (
  context: BrowserContext,
  baseURL: string,
  jwt: string
): Promise<void> => {
  await context.addCookies([{ name: JWT_COOKIE, value: jwt, url: baseURL }]);
};

/**
 * Kicks off SSO verification by navigating directly to the backend's
 * `/auth/:provider` route with the verification params the frontend would set
 * (see `front/app/api/authentication/singleSignOn.ts:82-99`). The logged-in
 * user is identified by the `cl2_jwt` cookie the browser sends along.
 */
export const startVerification = async (
  page: Page,
  provider: string
): Promise<void> => {
  const params = new URLSearchParams({
    sso_flow: "signup",
    sso_pathname: "/",
    sso_verification: "true",
    sso_verification_action: "visiting",
    sso_verification_type: "global",
  });
  await page.goto(`/auth/${provider}?${params.toString()}`);
};

/** Reads the current user and returns whether they are verified. */
export const isVerified = async (
  request: APIRequestContext
): Promise<boolean> => {
  const res = await request.get("web_api/v1/users/me");
  expect(
    res.ok(),
    `users/me failed (${res.status()}): ${await res.text()}`
  ).toBeTruthy();
  const body = (await res.json()) as {
    data: { attributes: { verified?: boolean } };
  };
  return body.data.attributes.verified === true;
};

/** Asserts the current user is verified, with a helpful message on failure. */
export const expectVerified = async (
  request: APIRequestContext
): Promise<void> => {
  await expect
    .poll(() => isVerified(request), {
      message: "user did not become verified after the SSO callback",
      timeout: 15_000,
    })
    .toBe(true);
};
