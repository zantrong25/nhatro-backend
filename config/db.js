//local mysql
// const mysql = require('mysql2');
// require('dotenv').config();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME
// });

// pool.getConnection((err, connection) => {
//   if (err) {
//     console.error('Ket noi MySQL that bai:', err.message);
//   } else {
//     console.log('Ket noi MySQL thanh cong');
//     connection.release();
//   }
// });

// module.exports = pool.promise();
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Ket noi MySQL that bai:', err.message);
  } else {
    console.log('Ket noi MySQL thanh cong');
    connection.release();
  }
});

module.exports = pool.promise();