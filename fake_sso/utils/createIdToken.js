const jose = require("jose");
const { v4: uuidv4 } = require("uuid");

const secret = new TextEncoder().encode(
  "cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2"
);

const alg = "HS256";

const createIdToken = () => {
  const uid = uuidv4();

  // https://www.iana.org/assignments/jwt/jwt.xhtml
  return new jose.SignJWT({
    uid,
    sub: uid,
    email: `${uid.slice(0, 6)}@example.com`,
    email_verified: true,
    name: "John Doe",
    azp: "govocal_client",
    given_name: "John",
    family_name: "Doe",
    gender: "male",
    birthdate: "2000-01-01",
  })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer("http://host.docker.internal")
    .setAudience("govocal_client")
    .setExpirationTime("2h")
    .sign(secret);
};

module.exports = { createIdToken };
