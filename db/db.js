// db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '',
  user: '',       // 사용자에 맞게 변경
  password: '',   // 비밀번호에 맞게 변경
  database: 'freedb_FitDataBase',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
