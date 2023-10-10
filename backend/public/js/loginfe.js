// Configuración de Amplify
Amplify.configure({
    Auth: {
      region: 'us-east-1',
      userPoolId: 'us-east-1_ekaFmTqIv',
      userPoolWebClientId: '69i8c6c0mnq066d71qc2a8gm74',
    }
  });
  
  document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.getElementById('login-button');
  
    loginButton.addEventListener('click', function() {
      login();
    });
  });

  async function login() {
    console.log("login")
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    try {
      const user = await Auth.signIn(username, password);
      // Usuario autenticado con éxito
    } catch (error) {
      console.log('Error al autenticar', error);
    }
  }
  
  async function forgotPassword() {
    const username = document.getElementById('username').value;
  
    try {
      await Auth.forgotPassword(username);
      // Se envió el código
    } catch (error) {
      console.log('Error al enviar el código', error);
    }
  }
  
  async function resetPassword() {
    const username = document.getElementById('username').value;
    const code = document.getElementById('code').value;
    const newPassword = document.getElementById('newPassword').value;
  
    try {
      await Auth.forgotPasswordSubmit(username, code, newPassword);
      // Contraseña cambiada con éxito
    } catch (error) {
      console.log('Error al cambiar la contraseña', error);
    }
  }
  