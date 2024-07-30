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
  const jwt = await createJwt();

  res.json({
    token_type: "Bearer",
    access_token: jwt,
  });
});

// The resource endpoint (receives token, returns user info)
router.get("/userinfo", (_req, res) => {
  console.log(req.query);
  console.log(req.body);

  res.json({
    // TODO
  });
});

module.exports = router;
