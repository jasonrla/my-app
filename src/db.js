const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'database-5.csgsvyzungh7.us-east-1.rds.amazonaws.com',
  database: 'cariola',
  password: 'B0n5f8z42',
  port: 5432,
});

const storeEmployee = async (id_empleado, nombre, apellido, edad) => {
    const res = await pool.query('INSERT INTO cariola(id_empleado, nombre, apellido, edad) VALUES($1, $2, $3, $4) RETURNING *', [id_empleado, nombre, apellido, edad]);
    return res.rows[0];
  };
  

module.exports = {
    storeEmployee,
};
