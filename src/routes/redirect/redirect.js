const express = require("express");
const router = express.Router();
const pool = require("../../sql/connectionPool");
const { Response } = require("../../utils/networkUtils");
const { selectQuery } = require("../../sql/queries");

const log = console.log;
const URL_PREFIX = "https://deepak.ky/";

router.get("/", async (req, res, next) => {
  const responseObj = new Response();
  //   log("deepak.yadav:::RequestObj:" + req.baseUrl + ":" + req.originalUrl);
  //   const { longUrl, shortEndPoint } = req.body;
  try {
    const connection = await pool.getConnection();
    const rows = await selectQuery(
      connection,
      `SELECT \`long_url\` FROM \`url_mappings\` WHERE \`short_endpoint\` = '${req.baseUrl.slice(
        1
      )}' AND \`user_id\` = ${-1};`
    );
    const shortUrl = rows[0]["long_url"];
    responseObj.successResponse(Response.RESPONSE_CODE.SUCCESS, shortUrl);
    res.header("Location", shortUrl);
    res.statusCode = 302;
    res.send();
    // log(`Insertion done at ${mySqlResponse.insertId}`);
  } catch (err) {
    log(err);
    responseObj.failureResponse(Response.RESPONSE_CODE.FAILURE, err);
    res.send(responseObj);
  }
});

module.exports = router;
