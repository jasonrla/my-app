const { Pool } = require('pg');

const pool = new Pool({
  user: 'username',
  host: 'localhost',
  database: 'mydatabase',
  password: 'password',
  port: 5432,
});

const storeValue = async (value) => {
  const res = await pool.query('INSERT INTO my_table(value) VALUES($1) RETURNING *', [value]);
  return res.rows[0];
};

module.exports = {
  storeValue,
};
