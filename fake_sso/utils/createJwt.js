const jose = require("jose");

const secret = new TextEncoder().encode(
  "cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2"
);

const alg = "HS256";

const createJwt = () => {
  return new jose.SignJWT({ "urn:example:claim": true })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer("fake_sso")
    .setAudience("govocal_platform")
    .setExpirationTime("2h")
    .sign(secret);
};

module.exports = { createJwt };
