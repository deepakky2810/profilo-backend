const { JWT_SECRET_KEY } = require("../utils/constants");
const jwt = require("jsonwebtoken");

const setResponseContentTypeJson = (req, res, next) => {
  res.header("Content-Type", "application/json");
  next();
};

const setCSPHeader = (req, res, next) => {
  res.set("Content-Security-Policy", "img-src http://localhost:4445");
  next();
};

const JWTVerification = (req, res, next) => {
  if (req.headers["authorization"]) {
    try {
      let authorization = req.headers["authorization"].split(" ");
      if (authorization[0] !== "Bearer") {
        return res.status(401).send();
      } else {
        req.jwt = jwt.verify(authorization[1], JWT_SECRET_KEY);
        return next();
      }
    } catch (err) {
      console.log(err);
      return res.status(403).send();
    }
  } else {
    console.log(err);
    return res.status(401).send();
  }
};

module.exports = {
  setResponseContentTypeJson,
  setCSPHeader,
  JWTVerification,
};
