const express = require("express");
const router = express.Router();
const pool = require("../../sql/connectionPool");
const { Response } = require("../../utils/networkUtils");
const { selectQuery } = require("../../sql/queries");

const log = console.log;

router.get("/", async (req, res, next) => {
  const responseObj = new Response();
  try {
    const connection = await pool.getConnection();
    log("connected as id " + connection.threadId);
    const rows = await selectQuery(connection, "SELECT * from student");

    responseObj.successResponse(Response.RESPONSE_CODE.SUCCESS, rows);
    res.send(responseObj);
  } catch (err) {
    responseObj.failureResponse(Response.RESPONSE_CODE.FAILURE, err);
    res.send(responseObj);
  }
});

module.exports = router;
