const express = require("express");
const router = express.Router();
const { createJwt } = require("../utils/createJwt");

// GET home page
router.get("/", (_req, res) => {
  res.render("index", { title: "Fake SSO" });
});

// The authorization route (same as homepage)
router.get("/oauth2/authorize", (_req, res) => {
  res.render("index", { title: "Fake SSO" });
});

// The token route (receives code, returns token)
router.post("/oauth2/token", async (_req, res) => {
  const jwt = await createJwt();

  res.json({
    token_type: "Bearer",
    access_token: jwt,
  });
});

module.exports = router;
