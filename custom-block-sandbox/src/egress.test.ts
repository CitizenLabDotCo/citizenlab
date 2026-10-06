import assert from "node:assert/strict";
import { test } from "node:test";

import { isAllowedRequest, isPrivateHost } from "./egress.ts";

const APP = "https://riverside.govocal.com";
const OWN = [APP];

test("the app's own origins are always allowed, even when they are private hosts", () => {
  assert.equal(
    isAllowedRequest(`${APP}/web_api/v1/reporting_queries`, OWN),
    true
  );
  // Development: the SPA on one port, the API and its uploads on another.
  const dev = ["http://localhost:3000", "http://localhost:4000"];
  assert.equal(
    isAllowedRequest("http://localhost:3000/en/block-harness", dev),
    true
  );
  assert.equal(
    isAllowedRequest("http://localhost:4000/uploads/logo.png", dev),
    true
  );
  assert.equal(isAllowedRequest("http://localhost:5000/", dev), false);
});

test("an origin that is missing or unreadable grants nothing", () => {
  assert.equal(isAllowedRequest(`${APP}/x`, [APP, undefined]), true);
  assert.equal(isAllowedRequest("https://example.com/", []), false);
  assert.equal(
    isAllowedRequest("https://example.com/", ["not an origin"]),
    false
  );
});

test("public web hosts are allowed, for the CDN and the fonts the app loads", () => {
  assert.equal(isAllowedRequest("https://cdn.example.com/app.js", OWN), true);
  assert.equal(
    isAllowedRequest("https://fonts.gstatic.com/s/a.woff2", OWN),
    true
  );
});

test("the draft bundle and inlined assets are allowed", () => {
  assert.equal(isAllowedRequest(`blob:${APP}/5e3b-9f1a`, OWN), true);
  assert.equal(isAllowedRequest("data:image/png;base64,AAAA", OWN), true);
});

test("files and other schemes are refused", () => {
  assert.equal(isAllowedRequest("file:///etc/passwd", OWN), false);
  assert.equal(isAllowedRequest("ftp://example.com/x", OWN), false);
  assert.equal(isAllowedRequest("not a url", OWN), false);
});

test("private networks are refused unless they are the app itself", () => {
  for (const host of [
    "localhost",
    "127.0.0.1",
    "10.0.0.8",
    "172.16.5.4",
    "172.31.255.1",
    "192.168.1.1",
    "169.254.169.254",
    "100.64.0.1",
    "0.0.0.0",
    "[::1]",
    "[fd00::1]",
    "[fe80::1]",
    "custom_block_sandbox.internal",
    "db.local",
    "metadata.google.internal",
  ]) {
    assert.equal(isAllowedRequest(`http://${host}/`, OWN), false, host);
  }
});

test("public addresses are not private", () => {
  assert.equal(isPrivateHost("8.8.8.8"), false);
  assert.equal(isPrivateHost("172.32.0.1"), false);
  assert.equal(isPrivateHost("example.com"), false);
  assert.equal(isPrivateHost("[2001:db8::1]"), false);
});
