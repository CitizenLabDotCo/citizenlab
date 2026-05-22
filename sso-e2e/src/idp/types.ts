import { Page } from "@playwright/test";

/**
 * Credentials and options for an IdP login, read from the environment by the
 * spec and handed to the per-method handler. Kept as a string map so each
 * handler picks out only the keys it needs.
 */
export type IdpCredentials = Record<string, string | undefined>;

export interface IdpLoginContext {
  /** The page, already navigated to (or redirected onto) the IdP's login page. */
  page: Page;
  creds: IdpCredentials;
}

/**
 * Drives a single external IdP's login form to completion, leaving the browser
 * on the redirect back to the platform's `/auth/:provider/callback`.
 */
export type IdpLogin = (ctx: IdpLoginContext) => Promise<void>;
