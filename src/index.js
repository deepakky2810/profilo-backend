const express = require("express");
const app = express();
const path = require("path");
const routes = require("./routes/index");
const bodyParser = require("body-parser");
const cors = require("cors");
const {
  setResponseContentTypeJson,
  setCSPHeader,
} = require("./middlewares/middlewares");
const { ASSETS_FOLDER_NAME } = require("./utils/constants");

app.use(setCSPHeader);
app.use(express.static(path.resolve(__dirname, `../${ASSETS_FOLDER_NAME}`)));
app.use(bodyParser.json({ limit: "5mb" }));
app.use(cors());
app.use(setResponseContentTypeJson);
app.use("/", routes);

const serverPort = 4445;
app.listen(serverPort, () => {
  console.log(`Server is running at port ${serverPort}`);
});
