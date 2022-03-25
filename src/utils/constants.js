const JWT_SECRET_KEY =
  "evgsbhwejkf212!@T#*&2332y&Y(*&I*UHNbjkn,ijhnk,hroejsk382**()*(R%E$^&I";
const ASSETS_FOLDER_NAME = "userAssets";
const SIGN_IN_METHODS = {
  MANUAL: "MANUAL",
  GOOGLE: "GOOGLE",
};
const GOOGLE_CREDS = {
  client_id:
    "367179660889-3r9bkq7eu3flp0c6eoapedr3ml7ncqgv.apps.googleusercontent.com",
  project_id: "editable-profile-page",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_secret: "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",
  javascript_origins: ["http://localhost:4446"],
};

module.exports = {
  JWT_SECRET_KEY,
  ASSETS_FOLDER_NAME,
  GOOGLE_CREDS,
  SIGN_IN_METHODS,
};
