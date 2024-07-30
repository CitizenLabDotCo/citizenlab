const express = require("express");
const router = express.Router();
const { createJwt } = require("../utils/createJwt");

// GET home page
router.get("/", (_req, res) => {
  res.render("index", { title: "Fake SSO" });
});

// The authorization endpoint (same as homepage)
router.get("/oauth2/authorize", (_req, res) => {
  res.render("index", { title: "Fake SSO" });
});

// The token endpoint (receives code, returns token)
router.post("/oauth2/token", async (_req, res) => {
  res.json({
    token_type: "Bearer",
    id_token: await createJwt(),
    access_token: "access_token_abc123",
  });
});

// The resource endpoint (receives token, returns user info)
router.get("/userinfo", (_req, res) => {
  res.json({
    some: "stuff",
  });
});

module.exports = router;
