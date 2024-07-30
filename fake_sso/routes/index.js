var express = require("express");
var router = express.Router();

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
  console.log(req);

  res.json({
    test: "bla",
  });
});

module.exports = router;
