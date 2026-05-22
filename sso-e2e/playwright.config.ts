import path from "path";

import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";

import { METHODS } from "./src/methods";

// Credentials and config come in at startup from .env (gitignored).
dotenv.config({ path: path.join(__dirname, ".env") });

export default defineConfig({
  testDir: "./tests",
  // External IdP round-trips are slow; give each test room.
  timeout: 120_000,
  expect: { timeout: 15_000 },
  // SSO flows are inherently flaky to retry blindly; fail fast and read the trace.
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    // Full trace is the whole point vs. Cypress here: it spans both origins.
    trace: "on",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    // localtunnel / dev hosts may serve self-signed or proxied certs.
    ignoreHTTPSErrors: true,
  },
  // One Playwright "project" per verification method. Select with
  // `--project=<name>`; its baseURL is the host that method's IdP redirects to.
  projects: METHODS.map((method) => ({
    name: method.name,
    use: { baseURL: method.baseURL },
  })),
});
