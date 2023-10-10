const express = require('express');
const bodyParser = require('body-parser');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const poolData = {
    UserPoolId: 'us-east-1_ekaFmTqIv',
    ClientId: '69i8c6c0mnq066d71qc2a8gm74'
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/login.html');
});

app.post('/login', (req, res) => {
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
          res.redirect('/welcome');
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
          res.redirect('/welcome');
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


app.get('/welcome', (req, res) => {
    res.send('Welcome, you are logged in!');
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
