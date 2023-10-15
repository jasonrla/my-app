
const gvars = require('../utils/const.js');

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

async function audioToText(audioFile, audioFileName) {

    let durationInSeconds;
    if(gvars.prod){
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
    
async function saludoInstitucional(text, audioFileName){
if(gvars.prod){
    showLoadingIcon();
    statusMessage.textContent = 'Analizando saludo institucional: ' + audioFileName;
  
    let valor, comentario;

    const result = await Promise.all([processPrompt(pemp_role, text, pemp_part1, pemp_part2, audioFileName, "Saludo Institucional")]);
    //const cleanString = result[0].replace(/'/g, '"');  // Reemplaza comillas simples con comillas dobles
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
    if(gvars.prod){
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

async function precalificacion(text, audioFileName){
if(gvars.prod){
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
            "peso": gvars.peso,
            "estatura": estatura,
            "tipoTrabajo": tipoTrabajo,
            "otrasEnfermedades": otrasEnfermedades,
            "tratamientosQueConsume": tratamientosQueConsume,
            "gvars.productosTomaActualmente": gvars.productosTomaActualmente
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
        "gvars.productosTomaActualmente": "gvars.productosTomaActualmente"
   };
}
}

async function preguntasSubjetivas(text, audioFileName){
    if(gvars.prod){
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
    if(gvars.prod){
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
    if(gvars.prod){
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
    if(gvars.prod){
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
    if(gvars.prod){
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
    if(gvars.prod){
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
    if(gvars.prod){
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
    if(gvars.prod){
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
    if(gvars.prod){
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
    if(gvars.prod){
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

let jsonArray = [];
let jsonObjects = {};
async function analizarTextos(audioFile, auditor, grupo_vendedor, motivo, nombre_vendedor, tipo_campana) {
    
    //for (const audioFile of audioFiles) {
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
        
        const etapasVenta = (gvars.peso1/100 * result1) + (gvars.peso2/100*result2) + (gvars.peso3/100*result3) + (gvars.peso4/100*result4) + (gvars.peso5/100*result5) + (gvars.peso6/100*result6) + (gvars.peso7/100*result7)
        const habComerciales = puntuacion(result8, result9, result10);

        let resCal = (etapasVenta+habComerciales)/2;

        //resultados valor, areglar son totales no individual
        const formattedString = `AUD POR ${auditor} // PEMP-${result1}% CAL-${result2}% P.OSC-${result3}% 
                TEST-${result4}% S.BEN-${result5}% RESP-0${result6}% C.VENT-0${result7}% C.EFE-${result8}% 
                C.TRA-${result9}% R.OBJ-${result10}% / MOTIVO: "PENDIENTE"`;


        //let jsonObject = {
        return {
            "Auditor": auditor,
            "Grupo": grupo_vendedor,
            "Motivo": motivo,
            "Asesor": nombre_vendedor,
            "Tipo_de_Campana": tipo_campana,
            "Fecha_Audio": currentDate(),
            "Nombre_Audio": "File example",//audioFile.name,
            "Duracion": textoTransformado.duration,
            "Resumen": formattedString,
            "Transcripcion": textoTransformado.text,

            "Saludo_institucional": resultados[0].valor,
            "Simpatia_empatia": resultados[1].valor,
            "Res_Pres_Empatica": gvars.peso1+"%",
            "ResFinal_Pres_Empatica": result1.toString()+"%",
            "Saludo_institucional_comentario": resultados[0].comentario,    
            "Simpatia_empatia_comentario": resultados[1].comentario, 

            "Precalificacion": resultados[2].valor,
            "Preguntas_subjetivas": resultados[3].valor,
            "Res_Calificacion": gvars.peso2.toString()+"%",
            "ResFinal_Calificacion": result2.toString()+"%",
            "Precalificacion_comentario": resultados[2].comentario, 
            "Preguntas_subjetivas_comentario": resultados[3].comentario, 
            
            "Etiqueta_Enfermedad": resultados[4].valor,
            "Enfocarse_enfermedad": resultados[5].valor,
            "Tono_voz": resultados[6].valor,
            "Conocimiento_patologia": resultados[7].valor,
            "Dato_duro": resultados[8].valor,
            "Res_PanOscuro":  gvars.peso3.toString()+"%",
            "ResFinal_PanOscuro": result3.toString()+"%",
            "Etiqueta_Enfermedad_comentario": resultados[4].comentario, 
            "Enfocarse_enfermedad_comentario": resultados[5].comentario, 
            "Tono_voz_comentario": resultados[6].comentario, 
            "Conocimiento_patologia_comentario": resultados[7].comentario, 
            "Dato_duro_comentario": resultados[8].comentario, 
            
            "Testimonio": resultados[9].valor,
            "Res_Testimonio": gvars.peso4.toString()+"%",
            "ResFinal_Testimonio": result4.toString()+"%",
            "Testimonio_comentario": resultados[9].comentario, 
            
            "Solucion_beneficios": resultados[10].valor,
            "Res_SolBeneficios": gvars.peso5.toString()+"%",
            "ResFinal_SolBeneficios": result5.toString()+"%",
            "Solucion_beneficios_comentario": resultados[10].comentario, 
            
            "Respaldo": resultados[11].valor,
            "Res_Respaldo": gvars.peso6.toString()+"%",
            "ResFinal_Respaldo": result6.toString()+"%",
            "Respaldo_comentario": resultados[11].comentario, 
            
            "Cierre_venta": resultados[12].valor,
            "Res_CierreVenta": gvars.peso7.toString()+"%",
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

        //jsonArray.push(jsonObject);
    //}
    //jsonObjects["textos_analizados"] = jsonArray;
    //return jsonObjects;
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

module.exports = {
    analizarTextos,
    puntuacion,
    currentDate,
    convertDateFormat,
    calcularPromedio
};