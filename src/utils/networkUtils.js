class Response {
  code;
  success;

  constructor() {}

  setData = (data) => {
    this.data = data;
  };

  setCode = (code) => {
    this.code = code;
  };

  setSuccess = (flag) => {
    this.success = flag;
  };

  setMessage = (message) => {
    this.message = message;
  };

  successResponse = (code, data) => {
    this.setCode(code);
    this.setSuccess(true);
    this.setData(data);
  };

  failureResponse = (code, message) => {
    this.setCode(code);
    this.setSuccess(false);
    this.setMessage(message);
  };

  static RESPONSE_CODE = Object.freeze({
    SUCCESS: 20,
    SUCCESS_PROFILE_EXISTS: 21,
    SUCCESS_PROFILE_NOT_EXISTS: 22,
    FAILURE: 10,
    FAILURE_EMAIL_ALREADY_EXISTS: 11,
    FAILURE_INVALID_CREDENTIALS: 12,
  });
}

module.exports = { Response };
