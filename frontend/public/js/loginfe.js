AWSCognito.config.region = 'us-east-1';

document.getElementById('login-button').addEventListener('click', async function() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch('http://44.204.146.87:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
  
      if (response.ok) {
        // Acción en caso de éxito
        const data = await response.json();
        console.log('Login exitoso:', data);
        window.location.href = 'auditoria.html';
      } else {
        // Acción en caso de error
        document.querySelector('.error-message').style.display = 'block';
      }
    } catch (error) {
      console.error('Error en la petición:', error);
    }
  });
  