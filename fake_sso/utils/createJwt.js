const jose = require("jose");
const { v4: uuidv4 } = require("uuid");

const secret = new TextEncoder().encode(
  "cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2"
);

const alg = "HS256";

const createJwt = () => {
  const uid = uuidv4();

  return new jose.SignJWT({
    uid,
    email: `${uid.slice(6)}@example.com`,
  })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer("fake_sso")
    .setAudience("govocal_platform")
    .setExpirationTime("2h")
    .sign(secret);
};

module.exports = { createJwt };
