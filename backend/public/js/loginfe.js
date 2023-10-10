// JavaScript: login.js
document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();  // Previene la recarga de la página
  
  const formData = new FormData(event.target);
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  console.log(username);
  console.log(password);
  try {
      const response = await fetch('/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
          throw new Error('Login failed');
      }      

      const data = await response.json();
      const accessToken = data.accessToken;
      localStorage.setItem('accessToken', accessToken); // Almacena el accessToken en localStorage

      console.log("token: " + accessToken);

      // Redirige al usuario a la página de auditoría
      const auditResponse = await fetch('/auditoria', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
        },
      });

      if (!auditResponse.ok) {
        throw new Error('Auditoría fallida');
      }
      
  } catch (error) {
      console.error('Error:', error);
  }
});
