const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();
const gvars = require('../utils/const.js');
const { addLog } = require('../utils/functions.js');

const poolData = {
    UserPoolId: process.env.UserPoolId,
    ClientId: process.env.ClientId
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

let accessToken = "";

exports.getLoginPage = (req, res) => {
    gvars.tkn = "";
    addLog(null, "Login.html se muestra en el cliente", "INFO");
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'html', 'login.html'));
};

exports.logout = (req, res) => {
    const cognitoUser = userPool.getCurrentUser();
    const user = req.session.username;
    if (cognitoUser) {
        req.session.destroy(function(err) {
        if (err) {
            console.log(err);
            res.send("Error al cerrar sesión");
        } else {
            cognitoUser.signOut();
            gvars.tkn = "";
            addLog(req.session, `Usuario ${user} se desconectó exitosamente`, "INFO");//gvars.username} se desconectó exitosamente`, "INFO");
            console.log('Usuario desconectado exitosamente');
            res.redirect('/');
        }
});
    } else {
        addLog(null, `Ningún usuario autenticado`, "INFO");
        console.log('Ningún usuario autenticado');
        gvars.tkn = "";
        // Puedes redirigir al usuario a la página de inicio de sesión si no hay usuario autenticado
        res.redirect('/');
    }
};



exports.login = (req, res) => {
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
            gvars.tkn = accessToken;
            req.session.username = cognitoUser.getUsername();
  
            const idToken = session.getIdToken().getJwtToken();
            const decodedToken = jwt.decode(idToken);
            req.session.auditor = decodedToken.name;
            req.session.group = decodedToken['cognito:groups'][0];
            req.session.email = decodedToken.email;

            res.redirect('/auditoria');

            addLog(req.session, `Usuario ${req.session.username} autenticado exitosamente`, "INFO");//gvars.username} autenticado exitosamente`, "INFO");
        },
        onFailure: (err) => {
            addLog(null, `Error en autenticación`, "ERROR");
            console.error('Authentication failed', err);
            res.redirect('/');
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
            res.redirect('/new-password');
        }
    });
};

exports.getNewPasswordPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'html', 'new-password.html'));
};

exports.newPassword = (req, res) => {
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
};

exports.getForgotPasswordPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'html', 'forgot-password.html'));
};

exports.forgotPassword = (req, res) => {
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
};

exports.getConfirmPasswordPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'html', 'confirm-password.html'));
};

exports.confirmPassword = (req, res) => {
    
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



};

