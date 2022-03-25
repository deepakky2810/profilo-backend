const express = require("express");
const router = express.Router();
const { JWTVerification } = require("../middlewares/middlewares");
const addOrEditProfileDetails = require("./addOrEditProfileDetails");
const getProfileDetails = require("./getProfileDetails");
const sendGoogleToken = require("./sendGoogleToken");
const signup = require("./signup");
const signin = require("./signin");

const ENDPOINT_SUFFIX = "ky";

router.use(`/addOrEditProfileDetails.${ENDPOINT_SUFFIX}`, [
  JWTVerification,
  addOrEditProfileDetails,
]);
router.use(`/getProfileDetails.${ENDPOINT_SUFFIX}`, [
  JWTVerification,
  getProfileDetails,
]);
router.use(`/signup.${ENDPOINT_SUFFIX}`, signup);
router.use(`/signin.${ENDPOINT_SUFFIX}`, signin);
router.use(`/sendGoogleToken.${ENDPOINT_SUFFIX}`, sendGoogleToken);

module.exports = router;
