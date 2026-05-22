import { fakeSsoLogin } from "./idp/fakeSso";
import { keycloakLogin } from "./idp/keycloak";
import { auth0Login } from "./idp/auth0";
import { franceconnectLogin } from "./idp/franceconnect";
import { claveUnicaLogin } from "./idp/claveUnica";
import { IdpLogin } from "./idp/types";

export interface MethodConfig {
  /** Provider key as used in the backend route `/auth/:provider`. */
  name: string;
  /** Human-readable name for logs/reports. */
  displayName: string;
  /**
   * Base URL the app must be served at for this method, because the real IdP
   * only redirects back to a registered redirect URI. These hostnames mirror
   * the `start:sso:*` scripts in `front/package.json`.
   */
  baseURL: string;
  /** The `front/` npm script that serves the app at `baseURL`. */
  startScript: string;
  /** Env var names that must be present, else the method is skipped. */
  requiredEnv: string[];
  /** Drives the external IdP's login form. Absent for manualOnly methods. */
  idpLogin?: IdpLogin;
  /**
   * App-push / hardware-token flows (e.g. real MitID, BankID, Handy-Signatur)
   * that cannot be driven headlessly. Registered for visibility, always skipped.
   */
  manualOnly?: boolean;
  /** Anything a runner should know before picking this method. */
  note?: string;
}

const LOCAL = "http://localhost:3000";

export const METHODS: MethodConfig[] = [
  {
    name: "fake_sso",
    displayName: "Fake SSO (local)",
    baseURL: LOCAL,
    startScript: "start", // plain dev server; no special hostname needed
    requiredEnv: [], // no real creds; FAKE_SSO_PROFILE is optional
    idpLogin: fakeSsoLogin,
    note: "Needs the fake-IdP express server on :8081 and `rake dev:setup_fake_sso`. The server source is not in this repo — see README.",
  },
  {
    name: "keycloak",
    displayName: "Keycloak / ID-Porten (test realm)",
    baseURL: "https://keycloak-r3tyu.loca.lt",
    startScript: "start:sso:idporten",
    requiredEnv: ["KEYCLOAK_TEST_USER", "KEYCLOAK_TEST_PASSWORD"],
    idpLogin: keycloakLogin,
  },
  {
    name: "auth0",
    displayName: "Auth0",
    baseURL: "https://sso.dev.govocal.com",
    startScript: "start:sso",
    requiredEnv: ["AUTH0_TEST_USER", "AUTH0_TEST_PASSWORD"],
    idpLogin: auth0Login,
    note: "No dedicated start:sso:auth0 script — uses the generic sso.dev.govocal.com host; ensure that redirect URI is registered in the Auth0 tenant.",
  },
  {
    name: "franceconnect",
    displayName: "FranceConnect (integration)",
    baseURL: "https://sso.dev.govocal.com",
    startScript: "start:sso",
    requiredEnv: ["FRANCECONNECT_TEST_USER", "FRANCECONNECT_TEST_PASSWORD"],
    idpLogin: franceconnectLogin,
    note: "FranceConnect integration env. The login is a two-step hub: pick the test identity provider, then enter test credentials. Confirm selectors with `playwright codegen`.",
  },
  {
    name: "clave_unica",
    displayName: "Clave Única (test)",
    baseURL: "https://claveunica-h2dkc.loca.lt",
    startScript: "start:sso:claveunica",
    requiredEnv: ["CLAVE_UNICA_TEST_USER", "CLAVE_UNICA_TEST_PASSWORD"],
    idpLogin: claveUnicaLogin,
  },

  // --- Registered but not automatable headlessly (app-push / hardware token) ---
  {
    name: "nemlog_in",
    displayName: "NemLog-in / MitID",
    baseURL: "https://nemlogin-k3kd.loca.lt",
    startScript: "start:sso:nemlogin",
    requiredEnv: [],
    manualOnly: true,
    note: "MitID uses an app push / code-display device. Drive by hand.",
  },
  {
    name: "id_austria",
    displayName: "ID Austria",
    baseURL: "https://idaustria-g3fy.loca.lt",
    startScript: "start:sso:idaustria",
    requiredEnv: [],
    manualOnly: true,
    note: "ID Austria uses Handy-Signatur / app approval. Drive by hand.",
  },
  {
    name: "twoday",
    displayName: "TwoDay (BankID / Freja eID+)",
    baseURL: "https://twoday-h5jkg.loca.lt",
    startScript: "start:sso:twoday",
    requiredEnv: [],
    manualOnly: true,
    note: "BankID / Freja eID+ require a mobile app. Drive by hand.",
  },
];

export const getMethod = (name: string): MethodConfig => {
  const method = METHODS.find((m) => m.name === name);
  if (!method) {
    throw new Error(`Unknown verification method: ${name}`);
  }
  return method;
};

/** True when every required credential is present in the environment. */
export const hasRequiredEnv = (method: MethodConfig): boolean =>
  method.requiredEnv.every((key) => !!process.env[key]);
