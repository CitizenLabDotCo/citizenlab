import { IdpLogin } from "./types";

/**
 * Clave Única (Chile) test environment. The login page takes a RUN (national id)
 * and a password. Field ids on the standard ClaveÚnica page are `#uname` (RUN)
 * and `#pword`. Confirm with `playwright codegen` against the test /authorize URL.
 */
export const claveUnicaLogin: IdpLogin = async ({ page, creds }) => {
  await page.fill("#uname", creds.CLAVE_UNICA_TEST_USER ?? "");
  await page.fill("#pword", creds.CLAVE_UNICA_TEST_PASSWORD ?? "");
  await page.click('button[type="submit"]');
};
