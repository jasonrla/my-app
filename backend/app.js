const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const port = 3000;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/public', express.static('backend/public'));

const poolData = {
    UserPoolId: 'us-east-1_ekaFmTqIv',
    ClientId: '69i8c6c0mnq066d71qc2a8gm74'
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

const region = "us-east-1";
const userPoolId = poolData['UserPoolId'];
const YOUR_SECRET_KEY = "Hola_como_estas";
let accessToken = "";

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/login.html');
});

app.post('/login', (req, res) => {
    console.log("reqBody: "+req.body.username);
    console.log("reqBody: "+req.body.password);
  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
      Username: req.body.username,
      Password: req.body.password,
  });

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser({
      Username: req.body.username,
      Pool: userPool
  });

  cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session) => {
          console.log('Authentication Successful!', session);
          
          accessToken = session.getAccessToken().getJwtToken();
          //res.json({ accessToken: accessToken });
          res.redirect('/auditoria');
      },
      onFailure: (err) => {
          console.error('Authentication failed', err);
          res.redirect('/');
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
          // User is being asked for a new password
          res.redirect('/new-password');
      }
  });
});

app.get('/welcome', (req, res) => {
    res.send('Welcome, you are logged in!');
});



app.get('/new-password', (req, res) => {
  res.sendFile(__dirname + '/public/html/new-password.html');
});

app.post('/new-password', (req, res) => {
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser({
      Username: req.body.username,
      Pool: userPool
  });

  cognitoUser.completeNewPasswordChallenge(req.body.newPassword, {}, {
      onSuccess: (session) => {
          console.log('Password change successful!', session);
          res.redirect('/auditoria');
      },
      onFailure: (err) => {
          console.error('Password change failed', err);
          res.redirect('/new-password');
      }
  });
});

app.get('/forgot-password', (req, res) => {
  res.sendFile(__dirname + '/public/html/forgot-password.html');
});

app.post('/forgot-password', (req, res) => {
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser({
      Username: req.body.username,
      Pool: userPool
  });

  cognitoUser.forgotPassword({
      onSuccess: () => {
          console.log('Password reset code sent successfully');
          res.redirect('/confirm-password');
      },
      onFailure: (err) => {
          console.error('Password reset code failed to send', err);
          res.redirect('/forgot-password');
      }
  });
});

app.get('/confirm-password', (req, res) => {
  res.sendFile(__dirname + '/public/html/confirm-password.html');
});

app.post('/confirm-password', (req, res) => {
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser({
      Username: req.body.username,
      Pool: userPool
  });

  cognitoUser.confirmPassword(req.body.code, req.body.newPassword, {
      onSuccess: () => {
          console.log('Password changed successfully');
          res.redirect('/');
      },
      onFailure: (err) => {
          console.error('Password change failed', err);
          res.redirect('/confirm-password');
      }
  });
});


const client = jwksClient({
    jwksUri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`
});

function getKey(header, callback){
    client.getSigningKey(header.kid, function(err, key) {
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
}

const verifyAccessToken = (req, res, next) => {
    console.log(accessToken);

    const authHeader = accessToken;//req.headers['authorization'];
    const token = accessToken;//authHeader && authHeader.split(' ')[1];

    console.log("authHeader: " + authHeader);
    console.log("token: " + token);

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        console.log("jwtverify");
        console.log(req.user);
        next();
    });
};

app.get('/auditoria', verifyAccessToken, (req, res) => {
    console.log("auditoria");
    res.sendFile(__dirname + '/public/html/auditoria.html');
});


app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
});
