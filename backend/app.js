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
  //res.sendFile(path.join(__dirname, './JS/login-script.js'));
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

const bodyParser = require('body-parser');
const AWS = require('aws-sdk');  // Añadir esto

const AWSCognito = require('./libs/aws-cognito-sdk.min.js');
const AmazonCognitoIdentity = require('./libs/amazon-cognito-identity.min.js');
console.log('AWSCognito:', AWSCognito);

// Comprueba si AWSCognito está definido
if (typeof AWSCognito === "undefined") {
  console.error("AWSCognito está undefined. Asegúrate de que las rutas y las versiones sean correctas.");
  process.exit(1);
}

AWSCognito.config.region = 'us-east-1'; 

  
const poolData = {
      UserPoolId: 'us-east-1_ekaFmTqIv',
      ClientId: '69i8c6c0mnq066d71qc2a8gm74'
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

app.use(bodyParser.json());

  app.post('/login', (req, res) => {
      const { username, password } = req.body;
  
      const authenticationData = {
          Username: username,
          Password: password,
      };
  
      const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
  
      const userData = {
          Username: username,
          Pool: userPool
      };
  
      const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  
      cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: function(result) {
              // El usuario se ha autenticado correctamente
              res.json({ success: true});
          },
          onFailure: function(err) {
              // Error en la autenticación
              res.status(400).json({ success: false, message: err.message });
          },
          newPasswordRequired: function(userAttributes, requiredAttributes) {
              // El usuario necesita establecer una nueva contraseña
              res.status(400).json({ success: false, message: 'New password required' });
          }
      });
  });
  



app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});