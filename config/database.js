const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',      // atau '127.0.0.1'
    user: 'root',           // user default XAMPP
    password: '',           // KOSONG untuk XAMPP default
    database: 'toko_retail', // pastikan sudah dibuat
    port: 3306,             // port default MySQL
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;