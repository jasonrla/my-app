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
    res.sendFile(__dirname + '/login.html');
});

app.post('/login', (req, res) => {
    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username : req.body.username,
        Password : req.body.password,
    });
    
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser({
        Username : req.body.username,
        Pool : userPool
    });
    
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (session) => {
            console.log('Authentication Successful!', session);
            res.redirect('/welcome');
        },
        onFailure: (err) => {
            console.error('Authentication failed', err);
            res.redirect('/');
        }
    });
});

app.get('/welcome', (req, res) => {
    res.send('Welcome, you are logged in!');
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
