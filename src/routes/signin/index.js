const express = require("express");
const router = express.Router();
const pool = require("../../sql/connectionPool");
const { Response } = require("../../utils/networkUtils");
const { selectQuery } = require("../../sql/queries");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../../utils/constants");

router.post("/", async (req, res, next) => {
  const responseObj = new Response();
  const connection = await pool.getConnection();
  console.log("connected as id " + connection.threadId);
  try {
    const { email, password: plainTxtPassword } = req.body;

    const query = `SELECT * FROM users WHERE email_id = '${email}'`;

    const rows = await selectQuery(connection, query);
    if (
      rows.length === 1 &&
      (await bcrypt.compare(plainTxtPassword, rows[0].password1))
    ) {
      const user = rows[0];
      const jwtToken = jwt.sign(
        {
          userId: user.user_id,
          email: user.email_id,
        },
        JWT_SECRET_KEY
      );
      responseObj.successResponse(Response.RESPONSE_CODE.SUCCESS, jwtToken);
    } else {
      responseObj.failureResponse(
        Response.RESPONSE_CODE.FAILURE_INVALID_CREDENTIALS,
        "Invalid email/password 🤷‍♂️🤷‍♀️"
      );
    }

    res.send(responseObj);
  } catch (err) {
    console.log(err);
    responseObj.failureResponse(
      Response.RESPONSE_CODE.FAILURE_INVALID_CREDENTIALS,
      err.code
    );
    res.send(responseObj);
  } finally {
    connection.release();
    console.log("connection released");
  }
});

module.exports = router;
