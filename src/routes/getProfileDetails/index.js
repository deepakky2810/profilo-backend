const express = require("express");
const router = express.Router();
const pool = require("../../sql/connectionPool");
const { Response } = require("../../utils/networkUtils");
const { selectQuery } = require("../../sql/queries");
const { SIGN_IN_METHODS } = require("../../utils/constants");

router.get("/", async (req, res, next) => {
  const { userId, signInMethod } = req.query;
  const responseObj = new Response();
  const connection = await pool.getConnection();
  console.log("connected as id " + connection.threadId);

  try {
    let respBody;
    const rows = await selectQuery(
      connection,
      `SELECT * from user_profile_data WHERE ${
        signInMethod === SIGN_IN_METHODS.GOOGLE
          ? "fk_user_google_sub_id"
          : "fk_user_id"
      } = ${userId}`
    );

    if (rows.length === 0) {
      responseObj.successResponse(
        Response.RESPONSE_CODE.SUCCESS_PROFILE_NOT_EXISTS
      );
    } else {
      respBody = {
        profileDataId: rows[0].profile_data_id,
        userId:
          signInMethod === SIGN_IN_METHODS.GOOGLE
            ? rows[0].fk_user_google_sub_id
            : rows[0].fk_user_id,
        firstName: rows[0].firstname,
        middleName: rows[0].middlename,
        lastName: rows[0].lastname,
        dob: rows[0].dob,
        profilePictureUrl: rows[0].profile_picture_url,
        facebookUrl: rows[0].facebook_url,
        linkedinUrl: rows[0].linkedin_url,
        instagramUrl: rows[0].instagram_url,
        githubUrl: rows[0].github_url,
      };
      const workExps = await selectQuery(
        connection,
        `SELECT * from work_experience WHERE fk_profile_data_id = ${respBody.profileDataId}`
      );
      respBody.workExperiences = [
        ...workExps.map((workExp) => ({
          workExperienceId: workExp.work_experience_id,
          profileDataId: workExp.fk_profile_data_id,
          startDate: workExp.start_date,
          endDate: !!workExp.end_date
            ? workExp.end_date
            : moment().format("YYYY-MM-DD"),
          presentlyWorking: workExp.presently_working,
          jobTitle: workExp.job_title,
          company: workExp.company_name,
          companyLogoUrl: workExp.company_logo_url,
          jobDescription: workExp.job_description,
        })),
      ];

      responseObj.successResponse(
        Response.RESPONSE_CODE.SUCCESS_PROFILE_EXISTS,
        respBody
      );
    }
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
