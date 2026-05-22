# sso-e2e — automated SSO verification-method testing

On-demand [Playwright](https://playwright.dev) harness that drives each SSO-based
verification method end-to-end: log in to the platform → start verification →
authenticate on the external identity provider → confirm the user comes back
**verified**.

## Why Playwright (not Cypress / Puppeteer)

The Cypress specs for this (`front/cypress/e2e/auth/sso_auth.cy.ts`,
`verified_action.cy.ts`) are `describe.skip` because Cypress sandboxes each
origin: after `cy.origin()` the JWT cookie is sometimes dropped and localStorage
is lost across the domain switch. Playwright drives one browser context that
spans origins, so the `/auth/:provider` → IdP → `/auth/:provider/callback`
redirect chain and its cookies persist with no workaround — and the trace spans
both origins for debugging. Puppeteer would navigate external URLs too but has no
test runner, assertions, or traces.

## One-time setup

```bash
cd sso-e2e
npm install
npx playwright install chromium
cp sso-e2e.example.env .env   # then fill in credentials
```

## Credentials

All credentials and config come in at startup from `.env` (gitignored). See
`sso-e2e.example.env` for the full list. A method whose required vars are unset
is **skipped automatically**, so you only fill in what you can test.

> Use an **unverified** `PLATFORM_USER_*` for a meaningful assertion. The default
> seeded admin may already be verified, in which case the check passes trivially.

## Running

Each verification method is a Playwright **project**. Pick one with
`--project=<name>`, and serve the app at that method's registered host using the
matching `front/` script (real IdPs only redirect back to a known host):

| `--project`     | run in `front/`                | serves at                  | automatable           |
| --------------- | ------------------------------ | -------------------------- | --------------------- |
| `fake_sso`      | `npm start`                    | `http://localhost:3000`    | ✅ (see note)         |
| `keycloak`      | `npm run start:sso:idporten`   | `keycloak-r3tyu.loca.lt`   | ✅                    |
| `auth0`         | `npm run start:sso`            | `sso.dev.govocal.com`      | ✅                    |
| `franceconnect` | `npm run start:sso`            | `sso.dev.govocal.com`      | ✅ (verify selectors) |
| `clave_unica`   | `npm run start:sso:claveunica` | `claveunica-h2dkc.loca.lt` | ✅ (verify selectors) |
| `nemlog_in`     | `npm run start:sso:nemlogin`   | `nemlogin-k3kd.loca.lt`    | ❌ manualOnly         |
| `id_austria`    | `npm run start:sso:idaustria`  | `idaustria-g3fy.loca.lt`   | ❌ manualOnly         |
| `twoday`        | `npm run start:sso:twoday`     | `twoday-h5jkg.loca.lt`     | ❌ manualOnly         |

Then, from `sso-e2e/`:

```bash
npm test -- --project=keycloak          # headless
npm run test:headed -- --project=keycloak   # watch it click
npm run report                          # open the HTML report + traces
npm run list                            # list all method projects
```

`manualOnly` methods (app-push / hardware-token: MitID, BankID/Freja,
Handy-Signatur) are registered for visibility but always skipped — drive those by
hand.

## Confirming this works (no real creds needed)

The `fake_sso` project proves the cross-origin flow end-to-end:

1. Backend up, the fake-IdP express server running on `:8081`, and
   `rake dev:setup_fake_sso` applied (configures the localhost tenant).
2. `npm start` in `front/`.
3. `npm test -- --project=fake_sso` here. Expect redirect to
   `:8081/oauth/authorize`, auto-submit, return, `verified === true`.

> **Open dependency:** the fake-IdP express server source is **not in this repo**
> (`fake_sso/` holds only `node_modules/`). Get it from the team or stand up a
> minimal OIDC stub before running the `fake_sso` project.

## Adding / fixing a method

1. Add (or edit) an entry in `src/methods.ts` — `name` is the `/auth/:provider`
   key, `baseURL` is the registered redirect host, `requiredEnv` lists its creds.
2. Write its IdP login handler in `src/idp/<method>.ts` (export an `IdpLogin`).
   Capture the real form selectors fast with:
   ```bash
   npx playwright codegen <issuer-or-authorize-url>
   ```
   The selectors in the real-IdP handlers (`keycloak`, `auth0`, `franceconnect`,
   `clave_unica`) are best-effort defaults — verify them with codegen.
3. Add its vars to `sso-e2e.example.env`.

## How it fits together

- `src/platform.ts` — platform side: `apiLogin` (→ `cl2_jwt` cookie, mirrors
  `front/cypress/support/commands.ts:172`), `startVerification` (navigates to
  `/auth/:provider` with the params from
  `front/app/api/authentication/singleSignOn.ts`), `expectVerified` (polls
  `web_api/v1/users/me`).
- `src/methods.ts` — the registry of methods, hosts, creds, and handlers.
- `src/idp/*.ts` — per-IdP login handlers.
- `tests/verification.spec.ts` — one spec, run once per method project.
