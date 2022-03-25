const express = require("express");
const router = express.Router();
const pool = require("../../sql/connectionPool");
const { Response } = require("../../utils/networkUtils");
const { insertProfileDetails, editProfileDetails } = require("./utils");

router.post("/", async (req, res, next) => {
  const { profileDataId, dob } = req.body;
  const responseObj = new Response();
  const connection = await pool.getConnection();
  console.log("connected as id " + connection.threadId);

  try {
    let profileDataIdNew;
    req.body = { ...req.body, dob: dob.substring(0, 10) };

    if (!profileDataId) {
      profileDataIdNew = await insertProfileDetails(connection, req.body);
    } else {
      profileDataIdNew = await editProfileDetails(connection, req.body);
    }

    responseObj.successResponse(Response.RESPONSE_CODE.SUCCESS, {
      key: "insertionId",
      value: profileDataIdNew,
    });
    res.send(responseObj);
  } catch (err) {
    console.log(err);
    responseObj.failureResponse(Response.RESPONSE_CODE.FAILURE, err);
    res.send(responseObj);
  } finally {
    connection.release();
    console.log("connection released");
  }
});

module.exports = router;
