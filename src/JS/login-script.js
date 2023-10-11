/*// Configuración de Cognito
AWSCognito.config.region = 'us-east-1';

var poolData = {
    UserPoolId: 'us-east-1_ekaFmTqIv',
    ClientId: '69i8c6c0mnq066d71qc2a8gm74'
};
var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
//localStorage.clear();
// Define cognitoUser en el ámbito global
var cognitoUser;

document.getElementById('login-button').addEventListener('click', function() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    var authenticationData = {
        Username: username,
        Password: password,
    };

    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    var userData = {
        Username: username,
        Pool: userPool
    };
    cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function(session) {
            loggedInUsername = cognitoUser.getUsername();
            getUserAttributes(cognitoUser);
            console.log(localStorage.getItem("nombreUsuario"));
            window.location.href = 'auditoria.html'; //'http://cariola-verificacion.s3-website-us-east-1.amazonaws.com/';
        },
        onFailure: function(err) {
            document.querySelector('.error-message').style.display = 'block';
        },
        newPasswordRequired: function(userAttributes, requiredAttributes) {
            document.querySelector('.login-form').style.display = 'none';
            document.querySelector('.change-password-form').style.display = 'block';
        }
    });
});

document.getElementById('forgot-password-link').addEventListener('click', function() {
    var username = document.getElementById('username').value;
    if (username) {
        var userData = {
            Username: username,
            Pool: userPool
        };
        cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

        cognitoUser.forgotPassword({
            onSuccess: function(data) {
                // Ocultar el formulario de inicio de sesión y mostrar el de cambio de contraseña
                document.querySelector('.login-form').style.display = 'none';
                document.querySelector('.reset-password-form').style.display = 'block';
            },
            onFailure: function(err) {
                // Mostrar un mensaje de error
                console.log('Error al enviar el código de verificación: ' + err);
            },
            inputVerificationCode: function() {
                // Ocultar el formulario de inicio de sesión y mostrar el de cambio de contraseña
                document.querySelector('.login-form').style.display = 'none';
                document.querySelector('.reset-password-form').style.display = 'block';
            }
        });
    } else {
        document.querySelector('.error-message-notUser').style.display = 'block';
    }
});

// Añadir un nuevo evento para el botón de reset
document.getElementById('reset-password-button').addEventListener('click', function() {
    var verificationCode = document.getElementById('verification-code').value;
    var newPassword = document.getElementById('reset-password').value;

    if (verificationCode && newPassword) {
        cognitoUser.confirmPassword(verificationCode, newPassword, {
            onSuccess() {
                document.querySelector('.success-message-reset').style.display = 'block';
                alert('Contraseña cambiada con éxito');
                window.location.href = 'login.html';
            },
            onFailure(err) {
                document.querySelector('.error-message-reset').style.display = 'block';
                console.log('Error al cambiar la contraseña: ' + err);
            }
        });
    } else {
        // Lógica para manejar campos vacíos
        document.querySelector('.alert-message-reset').style.display = 'block';
    }
});


document.getElementById('change-password-button').addEventListener('click', function() {
    var newPassword = document.getElementById('new-password').value;
    if (newPassword) {
        cognitoUser.completeNewPasswordChallenge(newPassword, {}, {
            onSuccess: function(session) {
                document.querySelector('.change-password-form').style.display = 'none';
                window.location.href = 'login.html';
            },
            onFailure: function(err) {
                document.querySelector('.error-message-2').style.display = 'block';
            }
        });
    } else {
        document.querySelector('.alert-message').style.display = 'block';
    }
});

function getUserAttributes(cognitoUser) {
    let userName = "";
    cognitoUser.getUserAttributes(function(err, result) {
        if (err) {
            console.error(err);
            return;
        }
        for (let i = 0; i < result.length; i++) {
            if (result[i].getName() === 'name') {
                userName = result[i].getValue();
                console.log(userName);
                localStorage.setItem("nombreUsuario", userName);
            }
        }
    });
}


/*
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });
*/