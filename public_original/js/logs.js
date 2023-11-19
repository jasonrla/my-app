document.addEventListener('DOMContentLoaded', async function() {

    fetch('/get-logs')
    .then(response => response.json())
    .then(jsonData => {
        // Formatear el JSON para ser legible
        const formattedJson = JSON.stringify(jsonData, null, 2);
        // Asignar el JSON formateado al contenedor, dentro de elementos <pre> y <code>
        document.getElementById('logsContainer').innerHTML = `<pre><code>${formattedJson}</code></pre>`;
    })
    .catch(error => {
        console.error('Error al recuperar los logs:', error);
        document.getElementById('logsContainer').innerText = 'Error al cargar los logs.';
    });
    
});