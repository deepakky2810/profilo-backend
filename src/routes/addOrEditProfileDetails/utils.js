const {
  selectQuery,
  insertQuery,
  updateQuery,
  bulkInsertQuery,
} = require("../../sql/queries");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const {
  ASSETS_FOLDER_NAME,
  SIGN_IN_METHODS,
} = require("../../utils/constants");
const HOST_NAME = "http://localhost:4445";

const generateFileName = (baseName) =>
  `${baseName}-${moment().format("YYYY-MM-DD-HHmmss")}`;

function imageSaver(base64Image, userId, imageType) {
  if (!base64Image.startsWith("data")) {
    // this means it is already a URL(the link to abstract api default avatar)
    // then don't change anything, return the url as it is
    return base64Image;
  }

  const extension = base64Image.split(";")[0].split("/")[1];
  const re = new RegExp(`${base64Image.split(";")[0]};base64,`);
  const base64Data = base64Image.replace(re, "");
  const USER_FOLDER = `user-${userId}`;
  const FILE_NAME = `${USER_FOLDER}/${generateFileName(
    imageType
  )}.${extension}`;
  const absoluteFileName = path.resolve(
    __dirname,
    `../../../${ASSETS_FOLDER_NAME}/${FILE_NAME}`
  );
  fs.writeFile(absoluteFileName, base64Data, "base64", function (err) {
    console.log(err);
  });

  const profilePictureUrl = `${HOST_NAME}/${FILE_NAME}`;
  return profilePictureUrl;
}

const userProfileDataInserter = async (
  connection,
  {
    userId,
    firstName,
    middleName,
    lastName,
    dob,
    profilePictureUrl,
    facebookUrl,
    linkedinUrl,
    instagramUrl,
    githubUrl,
    signInMethod,
  }
) => {
  try {
    const queryTemplate = `INSERT INTO user_profile_data (profile_data_id, ${
      signInMethod === SIGN_IN_METHODS.GOOGLE
        ? "fk_user_google_sub_id"
        : "fk_user_id"
    }, firstname, middlename, lastname, dob, profile_picture_url, facebook_url, linkedin_url, instagram_url, github_url) VALUES(0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const formatterArray = [
      userId,
      firstName,
      middleName,
      lastName,
      dob,
      profilePictureUrl,
      facebookUrl,
      linkedinUrl,
      instagramUrl,
      githubUrl,
    ];
    const mySqlResponse = await insertQuery(
      connection,
      queryTemplate,
      formatterArray
    );
  } catch (err) {
    throw err;
  }
  return mySqlResponse.insertId;
};

const workExperienceDataInserter = async (
  connection,
  profileDataId,
  workExps
) => {
  try {
    const workExpQueryTemplate = "INSERT INTO work_experience VALUES ?";
    workExps.forEach((workExp, idx) => {
      workExp.endDate = workExp.presentlyWorking
        ? null
        : workExp.endDate.substring(0, 10);
      workExp.startDate = workExp.startDate.substring(0, 10);
      if (!!workExp.companyLogoUrl) {
        const fileName = imageSaver(
          workExp.companyLogoUrl,
          userId,
          `company-logo-${idx}`
        );
        workExp.companyLogoUrl = fileName;
      }
    });
    if (workExps && workExps.length > 0) {
      const workExpInsertResp = await bulkInsertQuery(
        connection,
        workExpQueryTemplate,
        [
          workExps.map((workExp) => [
            0,
            profileDataId,
            ...Object.values(workExp),
          ]),
        ]
      );
    }
  } catch (err) {
    throw err;
  }
};

const insertProfileDetails = async (connection, reqBody) => {
  let profileDataId;
  try {
    profilePictureUrl = imageSaver(
      profilePictureUrl,
      userId,
      "profile-picture"
    );

    profileDataId = await userProfileDataInserter(connection, reqBody);
    await workExperienceDataInserter(
      connection,
      profileDataId,
      reqBody.workExperiences
    );
  } catch (err) {
    throw err;
  }
  return profileDataId;
};

const editProfileDetails = async (
  connection,
  {
    userId,
    profileDataId,
    firstName,
    middleName,
    lastName,
    dob,
    profilePictureUrl,
    facebookUrl,
    linkedinUrl,
    instagramUrl,
    githubUrl,
    workExperiences,
  }
) => {
  const queryTemplate =
    "UPDATE user_profile_data SET firstname = ?, middlename = ?, lastname = ?, dob = ?, profile_picture_url = ?, facebook_url = ?, linkedin_url = ?, instagram_url = ?, github_url = ? WHERE profile_data_id = ?";

  profilePictureUrl = imageSaver(profilePictureUrl, userId, "profile-picture");

  const formatterObj = [
    firstName,
    middleName,
    lastName,
    dob,
    profilePictureUrl,
    facebookUrl,
    linkedinUrl,
    instagramUrl,
    githubUrl,
    profileDataId,
  ];

  try {
    const profileDataEditResp = await updateQuery(
      connection,
      queryTemplate,
      formatterObj
    );

    workExperiences.forEach(async (workExp, idx) => {
      try {
        workExp.endDate = workExp.presentlyWorking
          ? null
          : workExp.endDate.substring(0, 10);
        workExp.startDate = workExp.startDate.substring(0, 10);
        if (!!workExp.companyLogoUrl) {
          const fileName = imageSaver(
            workExp.companyLogoUrl,
            userId,
            `company-logo-${idx}`
          );
          workExp.companyLogoUrl = fileName;
        }

        if (!workExp.workExperienceId) {
          const workExpQueryTemplate = "INSERT INTO work_experience VALUES (?)";
          const workExpInsertResp = await bulkInsertQuery(
            connection,
            workExpQueryTemplate,
            [[0, profileDataId, ...Object.values(workExp)]]
          );
        } else {
          const workExpQueryTemplate =
            "UPDATE work_experience SET fk_profile_data_id = ?, start_date = ?, end_date = ?, presently_working = ?, job_title = ?, company_name = ?, company_logo_url = ?, job_description = ? WHERE work_experience_id = ?";
          const formatterObj = [
            profileDataId,
            workExp.startDate,
            workExp.endDate,
            workExp.presentlyWorking,
            workExp.jobTitle,
            workExp.company,
            workExp.companyLogoUrl,
            workExp.jobDescription,
            workExp.workExperienceId,
          ];
          const workExpEditResp = await updateQuery(
            connection,
            workExpQueryTemplate,
            formatterObj
          );
        }
      } catch (err) {
        console.log(err);
      }
    });
  } catch (err) {
    throw err;
  }

  return profileDataId;
};

module.exports = {
  insertProfileDetails,
  editProfileDetails,
};
