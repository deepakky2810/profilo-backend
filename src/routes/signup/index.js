const express = require("express");
const router = express.Router();
const pool = require("../../sql/connectionPool");
const { Response } = require("../../utils/networkUtils");
const { insertQuery } = require("../../sql/queries");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const createUserDirectory = (userId) => {
  const relativePath = `../../../userAssets/user-${userId}`;
  const absolutePath = path.resolve(__dirname, relativePath);
  if (!fs.existsSync(absolutePath)) {
    fs.mkdirSync(absolutePath, { recursive: true });
  }
};

router.post("/", async (req, res, next) => {
  const responseObj = new Response();
  const connection = await pool.getConnection();
  console.log("connected as id " + connection.threadId);
  try {
    const { email, password: plainTxtPassword } = req.body;

    const password = await bcrypt.hash(plainTxtPassword, 12);
    const queryTemplate =
      "INSERT INTO users (user_id, email_id, password1) VALUES(0, ?, ?)";
    const formatterArray = [email, password];
    const mySqlResponse = await insertQuery(
      connection,
      queryTemplate,
      formatterArray
    );
    createUserDirectory(mySqlResponse.insertId);
    responseObj.successResponse(Response.RESPONSE_CODE.SUCCESS);
    res.send(responseObj);
  } catch (err) {
    console.log(err);
    if (err.code === "ER_DUP_ENTRY")
      responseObj.failureResponse(
        Response.RESPONSE_CODE.FAILURE_EMAIL_ALREADY_EXISTS,
        "User with entered email already exists"
      );
    else {
      responseObj.failureResponse(Response.RESPONSE_CODE.FAILURE, err.code);
    }
    res.send(responseObj);
  } finally {
    connection.release();
    console.log("connection released");
  }
});

module.exports = router;
