const mysql = require("mysql");
const selectQuery = (connection, query) => {
  return new Promise((resolve, reject) => {
    connection.query(query, async (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
};

const insertQuery = (connection, queryTemplate, formatterArray) => {
  const query = mysql.format(queryTemplate, formatterArray);
  return new Promise((resolve, reject) => {
    connection.query(query, async (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

const bulkInsertQuery = (connection, queryTemplate, formatterArray) => {
  return new Promise((resolve, reject) => {
    connection.query(queryTemplate, formatterArray, async (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

const updateQuery = (connection, queryTemplate, formatterObj) => {
  return new Promise((resolve, reject) => {
    connection.query(queryTemplate, [...formatterObj], async (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  selectQuery,
  insertQuery,
  updateQuery,
  bulkInsertQuery,
};
