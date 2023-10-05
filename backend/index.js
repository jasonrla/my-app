const express = require('express');
const cors = require('cors');
const yaml = require('js-yaml');
const fs = require('fs');
const db = require('./db');
const port = 3000;

const app = express();


// Load config.yml
const config = yaml.load(fs.readFileSync('config.yml', 'utf8'));

app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

app.get('/store', async (req, res) => {
    const id_empleado = 1;  // ejemplo
    const nombre = 'Juan';
    const apellido = 'Perez';
    const edad = 30;  // ejemplo
  
    const newEmployee = await db.storeEmployee(id_empleado, nombre, apellido, edad);
    res.json(newEmployee);
  });

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});