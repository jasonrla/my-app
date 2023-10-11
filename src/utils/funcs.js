function countTokens(text) {
    const words = text.split(/[\s,.\n!?"'();:-]+/);
    
    let tokenCount = 0;
    words.forEach(word => {
      if (word.length > 0) {
        tokenCount++;
      }
    });
  
    tokenCount += text.match(/[\s,.\n!?"'();:-]+/g)?.length || 0;
  
    return tokenCount;
  }
/*
async function processPrompt(role, text, part1, part2, audioFileName ,operation){
    let data;
    
    try{
        let payload = {
            model: 'gpt-3.5-turbo',
            messages: [
            {
                role: 'system',
                content: role
            },
            {
            role: 'user',
            content: getPrompt(text, part1, part2)
        }
        ],
        temperature: 0.2
        };

    
        let response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getRandomToken()}`
        },
        body: JSON.stringify(payload)
        });
        
        model = "GPT35";

        if (!response.ok) {
        const errorData = await response.json();
            if (errorData.error && errorData.error.code === "context_length_exceeded") {
                payload.model = 'gpt-4'; 
                response = await fetch('https://api.openai.com/v1/chat/completions', { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getRandomToken()}`
                    },
                    body: JSON.stringify(payload)
                });
                model = "GPT4";

                if (!response.ok) {
                    throw new Error('Error en la respuesta de la API con el modelo gpt-4');
                }
            } else {
                throw new Error('Error en la respuesta de la API');
            }
        }

    data = await response.json();
    } 
        catch (error) {
        statusMessage.textContent = 'Error al analizar el texto: ' + error.message;
    }

    console.log("data: "+data);
    addData(textCost(model, data, audioFileName, operation));
    return extractJSON(data.choices[0].message.content);
}
*/

let useGpt35 = true; // Variable para alternar entre GPT-3.5 y GPT-4

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function processPrompt(role, text, part1, part2, audioFileName, operation) {
    let data;
    let model;
    
    try {
        let payload = {
            model: useGpt35 ? 'gpt-3.5-turbo' : 'gpt-4',
            messages: [
                { role: 'system', content: role },
                { role: 'user', content: getPrompt(text, part1, part2) }
            ],
            temperature: 0.2
        };
        
        let response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getRandomToken()}`
            },
            body: JSON.stringify(payload)
        });

        model = useGpt35 ? "GPT35" : "GPT4";
        
        if (!response.ok) {
            const errorData = await response.json();
            
            if (response.status === 429 && errorData.error && errorData.error.code === 'rate_limit_exceeded') {
                await sleep(60000); // Espera 1 minuto
                return await processPrompt(role, text, part1, part2, audioFileName, operation); // Intenta nuevamente
            }
            
            if (errorData.error) {
                if (errorData.error.code === "context_length_exceeded" || errorData.error.code === 'usage_limit_exceeded') {
                    if (model === 'GPT4') {
                        await sleep(60000); // Sleep for 1 minute
                        return await processPrompt(role, text, part1, part2, audioFileName, operation); // Retry
                    }
                    
                    // Cambia el modelo y reintenta
                    useGpt35 = !useGpt35;
                    return await processPrompt(role, text, part1, part2, audioFileName, operation);
                }
                
                throw new Error('Error en la respuesta de la API');
            }
        }

        data = await response.json();
    } catch (error) {
        statusMessage.textContent = 'Error al analizar el texto: ' + error.message;
        return null;
    }
    
    console.log("data: " + data);
    addData(textCost(model, data, audioFileName, operation));
    
    // Cambia el modelo para el próximo intento
    useGpt35 = !useGpt35;

    return extractJSON(data.choices[0].message.content);
}


async function gpt35(role, text, part1, part2){
    let data;

    try{
        let payload = {
            model: 'gpt-3.5-turbo',
            messages: [
            {
                role: 'system',
                content: role
            },
            {
            role: 'user',
            content: getPrompt(text, part1, part2)
        }
        ],
        temperature: 0.2
        };

    
        let response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getRandomToken()}`
        },
        body: JSON.stringify(payload)
        });
        
        model = "GPT35";

        data = await response.json();
    } 
        catch (error) {
        statusMessage.textContent = 'Error al analizar el texto: ' + error.message;
    }

    return data;
}

const taskQueue = [];
let isProcessing = false;

async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;
  
  while (taskQueue.length > 0) {
    const { fn, args } = taskQueue.shift();
    
    try {
      await fn(...args);
    } catch (error) {
      console.log('Task failed:', error);
    }
  }
  
  isProcessing = false;
}

async function gpt4(role, text, part1, part2){
    let data;

    try{
        let payload = {
            model: 'gpt-4',
            messages: [
            {
                role: 'system',
                content: role
            },
            {
            role: 'user',
            content: getPrompt(text, part1, part2)
        }
        ],
        temperature: 0.2
        };

    
        let response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getRandomToken()}`
        },
        body: JSON.stringify(payload)
        });
        
        if (response.status !== 200) {
            console.log("Received non-200 status code. Adding task back to queue.");
            taskQueue.push({
              fn: gpt4,
              args: [role, text, part1, part2]
            });
            await new Promise(resolve => setTimeout(resolve, 60000)); // wait for 1 minute
            processQueue(); // attempt to process the queue again
            return;
        }


        model = "GPT4";
        data = await response.json();

    } 
        catch (error) {
        statusMessage.textContent = 'Error al analizar el texto: ' + error.message;
    }
    
    return data;
}

function autoResize(textarea) {
    textarea.style.height = 'auto'; // reset the height in case of backspaces
    textarea.style.height = (textarea.scrollHeight) + 'px'; // adjust it to the content
}

function typeText(element, text, delay = 50) {
let index = 0;

return new Promise((resolve) => {
    const interval = setInterval(() => {
        if (index < text.length) {
            element.textContent += text[index];
            index++;
        } else {
            clearInterval(interval);
            resolve();
        }
    }, delay);
});
}

function currentDate() {
const date = new Date();

const day = String(date.getDate()).padStart(2, '0');  // Día
const month = String(date.getMonth() + 1).padStart(2, '0');  // Mes (los meses comienzan en 0, así que añadimos 1)
const year = date.getFullYear();  // Año

const hours = String(date.getHours()).padStart(2, '0');  // Horas
const minutes = String(date.getMinutes()).padStart(2, '0');  // Minutos
const seconds = String(date.getSeconds()).padStart(2, '0');  // Segundos

const formattedDate = `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
return formattedDate;
}

function tipoCampanaAuditoria() {
    const radios = document.getElementsByName('channel');
    let seleccionado = null;

    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            seleccionado = radios[i].value;
            break;
        }
    }

    return seleccionado;
}

function obtenerNombreVendedor() {
    const listbox = document.getElementById('miListbox');
    return listbox.options[listbox.selectedIndex].text;
}

function obtenerMotivo() {
    const listbox = document.getElementById('miListboxMotivo');
    return listbox.options[listbox.selectedIndex].text;
}

function grupoVendedor() {
    const listbox = document.getElementById('miListbox');
    return listbox.value;
}

function poblarVendedores() {
    // Lista de vendedores
    const vendedores = {
        "Equipo": "C4",
        "Yanhelis Alvarez": "C4",
        "Caterin Almonte": "C4",
        "Stalin Domínguez": "C4",
        "Raquel Pascal": "C4",
        "Arley Ferreira": "C4",
        "Juana Tapia": "C4",
        "Cary Gonzalez": "C4",
        "Belkis Barrios": "C4",
        "Yeruli Aquino": "C4",
        "Yasmeli Nieves": "GCC",
        "Sonia Nataly Rodriguez": "GCC"
    };

    const listbox = document.getElementById('miListbox');
    for (let vendedor in vendedores) {
        const option = document.createElement('option');
        option.value = vendedores[vendedor];  // Usamos el ID asociado como valor
        option.textContent = vendedor;
        listbox.appendChild(option);
    }
}

function poblarTipoFeedback() {
    const tipos = {
        "FORMATIVO": "",
        "POSITIVO": "",
        "LLAMADA DE ATENCIÓN": ""
    };

    const listbox = document.getElementById('listBox1');
    for (let tipo in tipos) {
        const option = document.createElement('option');
        option.value = tipos[tipo];  // Usamos el ID asociado como valor
        option.textContent = tipo;
        listbox.appendChild(option);
    }
}

function obtenerTipoFeedback() {
    const listbox = document.getElementById('listBox1');
    return listbox.options[listbox.selectedIndex].text;
}

function poblarAsunto() {
    const tipos = {
        "ESTADOS DE CONEXIÓN": "",
        "BAJA CONVERSIÓN": "",
        "BAJA FACTURACIÓN": "",
        "TRAINING POR PRODUCTO": "",
        "APOYO POR CONSULTA": "",
        "GESTIÓN CC": "",
        "PRECIO BAJO": ""
    };

    const listbox = document.getElementById('listBox2');
    for (let tipo in tipos) {
        const option = document.createElement('option');
        option.value = tipos[tipo];  // Usamos el ID asociado como valor
        option.textContent = tipo;
        listbox.appendChild(option);
    }
}

function obtenerAsunto() {
    const listbox = document.getElementById('listBox2');
    return listbox.options[listbox.selectedIndex].text;
}

function poblarActitudVendedor() {
    const tipos = {
        "BUENA": "",
        "REGULAR": "",
        "MALA": ""
    };

    const listbox = document.getElementById('listBox3');
    for (let tipo in tipos) {
        const option = document.createElement('option');
        option.value = tipos[tipo];  // Usamos el ID asociado como valor
        option.textContent = tipo;
        listbox.appendChild(option);
    }
}

function obtenerActitudVendedor() {
    const listbox = document.getElementById('listBox3');
    return listbox.options[listbox.selectedIndex].text;
}

function poblarDialer() {
    const tipos = {
        "Dialer VTA": "",
        "Dialer OCP": "",
        "Dialer Biolux NC": ""
    };

    const listbox = document.getElementById('listBoxDialer');
    for (let tipo in tipos) {
        const option = document.createElement('option');
        option.value = tipos[tipo];  // Usamos el ID asociado como valor
        option.textContent = tipo;
        listbox.appendChild(option);
    }
}

function obtenerDialer() {
    const listbox = document.getElementById('listBoxDialer');
    return listbox.options[listbox.selectedIndex].text;
}

function poblarMotivo() {
    // Lista de Motivo
    const motivos = {
        "DIARIA": "Son los monitoreos que realizamos a diario y Kelly asigna los lead",
        "CALIBRACIÓN": "Evento se realizará para unificar criterios",
        "LANZAMIENTO": "PRODUCTO NUEVO- RESVENCE S34",
        "18 VENDEDORES": "proyecto de training",
        "POST-TRAINING": "",
        "REORDEN": "TRAINING",
        "UPSELL": "CROSSELL",
        "OTROS": "",
        "TRAINING ANALISTA DE CALIDAD": "",
        "18 VENDEDORES": "proyecto de training.2",
        "POST-TRAINING LOS 12": "",
        "PRE- TRAINING 12 BAJOS SEMANA 33": "",
        "POST- TRAINING 12 BAJOS SEMANA 33": "",
        "SEGUIMIENTO TRAINING 12 BAJOS SEMANA 33": "",
        "PRE- TRAINING 12 BAJOS SEMANA 34": "",
        "POST- TRAINING 12 BAJOS SEMANA 34": "",
        "SEGUIMIENTO TRAINING 12 BAJOS SEMANA 34": "",
        "PROSTMEN-PROSTABIONIC LOS 12 S34": "",
        "PRE- TRAINING 12 BAJOS SEMANA 35": "",
        "POST- TRAINING 12 BAJOS SEMANA 35": "",
        "SEGUIMIENTO TRAINING 12 BAJOS SEMANA 35": ""
    };

    const listbox = document.getElementById('miListboxMotivo');
    for (let motivo in motivos) {
        const option = document.createElement('option');
        option.value = motivos[motivo];  // Usamos el ID asociado como valor
        option.textContent = motivo;
        listbox.appendChild(option);
    }
}

function showTable(audioFileName, duration, formattedString, text){
    const tbody = document.getElementById('resultsTbody');
    
        const tr = document.createElement('tr');
        
        const tdAudioDate = document.createElement('td');
        tdAudioDate.textContent = currentDate();

        const tdName = document.createElement('td');
        tdName.textContent = audioFileName;

        const tdDuration = document.createElement('td');
        tdDuration.textContent = duration;

        const tdResult = document.createElement('td');
        tdResult.textContent = formattedString; 
        tdResult.setAttribute('contenteditable', 'true');
        tdResult.classList.add('editable-field');

        const tdTextLink = document.createElement('td');
        const textLink = document.createElement('a');
        textLink.href = "#";
        textLink.textContent = "Ver texto";
        textLink.classList.add('view-text');  // Añade la clase "view-text" al enlace
        textLink.setAttribute('data-text', text); // Establece el texto que se mostrará en el modal
        textLink.setAttribute('data-audio-name', audioFileName);

        tdTextLink.appendChild(textLink);
    
        tr.appendChild(tdAudioDate);
        tr.appendChild(tdName);
        tr.appendChild(tdDuration);
        tr.appendChild(tdResult);
        tr.appendChild(tdTextLink); // Añadir columna de enlace a la fila
    
        tbody.appendChild(tr);
}

let reportCount = 0;


function showModalReport() { //content
    const modal = document.getElementById('myModalReport');
    //const modalText = document.getElementById('view-report');
    //const modalTitle = modal.querySelector('modalTitle'); //h3
    
    //modalText.textContent = content;
    //modalTitle.textContent = audioName || "Reporte"; 
    
    modal.style.display = "block";
}

function auditoriaReport(){
    const tabla = document.createElement('table');
    tabla.border = '1'; // Esto es solo para visualizar los bordes de las celdas.

    // Primera fila
    const fila1 = document.createElement('tr');
    
    const celda1 = document.createElement('td');
    celda1.textContent = 'Acta Calibracion Cariola';
    celda1.rowSpan = 2; // Combinamos verticalmente por 2 filas
    celda1.colSpan = 3;
    const celdaVacia1 = document.createElement('td');
    celdaVacia1.colSpan = 4;
    const celda2 = document.createElement('td');
    celda2.textContent = 'Celda 2';
    celda2.colSpan = 2; // Combinamos horizontalmente por 2 columnas

    fila1.appendChild(celda1);
    fila1.appendChild(celda2);
    tabla.appendChild(fila1);

    // Segunda fila
    const fila2 = document.createElement('tr');
    
    const celda3 = document.createElement('td');
    celda3.textContent = 'Celda 3';

    fila2.appendChild(celda3);
    tabla.appendChild(fila2);

    // Tercera fila
    const fila3 = document.createElement('tr');
    
    const celda4 = document.createElement('td');
    celda4.textContent = 'Celda 4';

    const celda5 = document.createElement('td');
    celda5.textContent = 'Celda 5';

    const celda6 = document.createElement('td');
    celda6.textContent = 'Celda 6';

    fila3.appendChild(celda4);
    fila3.appendChild(celda5);
    fila3.appendChild(celda6);
    tabla.appendChild(fila3);

    document.getElementById('tablaContenedor').appendChild(tabla);

}

function showModal(content, audioName) {
    const modal = document.getElementById('myModal');
    const modalText = document.getElementById('view-text');
    const modalTitle = modal.querySelector('h2');
    
    modalText.textContent = content;
    modalTitle.textContent = audioName; 
    
    modal.style.display = "block";
}



function getRandomToken(){
    //return "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";
    return "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";
}


function createHiddenTableFromData(data) {
    // Crear un elemento de tabla
    let table = document.createElement('table');
    table.id = 'hiddenTable';
    table.style.display = 'none'; // Esto hará que la tabla no sea visible

    // Crear el encabezado de la tabla
    let thead = table.createTHead();
    let headerRow = thead.insertRow();
    for (let key in data[0]) {
        let th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    }

    // Agregar datos a la tabla
    for (let obj of data) {
        let row = table.insertRow();
        for (let key in obj) {
            let cell = row.insertCell();
            cell.textContent = obj[key];
        }
    }

    // Agregar la tabla al documento
    document.body.appendChild(table);
    return table;
}

function transformDateFormat(dateStr) {
    // Convertir "09/18/2023 22:08:15" a "_09182023_220815"
    return dateStr.replace(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/, '$2$1$3_$4$5$6');
}

function exportTableToExcel(tableElement, fileName) {
    // Convertir la tabla a un libro de trabajo de Excel
    const wb = XLSX.utils.table_to_book(tableElement, { sheet: "Sheet 1" });

    // Obtener la hoja de trabajo que acabas de crear
    const ws = wb.Sheets["Sheet 1"];

    // Definir las columnas que deseas que se muestren como porcentajes y decimales
    const percentageColumns = ['M', 'N', 'S', 'T', 'AB', 'AC', 'AJ', 'AK', 'AN', 'AO', 'AR', 'AS', 'AV', 'AW', 'BE', 'BF'];  
    const decimalColumns = ['BG'];  // Añadido 'BG' aquí

    for (let key in ws) {
        if (ws.hasOwnProperty(key)) {
            const cell = ws[key];
            const columnLetter = getColumnLetter(key);

            if (columnLetter) {
                if (percentageColumns.includes(columnLetter) && typeof cell.v === 'number') {
                    cell.z = '0%';
                } else if (decimalColumns.includes(columnLetter) && typeof cell.v === 'number') {
                    cell.z = '0.0%';
                }
            }
        }
    }

    // Guardar el libro de trabajo
    XLSX.writeFile(wb, fileName);
}

function getColumnLetter(cellKey) {
    // Extraer y retornar las letras de la clave de la celda (por ejemplo, "AB" de "AB42")
    const match = cellKey.match(/[A-Z]+/);
    return match ? match[0] : null;
}

function exportReportToExcel(tableElement, fileName = 'report.xlsx') {
    const wb = XLSX.utils.table_to_book(tableElement, { sheet: "Sheet 1" });
    XLSX.writeFile(wb, fileName);
 
}


function exportTableToPDF(modalBody, fileName) {
    var element = document.getElementById(modalBody);  // Reemplaza 'your-table-id' con el ID de tu tabla

    var opt = {
        margin:       6,
        filename:     fileName + '.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
}


function sendEmailWithAttachment(base64String) {

    fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer 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',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            personalizations: [{
                to: [{
                    email: 'jasonrla41@gmail.com'
                }],
                subject: 'Here is your Excel file'
            }],
            from: {
                email: 'jasonrla@gmail.com'
            },
            content: [{
                type: 'text/plain',
                value: 'Hello, World!'
            }],
            attachments: [{
                content: base64String,
                filename: 'data.xlsx',
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                disposition: 'attachment'
            }]
        })
    }).then(response => response.json()).then(data => {
        console.log(data);
    });
}

function getAudioDurationInSecs(blob) {
return new Promise((resolve, reject) => {
    const audio = new Audio(URL.createObjectURL(blob));
    audio.onloadedmetadata = function() {
        resolve(audio.duration);
    };
    audio.onerror = function() {
        reject('Error al cargar el archivo de audio.');
    };
});
}

async function getAudioDurationHHMMSS(audioFile){
let formattedHours;
let formattedMinutes;
let formattedSeconds;
try {
    const durationInSeconds = await getAudioDurationInSecs(audioFile);
    const hours = Math.floor(durationInSeconds / 60 / 60);
    formattedHours = String(hours).padStart(2, '0');
    const minutes = Math.floor(durationInSeconds / 60);
    formattedMinutes = String(minutes).padStart(2, '0');
    const seconds = Math.round(durationInSeconds % 60);
    formattedSeconds = String(seconds).padStart(2, '0');
} catch (durationError) {
    console.error('Error al obtener la duración:', durationError);
}
return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

async function audioToText(audioFile, audioFileName) {

let durationInSeconds;
if(prod){
    showLoadingIcon();

    statusMessage.textContent = 'Transformando audio: ' + audioFileName;
    const result = {
        text: null,
        duration: null
    };

    console.log(audioFile.name);

    //result.duration = await getAudioDurationHHMMSS(audioFile);
    let formattedHours;
    let formattedMinutes;
    let formattedSeconds;
    try {
        durationInSeconds = await getAudioDurationInSecs(audioFile);
        const hours = Math.floor(durationInSeconds / 60 / 60);
        formattedHours = String(hours).padStart(2, '0');
        const minutes = Math.floor(durationInSeconds / 60);
        formattedMinutes = String(minutes).padStart(2, '0');
        const seconds = Math.round(durationInSeconds % 60);
        formattedSeconds = String(seconds).padStart(2, '0');
    } catch (durationError) {
        console.error('Error al obtener la duracion:', durationError);
    }
    result.duration = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    
    const requestOptions = {
        method: 'POST',
        headers: {
        'Authorization': `Bearer ${getRandomToken()}`
        },
        body: formData
    };
    
    let data;
    try {
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', requestOptions);
        data = await response.json();
        result.text = data.text;
    } catch (error) {
        console.error('Error:', error);
        result.text = "Error al procesar el audio.";
    }
    showCompleteIcon();
    
    result.duration = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`; //BORRAR
    result.text = data.text;

    addData(audioCost(audioFile.name, result.duration, durationInSeconds));
    return result;
}
else{  
    return result = {
        text: "audio text",
        duration: "00:03:22"
    };
}
}

function showLoadingIcon() {
    document.getElementById('loading-icon').style.display = 'inline-block';
    document.getElementById('complete-icon').style.display = 'none';
}

function showCompleteIcon() {
    document.getElementById('loading-icon').style.display = 'none';
    document.getElementById('complete-icon').style.display = 'inline-block';
}

async function saludoInstitucional(text, audioFileName){
if(prod){
    showLoadingIcon();
    statusMessage.textContent = 'Analizando saludo institucional: ' + audioFileName;
  
    let valor, comentario;

    const result = await Promise.all([processPrompt(pemp_role, text, pemp_part1, pemp_part2, audioFileName, "Saludo Institucional")]);
    const cleanString = result[0].replace(/'/g, '"');  // Reemplaza comillas simples con comillas dobles
    //console.log(cleanString);
    parsedData = JSON.parse(result);

    ({
        valor,
        comentario
    } = parsedData);
    valor = valor ? parseInt(valor) : "0";
    showCompleteIcon();
    return{
        "valor": valor,
        "comentario": comentario,
        "audioName": audioFileName
    };
}
else{
    return{
        "valor": "5",
        "comentario": "comentario"
    };
}
}

async function empatiaSimpatia(text, audioFileName){
    if(prod){
        showLoadingIcon();
        statusMessage.textContent = 'Analizando presentacion empatica: ' + audioFileName;
        
        let valor, comentario;
        
        const result = await Promise.all([processPrompt(emsi_role, text, emsi_part1, emsi_part2, audioFileName, "Empatia/Simpatia")]);
        const cleanString = result[0].replace(/'/g, '"');  // Reemplaza comillas simples con comillas dobles
        //console.log(cleanString);
        parsedData = JSON.parse(result);
        
        ({
            valor,
            comentario
        } = parsedData);

        valor = valor ? parseInt(valor) : "0";
        showCompleteIcon();
        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": "5",
            "comentario": "comentario"
        };
    }
}

function puntuacion(...numeros) {
    let sum = 0;
    let count = 0;

    for(let num of numeros) {
        if (num) {
            num = parseInt(num);
            if (!isNaN(num)) { // Aseguramos que no sea NaN después de convertirlo
                sum += num;
                count++;
            }
        }
    }
    if (count === 0) return 0;
    return (sum / count) * 10;
}

async function precalificacion(text, audioFileName){
if(prod){
    showLoadingIcon();
    statusMessage.textContent = 'Analizando precalificacion: ' + audioFileName;    
    
    let valor, comentario;
    
    const result = await Promise.all([processPrompt(prec_role, text, prec_part1, prec_part2, audioFileName, "Precalificación")]);
    console.log("RESULT PRECALIFICACION");
    console.log(result);
    
    let parsedData;
    try{
        const cleanString = result[0].replace(/'/g, '"');  // Reemplaza comillas simples con comillas dobles
        //console.log(cleanString);
        parsedData = JSON.parse(result);
    
        ({
            valor,
            edad,
            peso,
            estatura,
            tipoTrabajo,
            otrasEnfermedades,
            tratamientosQueConsume,
            productosTomaActualmente,
            comentario
        } = parsedData);

        valor = valor ? parseInt(valor) : "0";
        showCompleteIcon();
        return{
            "valor": valor,
            "comentario": comentario,
            "edad": edad,
            "peso": peso,
            "estatura": estatura,
            "tipoTrabajo": tipoTrabajo,
            "otrasEnfermedades": otrasEnfermedades,
            "tratamientosQueConsume": tratamientosQueConsume,
            "productosTomaActualmente": productosTomaActualmente
        };
    }
    catch(e){
        console.error(e)
    }
}
else{    
    return{
        "valor": "0",
        "comentario": "comentario",
        "edad": "edad",
        "peso": "peso",
        "estatura": "estatura",
        "tipoTrabajo": "tipoTrabajo",
        "otrasEnfermedades": "otrasEnfermedades",
        "tratamientosQueConsume": "tratamientosQueConsume",
        "productosTomaActualmente": "productosTomaActualmente"
   };
}
}

async function preguntasSubjetivas(text, audioFileName){
    if(prod){
        showLoadingIcon();
        statusMessage.textContent = 'Analizando preguntas subjetivas: ' + audioFileName;
        
        let valor, comentario;
        
        const result = await Promise.all([processPrompt(preSub_role, text, preSub_part1, preSub_part2, audioFileName, "Preguntas subjetivas")]);
        parsedData = JSON.parse(result);  
             
        ({
            valor,
            comentario
        } = parsedData);

        valor = valor ? parseInt(valor) : "0";
        showCompleteIcon();
        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": "5",
            "comentario": "comentario"
        };
    }
}

async function etiquetaEnf(text, audioFileName){
    if(prod){
        showLoadingIcon();
        statusMessage.textContent = 'Analizando etiqueta enfermedad: ' + audioFileName;
        
        let valor, comentario;
        
        const result = await Promise.all([processPrompt(etenf_role, text, etenf_part1, etenf_part2, audioFileName, "Etiqueta enfermedad")]);
        parsedData = JSON.parse(result);  
             
        ({
            valor,
            comentario
        } = parsedData);

        valor = valor ? parseInt(valor) : "0";
        showCompleteIcon();
        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": "5",
            "comentario": "comentario"
        };
    }
}

async function enfocEnf(text, audioFileName){
    if(prod){
        showLoadingIcon();
        statusMessage.textContent = 'Analizando enfoque enfermedad: ' + audioFileName;
        
        let valor, comentario;
        
        const result = await Promise.all([processPrompt(enfenf_role, text, enfenf_part1, enfenf_part2, audioFileName, "Enfoque enfermedad")]);
        parsedData = JSON.parse(result);  
             
        ({
            valor,
            comentario
        } = parsedData);

        valor = valor ? parseInt(valor) : "0";
        showCompleteIcon();
        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": "5",
            "comentario": "comentario"
        };
    }
}

async function tonoVoz(text, audioFileName){
    if(prod){
        showLoadingIcon();
        statusMessage.textContent = 'Analizando tono de voz: ' + audioFileName;
        
        let valor, comentario;
        
        const result = await Promise.all([processPrompt(tonoVoz_role, text, tonoVoz_part1, tonoVoz_part2, audioFileName, "Tono de voz")]);
        parsedData = JSON.parse(result);  
             
        ({
            valor,
            comentario
        } = parsedData);

        valor = valor ? parseInt(valor) : "0";
        showCompleteIcon();
        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": "5",
            "comentario": "comentario"
        };
    }
}

async function conocimientoPatol(text, audioFileName){
    if(prod){
        showLoadingIcon();
        statusMessage.textContent = 'Analizando conocimiento de la patología: ' + audioFileName;
        
        let valor, comentario;
        
        const result = await Promise.all([processPrompt(conPatol_role, text, conPatol_part1, conPatol_part2, audioFileName, "Conoc. patología")]);
        parsedData = JSON.parse(result);  
             
        ({
            valor,
            comentario
        } = parsedData);

        valor = valor ? parseInt(valor) : "0";
        showCompleteIcon();
        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": "5",
            "comentario": "comentario"
        };
    }
}

async function datoDuro(text, audioFileName){
    if(prod){
        showLoadingIcon();
        statusMessage.textContent = 'Analizando dato duro: ' + audioFileName;
        
        let valor, comentario;
        
        const result = await Promise.all([processPrompt(datoDuro_role, text, datoDuro_part1, datoDuro_part2, audioFileName, "Dato duro")]);
        parsedData = JSON.parse(result);  
             
        ({
            valor,
            comentario
        } = parsedData);

        valor = valor ? parseInt(valor) : "0";
        showCompleteIcon();
        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": "5",
            "comentario": "comentario"
        };
    }
}

async function testimonio(text, audioFileName){
    if(prod){
        showLoadingIcon();
        statusMessage.textContent = 'Analizando testimonio: ' + audioFileName;
        
        let valor, comentario;
        
        const result = await Promise.all([processPrompt(testi_role, text, testi_part1, testi_part2, audioFileName, "Testimonio")]);
        parsedData = JSON.parse(result);  
             
        ({
            valor,
            comentario
        } = parsedData);

        valor = valor ? parseInt(valor) : "0";
        showCompleteIcon();
        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": "5",
            "comentario": "comentario"
        };
    }
}

async function solucionBeneficios(text, audioFileName){
    if(prod){
        showLoadingIcon();
        statusMessage.textContent = 'Analizando solución/beneficios: ' + audioFileName;
        
        let valor, comentario;
        
        const result = await Promise.all([processPrompt(solBen_role, text, solBen_part1, solBen_part2, audioFileName, "Solución beneficios")]);
        parsedData = JSON.parse(result);  
             
        ({
            valor,
            comentario
        } = parsedData);

        valor = valor ? parseInt(valor) : "0";
        showCompleteIcon();
        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": "5",
            "comentario": "comentario"
        };
    }
}

async function respaldo(text, audioFileName){
    if(prod){
        showLoadingIcon();
        statusMessage.textContent = 'Analizando respaldo: ' + audioFileName;
        
        let valor, comentario;
        
        const result = await Promise.all([processPrompt(resp_role, text, resp_part1, resp_part2, audioFileName, "Respaldo")]);
        const cleanString = result[0].replace(/'/g, '"');  // Reemplaza comillas simples con comillas dobles
        //console.log(cleanString);
        parsedData = JSON.parse(result);

        ({
            valor,
            comentario
        } = parsedData);

        valor = valor ? parseInt(valor) : "0";
        showCompleteIcon();
        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": "5",
            "comentario": "comentario"
        };
    }
}

async function cierreVenta(text, audioFileName){
    if(prod){
        showLoadingIcon();
        statusMessage.textContent = 'Analizando cierre de venta: ' + audioFileName;
        
        let valor, comentario;
        
        const result = await Promise.all([processPrompt(cierre_role, text, cierre_part1, cierre_part2, audioFileName, "Cierre de venta")]);
        parsedData = JSON.parse(result);  
             
        ({
            valor,
            comentario
        } = parsedData);

        valor = valor ? parseInt(valor) : "0";
        showCompleteIcon();
        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": "5",
            "comentario": "comentario"
        };
    }
}

async function comunicacionEfectiva(text, audioFileName){
    return{
        "valor": "0",
        "comentario": "comentario"
    };
}

async function conocimientoTratamiento(text, audioFileName){
    return{
        "valor": "0",
        "comentario": "comentario"
    };
}

async function rebateObjeciones(text, audioFileName){
    return{
        "valor": "0",
        "comentario": "comentario"
    };
}

async function analizarTextos(audioFiles, auditor, grupo, motivo, asesor, tipoCampana) {
    const linksContainer = document.getElementById('linksContainer');

    const table = document.createElement('table');
    table.classList.add('custom-audio-table');

    linksContainer.appendChild(table);
    
    const thead = document.createElement('thead');
    table.appendChild(thead);
    
    const headerRow = document.createElement('tr');
    thead.appendChild(headerRow);
    
    const th1 = document.createElement('th');
    th1.textContent = 'Fecha de procesamiento';
    headerRow.appendChild(th1);
    
    const th2 = document.createElement('th');
    th2.textContent = 'Nombre de audio';
    headerRow.appendChild(th2); 
    
    const th3 = document.createElement('th');
    th3.textContent = 'Duración';
    headerRow.appendChild(th3); 

    const th4 = document.createElement('th');
    th4.textContent = 'Resultado';
    headerRow.appendChild(th4); 

    const th5 = document.createElement('th');
    th5.textContent = 'Transcripción';
    headerRow.appendChild(th5); 

    const th6 = document.createElement('th');
    th6.textContent = 'Reporte 1';
    headerRow.appendChild(th6); 

    const th7 = document.createElement('th');
    th7.textContent = 'Reporte 2';
    headerRow.appendChild(th7);

    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    const tabla = [];
    
    for (const audioFile of audioFiles) {
        const textoTransformado = await audioToText(audioFile, audioFile.name);
        const resultados = await Promise.all([
            saludoInstitucional(textoTransformado.text, audioFile.name),
            empatiaSimpatia(textoTransformado.text, audioFile.name),
            precalificacion(textoTransformado.text, audioFile.name),
            preguntasSubjetivas(textoTransformado.text, audioFile.name),
            etiquetaEnf(textoTransformado.text, audioFile.name),
            enfocEnf(textoTransformado.text, audioFile.name),
            tonoVoz(textoTransformado.text, audioFile.name),
            conocimientoPatol(textoTransformado.text, audioFile.name),
            datoDuro(textoTransformado.text, audioFile.name),
            testimonio(textoTransformado.text, audioFile.name),
            solucionBeneficios(textoTransformado.text, audioFile.name),
            respaldo(textoTransformado.text, audioFile.name),
            cierreVenta(textoTransformado.text, audioFile.name),
            comunicacionEfectiva(textoTransformado.text, audioFile.name),
            conocimientoTratamiento(textoTransformado.text, audioFile.name),
            rebateObjeciones(textoTransformado.text, audioFile.name)
        ]);
        
        const result1 = puntuacion(resultados[0].valor,resultados[1].valor);
        const result2 = puntuacion(resultados[2].valor,resultados[3].valor);
        const result3 = puntuacion(resultados[4].valor, resultados[5].valor, resultados[6].valor, resultados[7].valor, resultados[8].valor);
        const result4 = puntuacion(resultados[9].valor);
        const result5 = puntuacion(resultados[10].valor);
        const result6 = puntuacion(resultados[11].valor);
        const result7 = puntuacion(resultados[12].valor);
        const result8 = resultados[13].valor;
        const result9 = resultados[14].valor;
        const result10 = resultados[15].valor;
        
        const etapasVenta = (peso1/100 * result1) + (peso2/100*result2) + (peso3/100*result3) + (peso4/100*result4) + (peso5/100*result5) + (peso6/100*result6) + (peso7/100*result7)
        const habComerciales = puntuacion(result8, result9, result10);

        let resCal = (etapasVenta+habComerciales)/2;

        //resultados valor, areglar son totales no individual
        const formattedString = `AUD POR ${auditor} // PEMP-${result1}% CAL-${result2}% P.OSC-${result3}% 
                TEST-${result4}% S.BEN-${result5}% RESP-0${result6}% C.VENT-0${result7}% C.EFE-${result8}% 
                C.TRA-${result9}% R.OBJ-${result10}% / MOTIVO: "PENDIENTE"`;

        let json={
            "Auditor": auditor,
            "Grupo": grupo,
            "Motivo": motivo,
            "Asesor": asesor,
            "Tipo_de_Campana": tipoCampana,
            "Fecha_Audio": currentDate(),
            "Nombre_Audio": audioFile.name,
            "Duracion": textoTransformado.duration,
            "Resumen": formattedString,
            "Transcripcion": textoTransformado.text,

            "Saludo_institucional": resultados[0].valor,
            "Simpatia_empatia": resultados[1].valor,
            "Res_Pres_Empatica": peso1+"%",
            "ResFinal_Pres_Empatica": result1.toString()+"%",
            "Saludo_institucional_comentario": resultados[0].comentario,    
            "Simpatia_empatia_comentario": resultados[1].comentario, 

            "Precalificacion": resultados[2].valor,
            "Preguntas_subjetivas": resultados[3].valor,
            "Res_Calificacion": peso2.toString()+"%",
            "ResFinal_Calificacion": result2.toString()+"%",
            "Precalificacion_comentario": resultados[2].comentario, 
            "Preguntas_subjetivas_comentario": resultados[3].comentario, 
            
            "Etiqueta_Enfermedad": resultados[4].valor,
            "Enfocarse_enfermedad": resultados[5].valor,
            "Tono_voz": resultados[6].valor,
            "Conocimiento_patologia": resultados[7].valor,
            "Dato_duro": resultados[8].valor,
            "Res_PanOscuro":  peso3.toString()+"%",
            "ResFinal_PanOscuro": result3.toString()+"%",
            "Etiqueta_Enfermedad_comentario": resultados[4].comentario, 
            "Enfocarse_enfermedad_comentario": resultados[5].comentario, 
            "Tono_voz_comentario": resultados[6].comentario, 
            "Conocimiento_patologia_comentario": resultados[7].comentario, 
            "Dato_duro_comentario": resultados[8].comentario, 
            
            "Testimonio": resultados[9].valor,
            "Res_Testimonio": peso4.toString()+"%",
            "ResFinal_Testimonio": result4.toString()+"%",
            "Testimonio_comentario": resultados[9].comentario, 
            
            "Solucion_beneficios": resultados[10].valor,
            "Res_SolBeneficios": peso5.toString()+"%",
            "ResFinal_SolBeneficios": result5.toString()+"%",
            "Solucion_beneficios_comentario": resultados[10].comentario, 
            
            "Respaldo": resultados[11].valor,
            "Res_Respaldo": peso6.toString()+"%",
            "ResFinal_Respaldo": result6.toString()+"%",
            "Respaldo_comentario": resultados[11].comentario, 
            
            "Cierre_venta": resultados[12].valor,
            "Res_CierreVenta": peso7.toString()+"%",
            "ResFinal_CierreVenta": result7.toString()+"%",
            "Cierre_venta_comentario": resultados[12].comentario, 
            
            "Comunicacion_efectiva": resultados[13].valor,
            "Comunicacion_efectiva_comentario": resultados[13].comentario, 
            
            "Concimiento_tratamiento": resultados[14].valor,
            "Concimiento_tratamiento_comentario": resultados[14].comentario, 
            
            "Rebate_objeciones": resultados[15].valor,
            "Rebate_objeciones_comentario": resultados[15].comentario, 

            "Etapas_Venta": etapasVenta.toString()+"%",
            "Habil_comerciales": habComerciales.toString()+"%",
            "Resultado_Calibracion": resCal.toString()+"%"
        };


        const row = document.createElement('tr');
        tbody.appendChild(row);

        //td1
        const tdAudioDate = document.createElement('td');
        tdAudioDate.textContent = currentDate();
        row.appendChild(tdAudioDate);

        const tdName = document.createElement('td');
        tdName.textContent = audioFile.name;
        row.appendChild(tdName);

        const tdDuration = document.createElement('td');
        tdDuration.textContent = textoTransformado.duration;
        row.appendChild(tdDuration);

        const tdResult = document.createElement('td');
        tdResult.textContent = formattedString; 
        tdResult.setAttribute('contenteditable', 'true');
        tdResult.classList.add('editable-field');
        row.appendChild(tdResult);

        const tdTextLink = document.createElement('td');
        const textLink = document.createElement('a');
        textLink.href = "#";
        textLink.innerText = `Ver`;
        //textLink.classList.add('view-text');  // Añade la clase "view-text" al enlace
        //textLink.setAttribute('data-text', textoTransformado.text); // Establece el texto que se mostrará en el modal
        //textLink.setAttribute('data-audio-name', "TITULOS");
        textLink.onclick = function(event) {
            event.preventDefault();
            mostrarTextoTransformado(textoTransformado.text, audioFile.name);
            document.getElementById('modalTextoTransformado-content').scrollTop = 0;
        }
        tdTextLink.appendChild(textLink);
        row.appendChild(tdTextLink);

        const td2 = document.createElement('td');
        const link = document.createElement('a');
        link.href = '#';
        link.innerText = `Ver`;
        link.onclick = function(event) {
            event.preventDefault();
            mostrarResultados("modal", "modalBody", resultados,auditor,grupo, motivo, asesor,tipoCampana, audioFile.name, textoTransformado.duration);
            document.getElementById('modalContent').scrollTop = 0;
        }
        td2.appendChild(link);
        row.appendChild(td2);

        const tdReporte2 = document.createElement('td');
        const link2 = document.createElement('a');
        link2.href = '#';
        link2.innerText = `Ver`;
        link2.setAttribute('id', (linkIDCounter++).toString());
        //link2.dataset.linkId = (linkIDCounter++).toString();   //td.setAttribute('id', 'obsText');
        link2.onclick = function(event) {
            event.preventDefault();
            resetModal();
            
            /*
            document.getElementById('modalFeedbackInterno').dataset.currentLinkId = this.id;
            //let linkId = this.dataset.linkId;
            let linkId = this.id;
            console.log("linkiD: "+linkId);
            
            //document.getElementById('modalFeedbackInterno').dataset.currentLinkId = linkId;

            // Recupera las selecciones previas y actualiza los listboxes si es necesario
            let previousSelections = linkSelections[linkId];
            if (previousSelections) {
                // Aquí asumo que tienes funciones para setear el valor de cada listbox
                setListboxValue("listBox1", previousSelections.listBox1);
                setListboxValue("listBox2", previousSelections.listBox2);
                setListboxValue("listBox3", previousSelections.listBox3);
            }
            */
           const linkId = "1";
           
            mostrarResultadosFeedback(linkId, "modalFeedbackInterno", "modalBodyFeedbackInterno", resultados,auditor,grupo, motivo, asesor,tipoCampana, audioFile.name, textoTransformado.duration);
            document.getElementById('modalFeedbackInterno-content').scrollTop = 0;
        }
        tdReporte2.appendChild(link2);
        row.appendChild(tdReporte2);

        row.scrollIntoView({ behavior: 'smooth' });

        tabla.push(json);        
    }
    data = tabla;
    createHiddenTableFromData(tabla);
}

function mostrarResultadosFeedback(linkId,modalUsed, modalBodyUsed,resultados,nombreAuditor,grupoVendedor, motivo, asesor,tipoCampanaVendedor, audioFileName, duration){
    
    const modal = document.getElementById(modalUsed);
    const modalBody = document.getElementById(modalBodyUsed);
    modalBody.innerHTML = ''; // Limpiar el contenido anterior
    
    let observacionesDetalleText = "- Observaciones/Detalle: ";

    const listBox1 = document.getElementById('listBox1');
    const listBox2 = document.getElementById('listBox2');
    const listBox3 = document.getElementById('listBox3');
    
    const downloadBtnPDFInterno = document.getElementById('downloadBtnPDFInterno');
    const downloadBtnPDFInterno2 = document.getElementById('downloadBtnPDFInterno2');
    const imageInput = document.getElementById('imageInput');
    const attachImagesBtn = document.getElementById('attachImagesBtn');

    let closeButtonCounter = 0;
    let tableResult;
    aName = audioFileName;

    function checkSelectionsAndShowTable() {
        
        let tipoFeedback = obtenerTipoFeedback();
        let asunto = obtenerAsunto();
        let actitudVend = obtenerActitudVendedor();

        //storeListboxSelection(linkId, { "listBox1": tipoFeedback, "listBox2": asunto, "listBox3": actitudVend });

        if (tipoFeedback != "Seleccione una opción" && asunto != "Seleccione una opción" && actitudVend != "Seleccione una opción") {
            modalBody.innerHTML = ''; // Limpiar el contenido anterior con listboxes
            
            downloadBtnPDFInterno.removeAttribute('disabled'); // Habilita el botón
            downloadBtnPDFInterno2.removeAttribute('disabled'); // Habilita el botón
            imageInput.removeAttribute('disabled'); // Deshabilita el input de nuevo si no se cumplen las condiciones
            attachImagesBtn.removeAttribute('disabled');

            const table = document.createElement('table');

            tableResult = createReportTable(table, resultados, nombreAuditor, grupoVendedor, motivo, asesor, tipoCampanaVendedor, audioFileName, duration);
            modalBody.appendChild(tableResult);
            
            const rowsData = [
                {cells: [{text: " ", colSpan: 5}]},
                {cells: [{text: "Resultados adicionales:", colSpan: 5, bold: true}]},
                {cells: [{text: " ", colSpan: 5}]},
                {fontSize: font, cells: [{text: "- Tipo de feedback: " + tipoFeedback, colSpan: 5}]},
                {fontSize: font, cells: [{text: "- Asunto: " + asunto, colSpan: 5 }]},
                {fontSize: font, cells: [{text: "- Actitud de vendedor: " + actitudVend, colSpan: 5 }]},
                {fontSize: font, cells: [{text: observacionesDetalleText, colSpan: 5, editable: true}]},
                {cells: [{text: " ", colSpan: 5}]},
            ];
        
            rowsData.forEach(rowData => {
                const tr = document.createElement('tr');
        
                rowData.cells.forEach((cellData, index) => {
                    const td = document.createElement('td');
                    
                    // Comprobamos si cellData es un objeto o simplemente texto
                    if (typeof cellData === 'object' && cellData.text) {
                        td.textContent = cellData.text;
        
                        // Si existe colSpan, lo aplicamos
                        if (cellData.colSpan) {
                            td.colSpan = cellData.colSpan;
                        }
        
                        // Si existe la propiedad 'centered', aplicamos la clase CSS
                        if (cellData.centered) {
                            td.classList.add("centered-cell");
                        }
        
                        if (cellData.colour) {
                            td.classList.add("colour-cell");
                        }
        
                        if (cellData.colour2) {
                            td.classList.add("colour2-cell");
                        }
        
                        if (cellData.colour3) {
                            td.classList.add("colour3-cell");
                        }
        
                        if (cellData.bold) {
                            td.classList.add("bold-cell");
                        }
        
                        if (cellData.editable){
                            td.setAttribute('contenteditable', 'true');
                            td.classList.add('editable-field');
                            td.setAttribute('id', 'obsText');

                            td.addEventListener('blur', function() {
                                observacionesDetalleText = td.textContent;
                                console.log(observacionesDetalleText);  // Puedes procesar o guardar el contenido como desees aquí.
                            });
                        }
        
                    } else {
                        td.textContent = cellData;
                    }
                    
                    if (rowData.rowSpan && index < 2) { // Si el objeto tiene un rowSpan y es para las primeras dos celdas
                        td.rowSpan = rowData.rowSpan;
                    }
        
                    if (rowData.header) {
                        td.classList.add('header-cell');
                    }
        
                    // Si es una fila "resultRow", añade la clase CSS
                    if (rowData.resultRow) {
                        td.classList.add("result-cell");
                    }
        
                    if (rowData.fontSize) {
                        td.style.fontSize = rowData.fontSize;
                    }
        
                    tr.appendChild(td);
                });
                tableResult.appendChild(tr); //table

            });


        }else{
            modal.style.display = 'block';
            downloadBtnPDFInterno.setAttribute('disabled', 'true'); // Deshabilita el botón si no se cumplen las condiciones
            downloadBtnPDFInterno2.setAttribute('disabled', 'true'); // Deshabilita el botón si no se cumplen las condiciones
            imageInput.setAttribute('disabled', 'true');
            attachImagesBtn.setAttribute('disabled', 'true');
        }
    }

    document.getElementById('attachImagesBtn').addEventListener('click', function() {
        const imageFiles = document.getElementById('imageInput').files;
    
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            const reader = new FileReader();
    
            reader.onload = function(e) {
                const tr = document.createElement('tr');
                const td = document.createElement('td');
                const imgWrapper = document.createElement('div'); 
                const img = document.createElement('img');
                const closeButton = document.createElement('button'); 
            
                // Nuevos elementos: el nombre del archivo y el espacio en blanco
                const filenameDiv = document.createElement('div');
                filenameDiv.textContent = file.name; // Establecer el nombre del archivo
                filenameDiv.style.textAlign = 'center'; // Centrar el nombre del archivo (opcional)
                filenameDiv.style.marginBottom = '5px';
                const blankSpace1 = document.createElement('br');
                const blankSpace2 = document.createElement('br');

                // Establecer un alto mínimo para imgWrapper
                imgWrapper.style.minHeight = '100px';  // Ajusta este valor según tus necesidades
                imgWrapper.style.position = 'relative'; 
            
                img.src = e.target.result;
                img.alt = "Imagen adjunta";
                img.style.width = '90%'; 
                img.style.display = 'block';
                img.style.margin = 'auto';
            
                closeButton.textContent = "X";
                closeButton.id = "close-btn-" + closeButtonCounter;  
                closeButtonCounter++; 
                closeButton.style.position = 'absolute';
                closeButton.style.top = '5px';  // Esto mantiene el botón en la parte superior
                closeButton.style.right = '5px';  // Esto mantiene el botón en la parte derecha
                closeButton.style.zIndex = '10';
                closeButton.addEventListener('click', function() {
                    tr.parentNode.removeChild(tr); 
                });
            
                imgWrapper.appendChild(blankSpace1);
                imgWrapper.appendChild(img);
                imgWrapper.appendChild(blankSpace1);
                imgWrapper.appendChild(closeButton);
                imgWrapper.appendChild(filenameDiv);    
                imgWrapper.appendChild(blankSpace1);
                imgWrapper.appendChild(blankSpace2);
            
                td.appendChild(imgWrapper);
                td.setAttribute('contenteditable', 'true');
                td.colSpan = 5; 
            
                tr.appendChild(td);
                tableResult.appendChild(tr);
            };
    
            reader.readAsDataURL(file);
        }

        const numberOfImages = imageInput.files.length;

        if (numberOfImages===0){
            Swal.fire({
                title: 'Error!',
                text: 'No selecciono ninguna imagen',
                icon: 'error',
                confirmButtonText: 'Entendido'
              })
        }
        else if(numberOfImages===1){
            Swal.fire({
                title: 'Éxito!',
                text: "Se adjunto 1 imagen.",
                icon: 'success',
                confirmButtonText: 'OK'
            });
            //imageInput.value = '';
        }
        else{
            Swal.fire({
                title: 'Éxito!',
                text:  "Se adjuntaron " + numberOfImages+ " imagenes.",
                icon: 'success',
                confirmButtonText: 'OK'
            });
            //imageInput.value = '';
        }

    });

    // Agregar "event listeners" a los listboxes
    listBox1.addEventListener('change', checkSelectionsAndShowTable);
    listBox2.addEventListener('change', checkSelectionsAndShowTable);
    listBox3.addEventListener('change', checkSelectionsAndShowTable);

    modal.style.display = 'block';
    resetModal();


}


function resetModal() {
    document.getElementById('listBox1').selectedIndex = 0; // Establece la primera opción
    document.getElementById('listBox2').selectedIndex = 0; // Establece la primera opción
    document.getElementById('listBox3').selectedIndex = 0; // Establece la primera opción

    downloadBtnPDFInterno.setAttribute('disabled', 'true');
    downloadBtnPDFInterno2.setAttribute('disabled', 'true');
    imageInput.setAttribute('disabled', 'true');
    attachImagesBtn.setAttribute('disabled', 'true');
    imageInput.value = '';
}

function createReportTable(table, resultados, nombreAuditor, grupoVendedor, motivo, asesor, tipoCampanaVendedor, audioFileName, audioDuracion){
    
    const [auditor, fechaCalibracion, grupo, motivoAuditoria, vendedor, tipoCampana] = [nombreAuditor, currentDate(), grupoVendedor, motivo, asesor, tipoCampanaVendedor];
    const [saludo, simpatiaEmpatia] = [resultados[0].valor, resultados[1].valor];
    const [percalificacion, preguntasSubjetivas] = [resultados[2].valor, resultados[3].valor];
    const [etiqueta, enfoque, tono, conocimiento, datoDuro] = [resultados[4].valor, resultados[5].valor, resultados[6].valor, resultados[7].valor, resultados[8].valor];
    const [referencia] = [resultados[9].valor]; 
    const [match] = [resultados[10].valor];
    const [matriz] = [resultados[11].valor];
    const [momento] = [resultados[12].valor];
    const [puntComEfec] = [resultados[13].valor];
    const [puntConTrat] = [resultados[14].valor];
    const [puntRebObj] = [resultados[15].valor];
    const [comentario_saludo, comentario_empatia, comentario_prec, comentario_pregSub, comentario_etiqEnf, comentario_enfocEnf, comentario_tonoVoz, comentario_conPat, comentario_datoDuro, comentario_test, comentario_solBenef, comentario_resp, comentario_cierreVenta, comentario_comEfectiva, comentario_conocTratamiento, comentario_rebObjeciones] = 
    [resultados[0].comentario, resultados[1].comentario, resultados[2].comentario, resultados[3].comentario, resultados[4].comentario, resultados[5].comentario, resultados[6].comentario, resultados[7].comentario, resultados[8].comentario, resultados[9].comentario, 
    resultados[10].comentario, resultados[11].comentario, resultados[12].comentario, resultados[13].comentario, resultados[14].comentario, resultados[15].comentario];

    fechaCal = fechaCalibracion;
    aName = audioFileName;

    const result1 = puntuacion(saludo,simpatiaEmpatia);
    const result2 = puntuacion(percalificacion,preguntasSubjetivas);
    const result3 = puntuacion(etiqueta, enfoque, tono, conocimiento, datoDuro);
    const result4 = puntuacion(referencia);
    const result5 = puntuacion(match);
    const result6 = puntuacion(matriz);
    const result7 = puntuacion(momento);

    const etapasVenta = (peso1/100 * result1) + (peso2/100*result2) + (peso3/100*result3) + (peso4/100*result4) + (peso5/100*result5) + (peso6/100*result6) + (peso7/100*result7)
    const habComerciales = puntuacion(puntComEfec, puntConTrat, puntRebObj);

    const resCal = (etapasVenta+habComerciales)/(2);

    const rowsData = [
        //{cells: [{image: "img/logo.svg"}]},
        {fontSize: fontH, header: true, cells: [{text: "Acta Calibracion Cariola", colSpan: 5, centered: true, colour3: true}]},
        {cells: [{text: " ", colSpan: 4},{text: audioDuracion, bold: true, centered: true}]},
        //{cells: [{text: " ", colSpan: 5}]},
        //{cells: [{text: " ", colSpan: 5}]},

        {fontSize: font, cells: [{text: " ", colSpan: 4},{text: "Resultado Calibración", centered: true, colour: true, bold: true}]},
        {fontSize: font, cells: [{text: "Auditor:", colour2: true, bold: true}, {text: auditor, colSpan: 3},{text: resCal+"%", centered: true, colour: true, bold: true}]},

        {fontSize: font, cells: [{text: "Fecha de Calibración:", colour2: true, bold: true}, {text: fechaCalibracion, colSpan: 4}]},

        {fontSize: font, cells: [{text: " ", colSpan: 3},{text: "Etapas de la Venta", colour2: true, bold: true},{text: etapasVenta+"%", centered: true}]},
        {fontSize: font, cells: [{text: "Grupo:", colour2: true, bold: true}, {text: grupo, colSpan: 2},{text: "Habilidades Comerciales", colour2: true, bold: true},{text: habComerciales+"%", centered: true}]},

        {fontSize: font, cells: [{text: "Motivo Auditoría:", colour2: true, bold: true}, {text: motivoAuditoria, colSpan: 4}]},
        {fontSize: font, cells: [{text: "Nombre Asesor:", colour2: true, bold: true}, {text: vendedor, colSpan: 2},{text: "Lead", colour2: true, bold: true},{text: " ", centered: true}]},
        {fontSize: font, cells: [{text: "Tipo de Campaña:", colour2: true, bold: true}, {text: tipoCampana, colSpan: 2},{text: "Fecha", colour2: true, bold: true},{text: " ", centered: true}]},
        {fontSize: font, cells: [{text: "Supervisor:", colour2: true, bold: true}, {text: " ", colSpan:4}]},

        {cells: [{text: " ", colSpan: 5}]},
        //{cells: [{text: " ", colSpan: 5}]},
        //{cells: [{text: " ", colSpan: 5}]},

        {header: true, cells: ["Pesos", "Item", "Detalle", {text: "Puntuación", colSpan: 2, centered: true}]},
        {fontSize: fontC, rowSpan: 3, cells: [{ text: peso1 + "%", centered: true }, "1. PRESENTACIÓN EMPÁTICA", "SALUDO INSTITUCIONAL", {text: saludo, colSpan: 2, centered: true}]},
        {fontSize: fontC, cells: ["SIMPATÍA / EMPATÍA", {text: simpatiaEmpatia, colSpan: 2, centered: true}]},
        {fontSize: fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result1+"%", colSpan: 2, centered: true}]},
        
        {fontSize: fontC, rowSpan: 3, cells: [{ text: peso2+"%", centered: true }, "2. CALIFICACION", "PRECALIFICACION", {text: percalificacion, colSpan: 2, centered: true}]},
        {fontSize: fontC, cells: ["PREGUNTAS SUBJETIVAS", {text: preguntasSubjetivas, colSpan: 2, centered: true}]},
        {fontSize: fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result2+"%", colSpan: 2, centered: true}]},
        
        {fontSize: fontC, rowSpan:6, cells: [{ text: peso3+"%", centered: true }, "3. PANORAMA OSCURO", "EL VENDEDOR ETIQUETA CON UNA ENFERMEDAD AL CLIENTE Y EXPLICA LA GRAVEDAD QUE PUEDE EMPEORAR DE FORMA PERSONALIZADA", {text: etiqueta, colSpan: 2, centered: true}]},
        {fontSize: fontC, cells: ["ENFOCARSE EN LA ENFERMEDAD IDENTIFICADA EN LA CALIFICACIÓN", {text: enfoque, colSpan: 2, centered: true}]},
        {fontSize: fontC, cells: ["TONO DE VOZ (PREOCUPA AL CLIENTE / PACIENTE)", {text: tono, colSpan: 2, centered: true}]},
        {fontSize: fontC, cells: ["CONOCIMIENTO DE LA PATOLOGÍA", {text: conocimiento, colSpan: 2, centered: true}]},
        {fontSize: fontC, cells: ["DATO DURO", {text: datoDuro, colSpan: 2, centered: true}]},
        {fontSize: fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result3+"%", colSpan: 2, centered: true}]},

        {fontSize: fontC, rowSpan:2, cells: [{ text: peso4+"%", centered: true }, "4. TESTIMONIO", "SE MENCIONA ALGUNA REFERENCIA QUE HAYA TOMADO EL TRATAMIENTO Y LE HAYA FUNCIONADO", {text: referencia, colSpan: 2, centered: true}]},
        {fontSize: fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result4+"%", colSpan: 2, centered: true}]},

        {fontSize: fontC, rowSpan:2, cells: [{ text: peso5+"%", centered: true }, "5. SOLUCIÓN / BENEFICIOS", "SE REALIZA UN MATCH ENTRE LA CALIFICACIÓN Y LOS BENEFICIOS DEL TRATAMIENTO", {text: match, colSpan: 2, centered: true}]},
        {fontSize: fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result5+"%", colSpan: 2, centered: true}]},

        {fontSize: fontC, rowSpan:2, cells: [{ text: peso6+"%", centered: true }, "6. RESPALDO", "SE UTILIZA LA MATRIZ DE VALOR (TRAYECTORIA, CALIDAD, PROFESIONALISMO Y SERVICIO)", {text: matriz, colSpan: 2, centered: true}]},
        {fontSize: fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result6+"%", colSpan: 2, centered: true}]},

        {fontSize: fontC, rowSpan:2, cells: [{ text: peso7+"%", centered: true }, "7. CIERRE DE VENTA", "TOMA EL MOMENTO ADECUADO PARA ORDENAR LA FORMA DE PAGO", {text: momento, colSpan: 2, centered: true}]},
        {fontSize: fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result7+"%", colSpan: 2, centered: true}]},

        {cells: [{text: " ", colSpan: 5}]},

        {fontSize: fontC, cells: ["", {text: "COMUNICACION EFECTIVA", colour: true, bold: false}, {text: "Puntuación:", bold: true, colour2: true},{text: puntComEfec, colSpan: 2, centered: true}]},
        {fontSize: fontC, cells: ["", {text: "CONOCIMIENTO DEL TRATAMIENTO", colour: true, bold: false}, {text: "Puntuación:", bold: true, colour2: true},{text: puntConTrat, colSpan: 2, centered: true}]},
        {fontSize: fontC, cells: ["", {text: "REBATE DE POSIBLES OBJECIONES", colour: true, bold: false}, {text: "Puntuación:", bold: true, colour2: true},{text: puntRebObj, colSpan: 2, centered: true}]},

        {cells: [{text: " ", colSpan: 5}]},
        //{cells: [{text: " ", colSpan: 5}]},
        //{cells: [{text: " ", colSpan: 5}]},

        {cells: [{text: "Comentarios:", colSpan: 5, bold: true}]},
        //{cells: [{text: " ", colSpan: 5}]},
        
        {fontSize: font, cells: [{text: "- Saludo Institucional: "+comentario_saludo, colSpan: 5}]},
        //{cells: [{text: " ", colSpan: 5}]},
        {fontSize: font, cells: [{text: "- Simpatía/Empatía: "+comentario_empatia, colSpan: 5}]},
        //{cells: [{text: " ", colSpan: 5}]},
        {fontSize: font, cells: [{text: "- Precalificación: "+comentario_prec, colSpan: 5}]},
        //{cells: [{text: " ", colSpan: 5}]},
        {fontSize: font, cells: [{text: "- Preguntas subjetivas: "+comentario_pregSub, colSpan: 5}]},
        //{cells: [{text: " ", colSpan: 5}]},
        {fontSize: font, cells: [{text: "- Etiqueta enfermedad: "+comentario_etiqEnf, colSpan: 5}]},
        //{cells: [{text: " ", colSpan: 5}]},
        {fontSize: font, cells: [{text: "- Enfocarse en la enfermedad: "+comentario_enfocEnf, colSpan: 5}]},
        //{cells: [{text: " ", colSpan: 5}]},
        {fontSize: font, cells: [{text: "- Tono de voz: "+comentario_tonoVoz, colSpan: 5}]},
        //{cells: [{text: " ", colSpan: 5}]},
        {fontSize: font, cells: [{text: "- Conocimiento de la patología: "+comentario_conPat, colSpan: 5}]},
        //{cells: [{text: " ", colSpan: 5}]},
        {fontSize: font, cells: [{text: "- Dato duro: "+comentario_datoDuro, colSpan: 5}]},
        //{cells: [{text: " ", colSpan: 5}]},
        {fontSize: font, cells: [{text: "- Testimonio: "+comentario_test, colSpan: 5}]},
        //{cells: [{text: " ", colSpan: 5}]},
        {fontSize: font, cells: [{text: "- Solución/Beneficios: "+comentario_solBenef, colSpan: 5}]},
        //{cells: [{text: " ", colSpan: 5}]},
        {fontSize: font, cells: [{text: "- Respaldo: "+comentario_resp, colSpan: 5}]}, 
        //{cells: [{text: " ", colSpan: 5}]},
        {fontSize: font, cells: [{text: "- Cierre de venta: "+comentario_cierreVenta, colSpan: 5}]},

        
    ];
/*
    const tr = document.createElement('tr');
    const td = document.createElement('td');

    let imageElement = document.createElement('img');
    imageElement.src = 'img/logo.svg';

    td.appendChild(imageElement);    
    tr.appendChild(td);
    table.appendChild(tr);*/

    rowsData.forEach(rowData => {
        const tr = document.createElement('tr');

        rowData.cells.forEach((cellData, index) => {
            const td = document.createElement('td');
            
            // Comprobamos si cellData es un objeto o simplemente texto
            if (typeof cellData === 'object' && cellData.text) {
                td.textContent = cellData.text;

                // Si existe colSpan, lo aplicamos
                if (cellData.colSpan) {
                    td.colSpan = cellData.colSpan;
                }

                // Si existe la propiedad 'centered', aplicamos la clase CSS
                if (cellData.centered) {
                    td.classList.add("centered-cell");
                }

                if (cellData.colour) {
                    td.classList.add("colour-cell");
                }

                if (cellData.colour2) {
                    td.classList.add("colour2-cell");
                }

                if (cellData.colour3) {
                    td.classList.add("colour3-cell");
                }

                if (cellData.bold) {
                    td.classList.add("bold-cell");
                }

                if (cellData.left) {
                    td.classList.add("left-image-cell");
                }

            } else {
                td.textContent = cellData;
            }
            
            if (rowData.rowSpan && index < 2) { // Si el objeto tiene un rowSpan y es para las primeras dos celdas
                td.rowSpan = rowData.rowSpan;
            }

            if (rowData.header) {
                td.classList.add('header-cell');
            }

            // Si es una fila "resultRow", añade la clase CSS
            if (rowData.resultRow) {
                td.classList.add("result-cell");
            }

            if (rowData.fontSize) {
                td.style.fontSize = rowData.fontSize;
            }

            tr.appendChild(td);
        });
        table.appendChild(tr);
    });
    return table;
}

function mostrarResultados(modalUsed, modalBodyUsed, resultados, nombreAuditor, grupoVendedor, motivo, asesor, tipoCampanaVendedor, audioFileName, audioDuracion) {
    const modal = document.getElementById(modalUsed);
    const modalBody = document.getElementById(modalBodyUsed);
    modalBody.innerHTML = ''; // Limpiar el contenido anterior
    
    const table = document.createElement('table');
    
    const tableResult = createReportTable(table, resultados, nombreAuditor, grupoVendedor, motivo, asesor, tipoCampanaVendedor, audioFileName, audioDuracion);
    modalBody.appendChild(tableResult);

    modal.style.display = 'block';
}


function mostrarResultadosReporteGeneral(modalUsed, modalBodyUsed, resultados, nombreAuditor, grupoVendedor, motivo, asesor, tipoCampanaVendedor) {
    const modal = document.getElementById(modalUsed);
    const modalBody = document.getElementById(modalBodyUsed);
    modalBody.innerHTML = ''; // Limpiar el contenido anterior
    
    const table = document.createElement('table');
    
    modalBody.appendChild(table);

    const [auditor, fechaCalibracion, grupo, motivoAuditoria, nombreAsesor, tipoCampana] = [nombreAuditor, currentDate(), grupoVendedor, motivo, asesor, tipoCampanaVendedor];
    const [saludo, simpatiaEmpatia] = [resultados[0].valor, resultados[1].valor];
    const [percalificacion, preguntasSubjetivas] = [resultados[2].valor, resultados[3].valor];
    const [etiqueta, enfoque, tono, conocimiento, datoDuro] = [resultados[4].valor, resultados[5].valor, resultados[6].valor, resultados[7].valor, resultados[8].valor];
    const [referencia] = [resultados[9].valor]; 
    const [match] = [resultados[10].valor];
    const [matriz] = [resultados[11].valor];
    const [momento] = [resultados[12].valor];
    const [puntComEfec] = [resultados[13].valor];
    const [puntConTrat] = [resultados[14].valor];
    const [puntRebObj] = [resultados[15].valor];
    const [comentario_saludo, comentario_empatia, comentario_prec, comentario_pregSub, comentario_etiqEnf, comentario_enfocEnf, comentario_tonoVoz, comentario_conPat, comentario_datoDuro, comentario_test, comentario_solBenef, comentario_resp, comentario_cierreVenta, comentario_comEfectiva, comentario_conocTratamiento, comentario_rebObjeciones] = 
    [resultados[0].comentario, resultados[1].comentario, resultados[2].comentario, resultados[3].comentario, resultados[4].comentario, resultados[5].comentario, resultados[6].comentario, resultados[7].comentario, resultados[8].comentario, resultados[9].comentario, 
    resultados[10].comentario, resultados[11].comentario, resultados[12].comentario, resultados[13].comentario, resultados[14].comentario, resultados[15].comentario];

    fechaCal = fechaCalibracion;

    const result1 = puntuacion(saludo,simpatiaEmpatia);
    const result2 = puntuacion(percalificacion,preguntasSubjetivas);
    const result3 = puntuacion(etiqueta, enfoque, tono, conocimiento, datoDuro);
    const result4 = puntuacion(referencia);
    const result5 = puntuacion(match);
    const result6 = puntuacion(matriz);
    const result7 = puntuacion(momento);

    const etapasVenta = (peso1/100 * result1) + (peso2/100*result2) + (peso3/100*result3) + (peso4/100*result4) + (peso5/100*result5) + (peso6/100*result6) + (peso7/100*result7)
    const habComerciales = puntuacion(puntComEfec, puntConTrat, puntRebObj);

    const resCal = (etapasVenta+habComerciales)/(2);

    const rowsData = [
        {fontSize: fontH, header: true, cells: [{text: "Acta Calibración Cariola", colSpan: 5, centered: true, colour3: true}]},
        {cells: [{text: " ", colSpan: 5}]},
        //{cells: [{text: " ", colSpan: 5}]},

        {fontSize: font, cells: [{text: " ", colSpan: 4},{text: "Resultado Calibración", centered: true, colour: true, bold: true}]},
        {fontSize: font, cells: [{text: "Auditor:", colour2: true, bold: true}, {text: auditor, colSpan: 3},{text: resCal+"%", centered: true, colour: true, bold: true}]},

        {fontSize: font, cells: [{text: "Fecha de Calibración:", colour2: true, bold: true}, {text: fechaCalibracion, colSpan: 4}]},

        {fontSize: font, cells: [{text: " ", colSpan: 3},{text: "Etapas de la Venta", colour2: true, bold: true},{text: etapasVenta+"%", centered: true}]},
        {fontSize: font, cells: [{text: "Grupo:", colour2: true, bold: true}, {text: grupo, colSpan: 2},{text: "Habilidades Comerciales", colour2: true, bold: true},{text: habComerciales+"%", centered: true}]},

        {fontSize: font, cells: [{text: "Motivo Auditoría:", colour2: true, bold: true}, {text: motivoAuditoria, colSpan: 4}]},
        {fontSize: font, cells: [{text: "Nombre Asesor:", colour2: true, bold: true}, {text: nombreAsesor, colSpan: 4}]},
        {fontSize: font, cells: [{text: "Tipo de Campaña:", colour2: true, bold: true}, {text: tipoCampana, colSpan: 4}]},
        
        {cells: [{text: " ", colSpan: 5}]},
        //{cells: [{text: " ", colSpan: 5}]},
        //{cells: [{text: " ", colSpan: 5}]},

        {header: true, cells: ["Pesos", "Item", "Detalle", {text: "Puntuación", colSpan: 2, centered: true}]},
        {fontSize: fontC, rowSpan: 3, cells: [{ text: peso1 + "%", centered: true }, "1. PRESENTACIÓN EMPÁTICA", "SALUDO INSTITUCIONAL", {text: saludo, colSpan: 2, centered: true}]},
        {fontSize: fontC, cells: ["SIMPATÍA / EMPATÍA", {text: simpatiaEmpatia, colSpan: 2, centered: true}]},
        {fontSize: fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result1+"%", colSpan: 2, centered: true}]},
        
        {fontSize: fontC, rowSpan: 3, cells: [{ text: peso2+"%", centered: true }, "2. CALIFICACION", "PRECALIFICACION", {text: percalificacion, colSpan: 2, centered: true}]},
        {fontSize: fontC, cells: ["PREGUNTAS SUBJETIVAS", {text: preguntasSubjetivas, colSpan: 2, centered: true}]},
        {fontSize: fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result2+"%", colSpan: 2, centered: true}]},
        
        {fontSize: fontC, rowSpan:6, cells: [{ text: peso3+"%", centered: true }, "3. PANORAMA OSCURO", "EL VENDEDOR ETIQUETA CON UNA ENFERMEDAD AL CLIENTE Y EXPLICA LA GRAVEDAD QUE PUEDE EMPEORAR DE FORMA PERSONALIZADA", {text: etiqueta, colSpan: 2, centered: true}]},
        {fontSize: fontC, cells: ["ENFOCARSE EN LA ENFERMEDAD IDENTIFICADA EN LA CALIFICACIÓN", {text: enfoque, colSpan: 2, centered: true}]},
        {fontSize: fontC, cells: ["TONO DE VOZ (PREOCUPA AL CLIENTE / PACIENTE)", {text: tono, colSpan: 2, centered: true}]},
        {fontSize: fontC, cells: ["CONOCIMIENTO DE LA PATOLOGÍA", {text: conocimiento, colSpan: 2, centered: true}]},
        {fontSize: fontC, cells: ["DATO DURO", {text: datoDuro, colSpan: 2, centered: true}]},
        {fontSize: fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result3+"%", colSpan: 2, centered: true}]},

        {fontSize: fontC, rowSpan:2, cells: [{ text: peso4+"%", centered: true }, "4. TESTIMONIO", "SE MENCIONA ALGUNA REFERENCIA QUE HAYA TOMADO EL TRATAMIENTO Y LE HAYA FUNCIONADO", {text: referencia, colSpan: 2, centered: true}]},
        {fontSize: fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result4+"%", colSpan: 2, centered: true}]},

        {fontSize: fontC, rowSpan:2, cells: [{ text: peso5+"%", centered: true }, "5. SOLUCIÓN / BENEFICIOS", "SE REALIZA UN MATCH ENTRE LA CALIFICACIÓN Y LOS BENEFICIOS DEL TRATAMIENTO", {text: match, colSpan: 2, centered: true}]},
        {fontSize: fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result5+"%", colSpan: 2, centered: true}]},

        {fontSize: fontC, rowSpan:2, cells: [{ text: peso6+"%", centered: true }, "6. RESPALDO", "SE UTILIZA LA MATRIZ DE VALOR (TRAYECTORIA, CALIDAD, PROFESIONALISMO Y SERVICIO)", {text: matriz, colSpan: 2, centered: true}]},
        {fontSize: fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result6+"%", colSpan: 2, centered: true}]},

        {fontSize: fontC, rowSpan:2, cells: [{ text: peso7+"%", centered: true }, "7. CIERRE DE VENTA", "TOMA EL MOMENTO ADECUADO PARA ORDENAR LA FORMA DE PAGO", {text: momento, colSpan: 2, centered: true}]},
        {fontSize: fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result7+"%", colSpan: 2, centered: true}]},

        {cells: [{text: " ", colSpan: 5}]},

        {fontSize: fontC, cells: ["", {text: "COMUNICACION EFECTIVA", colour: true, bold: false}, {text: "Puntuación:", bold: true, colour2: true},{text: puntComEfec, colSpan: 2, centered: true}]},
        {fontSize: fontC, cells: ["", {text: "CONOCIMIENTO DEL TRATAMIENTO", colour: true, bold: false}, {text: "Puntuación:", bold: true, colour2: true},{text: puntConTrat, colSpan: 2, centered: true}]},
        {fontSize: fontC, cells: ["", {text: "REBATE DE POSIBLES OBJECIONES", colour: true, bold: false}, {text: "Puntuación:", bold: true, colour2: true},{text: puntRebObj, colSpan: 2, centered: true}]},

        {cells: [{text: " ", colSpan: 5}]},
        
    ];
    
    rowsData.forEach(rowData => {
        const tr = document.createElement('tr');

        rowData.cells.forEach((cellData, index) => {
            const td = document.createElement('td');
            
            // Comprobamos si cellData es un objeto o simplemente texto
            if (typeof cellData === 'object' && cellData.text) {
                td.textContent = cellData.text;

                // Si existe colSpan, lo aplicamos
                if (cellData.colSpan) {
                    td.colSpan = cellData.colSpan;
                }

                // Si existe la propiedad 'centered', aplicamos la clase CSS
                if (cellData.centered) {
                    td.classList.add("centered-cell");
                }

                if (cellData.colour) {
                    td.classList.add("colour-cell");
                }

                if (cellData.colour2) {
                    td.classList.add("colour2-cell");
                }

                if (cellData.colour3) {
                    td.classList.add("colour3-cell");
                }

                if (cellData.bold) {
                    td.classList.add("bold-cell");
                }

            } else {
                td.textContent = cellData;
            }
            
            if (rowData.rowSpan && index < 2) { // Si el objeto tiene un rowSpan y es para las primeras dos celdas
                td.rowSpan = rowData.rowSpan;
            }

            if (rowData.header) {
                td.classList.add('header-cell');
            }

            // Si es una fila "resultRow", añade la clase CSS
            if (rowData.resultRow) {
                td.classList.add("result-cell");
            }

            if (rowData.fontSize) {
                td.style.fontSize = rowData.fontSize;
            }

            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    modal.style.display = 'block';
}

function mostrarTextoTransformado(texto, audioFileName) {    
    const modal = document.getElementById('modalTextoTransformado');
    const modalBody = document.getElementById('modalBodyTextoTransformado');
    const modalTitle = modal.querySelector('h2'); // Accedemos al título del modal

    modalTitle.textContent = audioFileName;//audioFileName; 
    modalBody.textContent = texto;   // Mostrar el textoTransformado
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function closeModalmodalReporteGeneral() {
    document.getElementById('modalReporteGeneral').style.display = 'none';
}

function closeModalTextoTransformado() {
    document.getElementById('modalTextoTransformado').style.display = 'none';
}

function closeModalFeedbackInterno() {
    let modal = document.getElementById('modalFeedbackInterno');
    let linkId = modal.dataset.currentLinkId;
    
    modal.style.display = 'none';
    onModalClose(linkId);
}

function closeModalmodalFacturacion() {
    let modal = document.getElementById('modalFacturacion');
    let linkId = modal.dataset.currentLinkId;
    
    modal.style.display = 'none';
    onModalClose(linkId);
}

function onModalClose(linkId) {
    let currentSelections = {
        "listBox1": getListboxValue("listBox1"),
        "listBox2": getListboxValue("listBox2"),
        "listBox3": getListboxValue("listBox3")
    };

    storeListboxSelection(linkId, currentSelections);
    console.log(linkSelections)
}

function storeListboxSelection(linkId, listboxValues) {
    linkSelections[linkId] = listboxValues;
    console.log("store: " + linkId + " - " + listboxValues);
}

function setListboxValue(listboxId, value) {
    value = (value == null) ? "Seleccione una opcion" : value;
    document.getElementById(listboxId).value = value;
    console.log("seteado " + listboxId + " - " + value);
}

function getListboxValue(listboxId) {
    console.log(document.getElementById(listboxId).value);
    return document.getElementById(listboxId).value;
}

function gerGeneralReport(){
    event.preventDefault();
    mostrarResultados("modal", "modalBody", resultados,vendedor,grupo, motivo, asesor,tipoCampana);
    document.getElementById('modalContent').scrollTop = 0;
}

function calcularPromedio(datos, clave) {
    
    if (datos.length === 0) return "0";
    
    let suma = datos.reduce((acumulador, item) => {
        let valorNumerico = parseFloat(item[clave]);
        // Verificar si valorNumerico es un número válido antes de sumarlo
        return !isNaN(valorNumerico) ? acumulador + valorNumerico : acumulador;
    }, 0);

    // Validar si el denominador es 0 para evitar división por cero
    return (suma === 0 || datos.length === 0) ? "0" : suma / datos.length;
}

function convertDateFormat(dateString) {
    // Divide la fecha y la hora
    const parts = dateString.split(' ');

    // Divide la fecha en día, mes y año
    const dateParts = parts[0].split('/');

    // Une el año, mes y día
    const formattedDate = dateParts[2] + dateParts[1] + dateParts[0];

    // Reemplaza el ":" en la hora para obtener el formato deseado
    const formattedTime = parts[1].replace(/:/g, '');

    // Devuelve el formato deseado
    return formattedDate + '_' + formattedTime;
}

function hideCloseButtons() {
    let closeButtons = document.querySelectorAll("[id^='close-btn-']");
    closeButtons.forEach(btn => {
        btn.style.display = 'none';
    });
}

function showCloseButtons() {
    let closeButtons = document.querySelectorAll("[id^='close-btn-']");
    closeButtons.forEach(btn => {
        btn.style.display = '';
    });
}

function generateFacturacion(audioFiles){
    event.preventDefault();
    if (audioFiles.length == 0) {
      Swal.fire({
        title: 'Error!',
        text: 'No ha procesado ningun audio',
        icon: 'error',
        confirmButtonText: 'Entendido'
      })
      return;
    }
    else{
      mostrarResultadosFacturacion("modalFacturacion", "modalBodymodalFacturacion");
      document.getElementById('modalFacturacion-content').scrollTop = 0;
    }
}

function mostrarResultadosFacturacion(modalUsed, modalBodyUsed){
    const modal = document.getElementById(modalUsed);
    const modalBody = document.getElementById(modalBodyUsed);
    modalBody.innerHTML = ''; // Limpiar el contenido anterior
    
    let grandTotalUSD = 0;
    let grandTotalPEN = 0;

    const table = document.createElement('table');
    table.className = 'centered-table';
    modalBody.appendChild(table);

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    
    // Crear la fila "Facturación"
    const billingRow = document.createElement('tr');
    const billingCell = document.createElement('th');
    billingCell.colSpan = 6;
    billingCell.appendChild(document.createTextNode("Facturación"));
    billingCell.style.fontSize = "22px"; // Tamaño de letra más grande
    billingCell.style.fontWeight = "bold"; // Texto en negrita
    billingRow.appendChild(billingCell);
    thead.appendChild(billingRow);

    // Crear la fila "Detalle"
    const row1 = document.createElement('tr');
    const rowCell1 = document.createElement('th');
    rowCell1.colSpan = 6;
    rowCell1.style.background = "none"; // Sin fondo
    row1.appendChild(rowCell1);
    thead.appendChild(row1);

    // Crear la fila "Fecha"
    const row0 = document.createElement('tr');
    const rowCell0 = document.createElement('th');
    rowCell0.colSpan = 1;
    rowCell0.appendChild(document.createTextNode("Fecha:"));
    //rowCell0.style.fontSize = "16px"; // Tamaño de letra más grande
    rowCell0.style.fontWeight = "bold"; // Texto en negrita
    rowCell0.style.textAlign = 'left';
    rowCell0.style.background = "none"; // Sin fondo
    row0.appendChild(rowCell0);

    const dateValueCell = document.createElement('td');
    dateValueCell.appendChild(document.createTextNode(currentDate()));
    dateValueCell.colSpan =  5;
    dateValueCell.style.textAlign = 'left';
    //dateValueCell.fontSize = "16px";
    row0.appendChild(dateValueCell);

    thead.appendChild(row0);

    // Crear la fila "Total USD"
    const row2 = document.createElement('tr');
    const rowCell2 = document.createElement('th');
    rowCell2.colSpan = 1;
    rowCell2.appendChild(document.createTextNode("Total USD:"));
    //rowCell2.style.fontSize = "16px"; // Tamaño de letra más grande
    rowCell2.style.fontWeight = "bold"; // Texto en negrita
    rowCell2.style.textAlign = 'left';
    rowCell2.style.background = "none"; // Sin fondo
    row2.appendChild(rowCell2);

    const totalUSDValueCell = document.createElement('td');
    totalUSDValueCell.appendChild(document.createTextNode(grandTotalUSD.toFixed(decimals)));
    totalUSDValueCell.colSpan =  5;
    totalUSDValueCell.style.textAlign = 'left';
    //totalUSDValueCell.fontSize = "16px";
    row2.appendChild(totalUSDValueCell);

    thead.appendChild(row2);

    // Crear la fila "Total PEN"
    const row3 = document.createElement('tr');
    const rowCell3 = document.createElement('th');
    rowCell3.colSpan = 1;
    rowCell3.appendChild(document.createTextNode("Total PEN:"));
    //rowCell3.style.fontSize = "16x"; // Tamaño de letra más grande
    rowCell3.style.fontWeight = "bold"; // Texto en negrita
    rowCell3.style.textAlign = 'left';
    rowCell3.style.background = "none"; // Sin fondo
    row3.appendChild(rowCell3);

    const totalPENValueCell = document.createElement('td');
    totalPENValueCell.appendChild(document.createTextNode(grandTotalPEN.toFixed(decimals)));
    totalPENValueCell.colSpan =  5;
    totalPENValueCell.style.textAlign = 'left';
    //totalPENValueCell.fontSize = "16px";
    row3.appendChild(totalPENValueCell);

    thead.appendChild(row3);

    // Crear una fila en blanco
    const blankRow = document.createElement('tr');
    const blankCell = document.createElement('th');
    blankCell.colSpan = 6;
    blankCell.style.background = "none"; // Sin fondo
    blankRow.appendChild(blankCell);
    thead.appendChild(blankRow);

    // Crear header
    const headerRow = document.createElement('tr');
    ["Audio", "Duración", "Operación", "Total Tokens", "Total USD", "Total PEN"].forEach(text => {
      const th = document.createElement('th');
      th.appendChild(document.createTextNode(text));
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    
    

    // Llenar filas
    for (const [audioName, records] of Object.entries(invoice)) {
      let firstRow = true;
      let totalUSD = 0;
      let totalPEN = 0;
      const rowSpanValue = records.length + 1;
  
      records.forEach(record => {
        const row = document.createElement('tr');
        
        if (firstRow) {
          const audioNameCell = document.createElement('td');
          audioNameCell.rowSpan = rowSpanValue;
          audioNameCell.appendChild(document.createTextNode(audioName));
          row.appendChild(audioNameCell);
  
          const durationCell = document.createElement('td');
          durationCell.rowSpan = rowSpanValue;
          durationCell.appendChild(document.createTextNode(record.duration));
          row.appendChild(durationCell);
  
          firstRow = false;
        }
        
        ["operation", "totalTokens", "totalCost_USD", "totalCost_PEN"].forEach(key => {
          const cell = document.createElement('td');
          cell.appendChild(document.createTextNode(record[key]));
          if (key === 'operation') {
            cell.style.textAlign = 'left'; // Alineación a la izquierda para la columna "Operación"
          }
          row.appendChild(cell);

        if (key === 'totalCost_USD') {
          totalUSD += parseFloat(record[key]);
        }
        if (key === 'totalCost_PEN') {
          totalPEN += parseFloat(record[key]);
        }
      });

      tbody.appendChild(row);
      });

      // Add the Total row
        const totalRow = document.createElement('tr');
        totalRow.className = 'bold-row';

        const totalLabelCell = document.createElement('td');
        totalLabelCell.colSpan = 2;
        totalLabelCell.appendChild(document.createTextNode('Sub-Total'));
        totalRow.appendChild(totalLabelCell);

        const totalUSDCell = document.createElement('td');
        totalUSDCell.appendChild(document.createTextNode(totalUSD.toFixed(decimals)));
        totalRow.appendChild(totalUSDCell);

        const totalPENCell = document.createElement('td');
        totalPENCell.appendChild(document.createTextNode(totalPEN.toFixed(decimals)));
        totalRow.appendChild(totalPENCell);

        tbody.appendChild(totalRow);

        grandTotalUSD += parseFloat(totalUSD.toFixed(decimals));
        grandTotalPEN += parseFloat(totalPEN.toFixed(decimals));

        }
        
        // Add the Grand Total row
        const grandTotalRow = document.createElement('tr');
        grandTotalRow.className = 'bold-row';

        const grandTotalLabelCell = document.createElement('td');
        grandTotalLabelCell.colSpan = 4;
        grandTotalLabelCell.appendChild(document.createTextNode('Total'));
        grandTotalRow.appendChild(grandTotalLabelCell);

        const grandTotalUSDCell = document.createElement('td');
        grandTotalUSDCell.appendChild(document.createTextNode(grandTotalUSD.toFixed(decimals)));
        grandTotalRow.appendChild(grandTotalUSDCell);
        totalUSDValueCell.textContent = parseFloat(grandTotalUSDCell.textContent).toFixed(decimals);

        const grandTotalPENCell = document.createElement('td');
        grandTotalPENCell.appendChild(document.createTextNode(grandTotalPEN.toFixed(decimals)));
        grandTotalRow.appendChild(grandTotalPENCell);
        totalPENValueCell.textContent = parseFloat(grandTotalPENCell.textContent).toFixed(decimals);

        tbody.appendChild(grandTotalRow);

        table.appendChild(thead);
        table.appendChild(tbody);
        
    modal.style.display = 'block';
}

function generateGeneralReport(audioFiles){
    event.preventDefault();
    if (audioFiles.length == 0) {
      Swal.fire({
        title: 'Error!',
        text: 'No ha procesado ningun audio',
        icon: 'error',
        confirmButtonText: 'Entendido'
      })
      return;
    }
    else{
      console.log(data);

      const Saludo_institucional_prom = calcularPromedio(data, "Saludo_institucional");
      const Simpatia_empatia_prom = calcularPromedio(data, "Simpatia_empatia");
      const Precalificacion_prom= calcularPromedio(data, "Precalificacion");
      const Preguntas_subjetivas_prom= calcularPromedio(data, "Preguntas_subjetivas");
      const Etiqueta_Enfermedad_prom= calcularPromedio(data, "Etiqueta_Enfermedad");
      const Enfocarse_enfermedad_prom= calcularPromedio(data, "Enfocarse_enfermedad");
      const Tono_voz_prom= calcularPromedio(data, "Tono_voz");
      const Conocimiento_patologia_prom= calcularPromedio(data, "Conocimiento_patologia");
      const Dato_duro_prom= calcularPromedio(data, "Dato_duro");
      const Testimonio_prom= calcularPromedio(data, "Testimonio");
      const Solucion_beneficios_prom= calcularPromedio(data, "Solucion_beneficios");
      const Respaldo_prom= calcularPromedio(data, "Respaldo");
      const Cierre_venta_prom= calcularPromedio(data, "Cierre_venta");
      const Comunicacion_efectiva_prom= calcularPromedio(data, "Comunicacion_efectiva");
      const Concimiento_tratamiento_prom= calcularPromedio(data, "Concimiento_tratamiento");
      const Rebate_objeciones_prom= calcularPromedio(data, "Rebate_objeciones");

    

      const resultados_nuevo = [
        {"valor":Saludo_institucional_prom, "comentario":""},
        {"valor":Simpatia_empatia_prom, "comentario":""},
        {"valor":Precalificacion_prom, "comentario":""},
        {"valor":Preguntas_subjetivas_prom, "comentario":""},
        {"valor":Etiqueta_Enfermedad_prom, "comentario":""},
        {"valor":Enfocarse_enfermedad_prom, "comentario":""},
        {"valor":Tono_voz_prom, "comentario":""},
        {"valor":Conocimiento_patologia_prom, "comentario":""},
        {"valor":Dato_duro_prom, "comentario":""},
        {"valor":Testimonio_prom, "comentario":""},
        {"valor":Solucion_beneficios_prom, "comentario":""},
        {"valor":Respaldo_prom, "comentario":""},
        {"valor":Cierre_venta_prom, "comentario":""},
        {"valor":Comunicacion_efectiva_prom, "comentario":""},
        {"valor":Concimiento_tratamiento_prom, "comentario":""},
        {"valor":Rebate_objeciones_prom, "comentario":""}
      ];
    

      mostrarResultadosReporteGeneral("modalReporteGeneral", "modalBodyReporteGeneral", resultados_nuevo,data[0].Auditor,data[0].Grupo, data[0].Motivo, data[0].Asesor,data[0].Tipo_de_Campana);
      document.getElementById('modalReporteGeneral-content').scrollTop = 0;
    }
}

function extractJSON(text) {
    const regex = /{[\s\S]*?}/; // Esta regex busca el contenido entre llaves { ... }
    const match = text.match(regex);
    if (match) {
        return match[0]; // Devuelve el primer resultado
    } else {
        return null; // Devuelve null si no encuentra ningún JSON
    }
}

/*
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
  });
*/

function textCost(model, data, audioFileName, operation){
    
    let input, output, context, inputTokens, outputTokens;

    if (model == "GPT35"){
        if (data.usage.prompt_tokens<=4000){
            context = "4K";
            inputTokens = data.usage.prompt_tokens;
            input = inputTokens/1000 * cost35I4;
        }
        if (data.usage.completion_tokens<=4000){
            context = "4K";
            outputTokens = data.usage.completion_tokens;
            output = outputTokens/1000 * cost35O4;
        }
        if (data.usage.prompt_tokens>4000 && data.usage.prompt_tokens<=16000 ){
            context = "16K";
            inputTokens = data.usage.prompt_tokens;
            input = inputTokens/1000 * cost35I16;
        }
        if (data.usage.completion_tokens>4000 && data.usage.completion_tokens<=16000 ){
            context = "16K";
            outputTokens = data.usage.completion_tokens;
            output = outputTokens/1000 * cost35O16;
        }
    }
    if (model == "GPT4"){
        if (data.usage.prompt_tokens<=8000){
            context = "8K";
            inputTokens = data.usage.prompt_tokens;
            input = inputTokens/1000 * cost4I8;
        }
        if (data.usage.completion_tokens<=8000){
            context = "8K";
            outputTokens = data.usage.completion_tokens;
            output = outputTokens/1000 * cost4O8;
        }
        if (data.usage.prompt_tokens>8000 && data.usage.prompt_tokens<=32000 ){
            context = "32K";
            inputTokens = data.usage.prompt_tokens;
            input = inputTokens/1000 * cost4I32;
        }
        if (data.usage.completion_tokens>8000 && data.usage.completion_tokens<=32000 ){
            context = "32K";
            outputTokens = data.usage.completion_tokens;
            output = outputTokens/1000 * cost4O32;
        }
    }
    
    let costUSD = (input + output);
    

    console.log({
        "operation": operation,
        "audioName": audioFileName,
        "model":model,
        "context": context,
        "inputTokens": inputTokens,
        "outputTokens": outputTokens,
        "inputCost": input,
        "outputCost": output,
        "totalTokens": inputTokens + outputTokens,
        "totalCost_USD": costUSD.toFixed(decimals),
        "totalCost_PEN": (costUSD.toFixed(decimals) * TC).toFixed(decimals)
    });

    return {
        "operation": operation,
        "audioName": audioFileName,
        "model":model,
        "context": context,
        "inputTokens": inputTokens,
        "outputTokens": outputTokens,
        "inputCost": input,
        "outputCost": output,
        "totalTokens": inputTokens + outputTokens,
        "totalCost_USD": costUSD.toFixed(decimals),
        "totalCost_PEN": (costUSD.toFixed(decimals) * TC).toFixed(decimals)
    }
}

function audioCost(fileName, duration ,seconds){
    const roundedSeconds = Math.ceil(seconds);
    let costUSD = roundedSeconds/60 * whisperCost;

    console.log({
        "operation": "Audio a texto",
        "audioName": fileName,
        "duration": duration,
        "totalTokens": "-",
        "totalCost_USD": costUSD.toFixed(decimals),
        "totalCost_PEN": (costUSD.toFixed(decimals) * TC).toFixed(decimals)
    });
    return {
        "operation": "Audio a texto",
        "audioName": fileName,
        "duration": duration,
        "totalTokens": "-",
        "totalCost_USD": costUSD.toFixed(decimals),
        "totalCost_PEN": (costUSD.toFixed(decimals) * TC).toFixed(decimals)
    }
}

function addData(jsonObject) {
    const audioName = jsonObject.audioName;
    
    // Si la llave ya existe en el diccionario, añade el objeto al array existente
    if (audioName in invoice) {
        invoice[audioName].push(jsonObject);
    } else {
      // Si la llave no existe, crea un nuevo array con el objeto JSON
      invoice[audioName] = [jsonObject];
    }
}


module.exports = {
    textCost,
    audioCost,
    addData
  };