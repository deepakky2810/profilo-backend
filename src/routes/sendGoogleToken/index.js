const express = require("express");
const router = express.Router();
const pool = require("../../sql/connectionPool");
const { Response } = require("../../utils/networkUtils");
const { insertQuery, selectQuery, updateQuery } = require("../../sql/queries");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const path = require("path");
const { OAuth2Client } = require("google-auth-library");
const { GOOGLE_CREDS, JWT_SECRET_KEY } = require("../../utils/constants");

const createUserDirectory = (userId) => {
  const relativePath = `../../../userAssets/user-${userId}`;
  const absolutePath = path.resolve(__dirname, relativePath);
  if (!fs.existsSync(absolutePath)) {
    fs.mkdirSync(absolutePath, { recursive: true });
  }
};

async function verify(token) {
  const client = new OAuth2Client(GOOGLE_CREDS.client_id);
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: GOOGLE_CREDS.client_id,
  });
  return ticket.getPayload();
  //   const userid = payload['sub'];
  //   return userid;
}
// verify().catch(console.error);

router.post("/", async (req, res, next) => {
  const responseObj = new Response();
  const connection = await pool.getConnection();
  console.log("connected as id " + connection.threadId);
  try {
    const { tokenId } = req.body;

    const userDetails = await verify(tokenId);
    console.log("userDetails:", userDetails);

    const rows = await selectQuery(
      connection,
      `SELECT * from users_google WHERE user_google_sub_id = ${userDetails.sub}`
    );

    if (rows.length === 0) {
      const queryTemplate = "INSERT INTO users_google VALUES(?, ?)";
      const formatterArray = [userDetails.sub, userDetails.email];
      const mySqlResponse = await insertQuery(
        connection,
        queryTemplate,
        formatterArray
      );
      createUserDirectory(mySqlResponse.insertId);
      console.log("users-google::insertId:", mySqlResponse.insertId);

      const prQueryTemplate =
        "INSERT INTO user_profile_data (profile_data_id, fk_user_google_sub_id, firstname, lastname, profile_picture_url) VALUES(0, ?, ?, ?, ?)";

      const prFormatterArray = [
        userDetails.sub,
        userDetails.given_name,
        userDetails.family_name,
        userDetails.picture,
      ];
      const insertResponse = await insertQuery(
        connection,
        prQueryTemplate,
        prFormatterArray
      );
    } else {
      // update the data of the user
      const prQueryTemplate =
        "UPDATE user_profile_data SET firstname = ?, lastname = ?, profile_picture_url = ? WHERE fk_user_google_sub_id = ?";
      const prFormatterArray = [
        userDetails.given_name,
        userDetails.family_name,
        userDetails.picture,
        userDetails.sub,
      ];
      const queryResp = await updateQuery(
        connection,
        prQueryTemplate,
        prFormatterArray
      );
    }

    const jwtToken = jwt.sign(
      {
        userId: userDetails.sub,
        email: userDetails.email,
      },
      JWT_SECRET_KEY
    );
    responseObj.successResponse(Response.RESPONSE_CODE.SUCCESS, jwtToken);
    res.send(responseObj);
  } catch (err) {
    console.log(err);

    responseObj.failureResponse(Response.RESPONSE_CODE.FAILURE, err.code);

    res.send(responseObj);
  } finally {
    connection.release();
    console.log("connection released");
  }
});

module.exports = router;
