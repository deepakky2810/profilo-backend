const mysql = require("mysql");

const configs = {
  connectionLimit: 2,
  host: "localhost", //"34.72.180.149",
  user: "root",
  password: "root",
  database: "profilo", //"urlshortner",
};

const pool = mysql.createPool(configs);
const getConnection = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((error, connection) => {
      if (error) reject(error);
      resolve(connection);
    });
  });
};

console.log("pool created");
module.exports = {
  getConnection,
};
