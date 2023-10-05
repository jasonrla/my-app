const express = require('express');
const path = require('path');
const cors = require('cors');
const yaml = require('js-yaml');
const fs = require('fs');
const db = require('./db');
const port = 3000;

const app = express();


// Load config.yml
const config = yaml.load(fs.readFileSync('config.yml', 'utf8'));

app.use(express.static(path.join(__dirname, '../frontend/public')));

app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/html/login.html'));
});

app.get('/login-script', (req, res) => {
  res.sendFile(path.join(__dirname, './JS/login-script.js'));
});

app.get('/img', (req, res) => {
  res.sendFile(path.join(__dirname, './img/logo.svg'));
});

app.get('/libs/aws-cognito', (req, res) => {
  res.sendFile(path.join(__dirname, './libs/amazon-cognito-identity.min.js'));
});

app.get('/libs/aws-cognito-sdk', (req, res) => {
  res.sendFile(path.join(__dirname, './libs/aws-cognito-sdk.min.js'));
});

app.get('/const', (req, res) => {
  res.sendFile(path.join(__dirname, './JS/const.js'));
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