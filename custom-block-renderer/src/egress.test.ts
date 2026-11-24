import assert from "node:assert/strict";
import { test } from "node:test";

import {
  isAllowedRequest,
  isPrivateHost,
  parseAllowedOrigins,
} from "./egress.ts";

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

test("a public host nobody listed is refused", () => {
  // The page holds a token that reads this layout's data, and a collector looks
  // exactly like a font host from here.
  assert.equal(isAllowedRequest("https://cdn.example.com/app.js", OWN), false);
  assert.equal(
    isAllowedRequest("https://attacker.example/collect?t=ey.J", OWN),
    false
  );
});

test("a deployment can add an origin, matched exactly", () => {
  const allowed = [APP, ...parseAllowedOrigins("https://tiles.example.com")];

  assert.equal(
    isAllowedRequest("https://tiles.example.com/1/2/3.png", allowed),
    true
  );
  assert.equal(isAllowedRequest("https://other.example.com/", allowed), false);
  // A host that merely ends in the listed one is a different host.
  assert.equal(
    isAllowedRequest("https://tiles.example.com.evil.test/", allowed),
    false
  );
  // And so is the same host on another scheme or port.
  assert.equal(isAllowedRequest("http://tiles.example.com/", allowed), false);
  assert.equal(
    isAllowedRequest("https://tiles.example.com:8443/", allowed),
    false
  );
});

test("the configured list drops what cannot be an origin, and what is private", () => {
  assert.deepEqual(parseAllowedOrigins(undefined), []);
  assert.deepEqual(
    parseAllowedOrigins(
      "https://tiles.example.com/styles/x.json, http://169.254.169.254," +
        " http://db.internal, file:///etc/passwd, not an origin, "
    ),
    ["https://tiles.example.com"]
  );
});

test("a socket is held to the same list as a request", () => {
  assert.equal(isAllowedRequest("wss://riverside.govocal.com/x", OWN), true);
  assert.equal(isAllowedRequest("wss://attacker.example/x", OWN), false);
  // Vite's reload socket in development, on the front end's own port.
  assert.equal(
    isAllowedRequest("ws://localhost:3000/", ["http://localhost:3000"]),
    true
  );
  assert.equal(
    isAllowedRequest("ws://localhost:5000/", ["http://localhost:3000"]),
    false
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
    "custom_block_renderer.internal",
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
