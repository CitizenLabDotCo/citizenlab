var express = require("express");
var router = express.Router();

// /* GET home page. */
router.get("/", function (_req, res) {
  res.render("index", { title: "Fake SSO" });
});

// The authorization route (same as homepage)
router.get("/oauth2/authorize", function (_req, res) {
  res.render("index", { title: "Fake SSO" });
});

// router.post('/submit_sso', async function (req, _res) {
//   const referer = req.get('referer');
//   const params = new URLSearchParams(referer);
//   const redirect_uri = params.get('redirect_uri');
//   const state = params.get('state');

//   axios.post(
//     redirect_uri,
//     {
//       'omniauth.auth': {
//         provider: 'fake_sso',
//         uid: 'abc123',
//         info: {
//           email: req.body.email,
//           name: 'FAKE NAME'
//         }
//       },
//       'omniauth.state': state
//     }
//   );
// })

module.exports = router;
