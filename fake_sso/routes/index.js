var express = require("express");
var router = express.Router();
var jose = require("jose");

// GET home page
router.get("/", function (_req, res) {
  res.render("index", { title: "Fake SSO" });
});

// The authorization route (same as homepage)
router.get("/oauth2/authorize", function (_req, res) {
  res.render("index", { title: "Fake SSO" });
});

// The token route (receives code, returns token)
router.post("/oauth2/token", function (req, res) {
  var secret = new TextEncoder().encode(
    "cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2"
  );
  var alg = "HS256";

  var promise = new jose.SignJWT({ "urn:example:claim": true })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer("fake_sso")
    .setAudience("govocal_platform")
    .setExpirationTime("2h")
    .sign(secret);

  promise.then((jwt) => {
    res.json({
      token_type: "Bearer",
      access_token: jwt,
    });
  });
});

module.exports = router;
