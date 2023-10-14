async function fetchApi(url, accessToken = null, method = 'GET', body = null) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
    
    const config = {
      method,
      headers
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
  }
}


let radioButtons = document.getElementsByName("channel");
  
function handleRadioButtonChange() {
    if (document.getElementById("reorden").checked) {
        document.getElementById("listBoxDialer").style.display = "block";
    } else {
        document.getElementById("listBoxDialer").style.display = "none";
    }
}
for (let i = 0; i < radioButtons.length; i++) {
    radioButtons[i].addEventListener("change", handleRadioButtonChange);
}

function updateListbox(listboxId, items) {
  const listbox = document.getElementById(listboxId);
  for (let item in items) {
      const option = document.createElement('option');
      option.value = items[item];
      option.textContent = item;
      listbox.appendChild(option);
  }
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

function obtenerDialer() {
  const listbox = document.getElementById('listBoxDialer');
  return listbox.options[listbox.selectedIndex].text;
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

function mostrarResultados(modalUsed, modalBodyUsed, response, accessToken){//, nombreAuditor, grupoVendedor, motivo, asesor, tipoCampanaVendedor, audioFileName, audioDuracion) {
  const modal = document.getElementById(modalUsed);
  const modalBody = document.getElementById(modalBodyUsed);
  modalBody.innerHTML = '';
  
  const table = document.createElement('table');
  createReportTable(table, response, accessToken);
  
  modalBody.appendChild(table);
  modal.style.display = 'block';
}


async function createReportTable(table, response, accessToken){//, nombreAuditor, grupoVendedor, motivo, asesor, tipoCampanaVendedor, audioFileName, audioDuracion){
  
  const result = await fetchApi('/report-data', accessToken, "POST", response);

  const rowsData = [
      //{cells: [{image: "/public/img/logo.svg"}]},
      {fontSize: result.fontH, header: true, cells: [{text: "Acta Calibracion Cariola", colSpan: 5, centered: true, colour3: true}]},
      {cells: [{text: " ", colSpan: 4},{text: response.Duracion, bold: true, centered: true}]},

      {fontSize: result.font, cells: [{text: " ", colSpan: 4},{text: "Resultado Calibración", centered: true, colour: true, bold: true}]},
      {fontSize: result.font, cells: [{text: "Auditor:", colour2: true, bold: true}, {text: auditor, colSpan: 3},{text: result.resCal+"%", centered: true, colour: true, bold: true}]},

      {fontSize: result.font, cells: [{text: "Fecha de Calibración:", colour2: true, bold: true}, {text: response.Fecha_Audio, colSpan: 4}]},

      {fontSize: result.font, cells: [{text: " ", colSpan: 3},{text: "Etapas de la Venta", colour2: true, bold: true},{text: result.etapasVenta+"%", centered: true}]},
      {fontSize: result.font, cells: [{text: "Grupo:", colour2: true, bold: true}, {text: response.Grupo, colSpan: 2},{text: "Habilidades Comerciales", colour2: true, bold: true},{text: result.habComerciales+"%", centered: true}]},

      {fontSize: result.font, cells: [{text: "Motivo Auditoría:", colour2: true, bold: true}, {text: response.Motivo, colSpan: 4}]},
      {fontSize: result.font, cells: [{text: "Nombre Asesor:", colour2: true, bold: true}, {text: response.Asesor, colSpan: 2},{text: "Lead", colour2: true, bold: true},{text: " ", centered: true}]},
      {fontSize: result.font, cells: [{text: "Tipo de Campaña:", colour2: true, bold: true}, {text: response.Tipo_de_Campana, colSpan: 2},{text: "Fecha", colour2: true, bold: true},{text: " ", centered: true}]},
      {fontSize: result.font, cells: [{text: "Supervisor:", colour2: true, bold: true}, {text: " ", colSpan:4}]},

      {cells: [{text: " ", colSpan: 5}]},

      {header: true, cells: ["Pesos", "Item", "Detalle", {text: "Puntuación", colSpan: 2, centered: true}]},
      {fontSize: result.fontC, rowSpan: 3, cells: [{ text: result.peso1 + "%", centered: true }, "1. PRESENTACIÓN EMPÁTICA", "SALUDO INSTITUCIONAL", {text: response.Saludo_institucional, colSpan: 2, centered: true}]},
      {fontSize: result.fontC, cells: ["SIMPATÍA / EMPATÍA", {text: response.Simpatia_empatia, colSpan: 2, centered: true}]},
      {fontSize: result.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result.result1+"%", colSpan: 2, centered: true}]},
      
      {fontSize: result.fontC, rowSpan: 3, cells: [{ text: result.peso2+"%", centered: true }, "2. CALIFICACION", "PRECALIFICACION", {text: response.Precalificacion, colSpan: 2, centered: true}]},
      {fontSize: result.fontC, cells: ["PREGUNTAS SUBJETIVAS", {text: response.Preguntas_subjetivas, colSpan: 2, centered: true}]},
      {fontSize: result.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result.result2+"%", colSpan: 2, centered: true}]},
      
      {fontSize: result.fontC, rowSpan:6, cells: [{ text: result.peso3+"%", centered: true }, "3. PANORAMA OSCURO", "EL VENDEDOR ETIQUETA CON UNA ENFERMEDAD AL CLIENTE Y EXPLICA LA GRAVEDAD QUE PUEDE EMPEORAR DE FORMA PERSONALIZADA", {text: response.Etiqueta_Enfermedad, colSpan: 2, centered: true}]},
      {fontSize: result.fontC, cells: ["ENFOCARSE EN LA ENFERMEDAD IDENTIFICADA EN LA CALIFICACIÓN", {text: response.Enfocarse_enfermedad, colSpan: 2, centered: true}]},
      {fontSize: result.fontC, cells: ["TONO DE VOZ (PREOCUPA AL CLIENTE / PACIENTE)", {text: response.Tono_voz, colSpan: 2, centered: true}]},
      {fontSize: result.fontC, cells: ["CONOCIMIENTO DE LA PATOLOGÍA", {text: response.Conocimiento_patologia, colSpan: 2, centered: true}]},
      {fontSize: result.fontC, cells: ["DATO DURO", {text: response.Dato_duro, colSpan: 2, centered: true}]},
      {fontSize: result.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result.result3+"%", colSpan: 2, centered: true}]},

      {fontSize: result.fontC, rowSpan:2, cells: [{ text: result.peso4+"%", centered: true }, "4. TESTIMONIO", "SE MENCIONA ALGUNA REFERENCIA QUE HAYA TOMADO EL TRATAMIENTO Y LE HAYA FUNCIONADO", {text: response.Testimonio, colSpan: 2, centered: true}]},
      {fontSize: result.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result.result4+"%", colSpan: 2, centered: true}]},

      {fontSize: result.fontC, rowSpan:2, cells: [{ text: result.peso5+"%", centered: true }, "5. SOLUCIÓN / BENEFICIOS", "SE REALIZA UN MATCH ENTRE LA CALIFICACIÓN Y LOS BENEFICIOS DEL TRATAMIENTO", {text: response.Solucion_beneficios, colSpan: 2, centered: true}]},
      {fontSize: result.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result.result5+"%", colSpan: 2, centered: true}]},

      {fontSize: result.fontC, rowSpan:2, cells: [{ text: result.peso6+"%", centered: true }, "6. RESPALDO", "SE UTILIZA LA MATRIZ DE VALOR (TRAYECTORIA, CALIDAD, PROFESIONALISMO Y SERVICIO)", {text: response.Respaldo, colSpan: 2, centered: true}]},
      {fontSize: result.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result.result6+"%", colSpan: 2, centered: true}]},

      {fontSize: result.fontC, rowSpan:2, cells: [{ text: result.peso7+"%", centered: true }, "7. CIERRE DE VENTA", "TOMA EL MOMENTO ADECUADO PARA ORDENAR LA FORMA DE PAGO", {text: response.Cierre_venta, colSpan: 2, centered: true}]},
      {fontSize: result.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result.result7+"%", colSpan: 2, centered: true}]},

      {cells: [{text: " ", colSpan: 5}]},

      {fontSize: result.fontC, cells: ["", {text: "COMUNICACION EFECTIVA", colour: true, bold: false}, {text: "Puntuación:", bold: true, colour2: true},{text: response.Comunicacion_efectiva, colSpan: 2, centered: true}]},
      {fontSize: result.fontC, cells: ["", {text: "CONOCIMIENTO DEL TRATAMIENTO", colour: true, bold: false}, {text: "Puntuación:", bold: true, colour2: true},{text: response.Concimiento_tratamiento, colSpan: 2, centered: true}]},
      {fontSize: result.fontC, cells: ["", {text: "REBATE DE POSIBLES OBJECIONES", colour: true, bold: false}, {text: "Puntuación:", bold: true, colour2: true},{text: response.Rebate_objeciones, colSpan: 2, centered: true}]},

      {cells: [{text: " ", colSpan: 5}]},

      {cells: [{text: "Comentarios:", colSpan: 5, bold: true}]},
      
      {fontSize: result.font, cells: [{text: "- Saludo Institucional: "+response.Saludo_institucional_comentario, colSpan: 5}]},
      {fontSize: result.font, cells: [{text: "- Simpatía/Empatía: "+response.Simpatia_empatia_comentario, colSpan: 5}]},
      {fontSize: result.font, cells: [{text: "- Precalificación: "+response.Precalificacion_comentario, colSpan: 5}]},
      {fontSize: result.font, cells: [{text: "- Preguntas subjetivas: "+response.Preguntas_subjetivas_comentario, colSpan: 5}]},
      {fontSize: result.font, cells: [{text: "- Etiqueta enfermedad: "+response.Etiqueta_Enfermedad_comentario, colSpan: 5}]},
      {fontSize: result.font, cells: [{text: "- Enfocarse en la enfermedad: "+response.Enfocarse_enfermedad_comentario, colSpan: 5}]},
      {fontSize: result.font, cells: [{text: "- Tono de voz: "+response.Tono_voz_comentario, colSpan: 5}]},
      {fontSize: result.font, cells: [{text: "- Conocimiento de la patología: "+response.Conocimiento_patologia_comentario, colSpan: 5}]},
      {fontSize: result.font, cells: [{text: "- Dato duro: "+response.Dato_duro_comentario, colSpan: 5}]},
      {fontSize: result.font, cells: [{text: "- Testimonio: "+response.Testimonio_comentario, colSpan: 5}]},
      {fontSize: result.font, cells: [{text: "- Solución/Beneficios: "+response.Solucion_beneficios_comentario, colSpan: 5}]},
      {fontSize: result.font, cells: [{text: "- Respaldo: "+response.Respaldo_comentario, colSpan: 5}]}, 
      {fontSize: result.font, cells: [{text: "- Cierre de venta: "+response.Cierre_venta_comentario, colSpan: 5}]},      
      {fontSize: result.font, cells: [{text: "- Comunicación efectiva: "+response.Comunicacion_efectiva_comentario, colSpan: 5}]},      
      {fontSize: result.font, cells: [{text: "- Conocimiento del tratamiento: "+response.Concimiento_tratamiento_comentario, colSpan: 5}]},      
      {fontSize: result.font, cells: [{text: "- Rebate de objeciones: "+response.Rebate_objeciones_comentario, colSpan: 5}]},      
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
}

let auditor = "";

document.addEventListener('DOMContentLoaded', async function() {
  let accessToken;
  
  try {
      const authData = await fetchApi('/authentication');
      accessToken = authData.token;
  } catch (error) {
      console.error('Error:', error);
  }

  try {
      const auditorData = await fetchApi('/auditor-name', accessToken);
      const verifName = document.getElementById('verifName');
      auditor = auditorData.auditor;
      verifName.textContent = auditorData.auditor;
  } catch (error) {
      console.error('Error:', error);
  }

  try {
      const vendedoresData = await fetchApi('/listbox-vendedores', accessToken);
      updateListbox('miListbox', vendedoresData);
  } catch (error) {
      console.error('Error:', error);
  }

  try {
      const motivoData = await fetchApi('/listbox-motivo', accessToken);
      updateListbox('miListboxMotivo', motivoData);
  } catch (error) {
      console.error('Error:', error);
  }

  try {
    const motivoData = await fetchApi('/listbox-dialer', accessToken);
    updateListbox('listBoxDialer', motivoData);
} catch (error) {
    console.error('Error:', error);
}

const statusMessage = document.getElementById('statusMessage');

let tipoCampana = "";

document.getElementsByName('channel').forEach(function(radio) {
  radio.addEventListener('change', function() {
    tipoCampana = this.value;
  });
});

const audioForm = document.getElementById('audio-form');
  
let audioFiles = [];
const submitButton = document.getElementById('SubmitButton');
const cancelButton = document.getElementById('cancelButton');

let prod = false;

audioForm.addEventListener('submit', async function(event) {
  statusMessage.textContent = '';
  event.preventDefault();
  document.getElementById('linksContainer').innerHTML = '';

  if(prod){
    audioFiles = Array.from(document.getElementById('audioFile').files); 
  }
  else{
    audioFiles = ["audio1", "audio2", "audio3", "audio4", "audio5", "audio6"];
  }

  if (tipoCampana == ""){
    Swal.fire({
      title: 'Error!',
      text: 'Seleccione un tipo de campaña',
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
  }
  else if (tipoCampanaAuditoria() == "Reorden" && obtenerDialer() == "Seleccione una opción"){
    Swal.fire({
      title: 'Error!',
      text: 'Seleccione un dialer',
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
  }
  else if (obtenerNombreVendedor() == "Seleccione un vendedor"){
    Swal.fire({
      title: 'Error!',
      text: 'Seleccione un vendedor',
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
  }
  else if (obtenerMotivo() == "Seleccione un motivo"){
    Swal.fire({
      title: 'Error!',
      text: 'Seleccione un motivo',
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
  }
  else if (audioFiles.length == 0) {
    Swal.fire({
      title: 'Error!',
      text: 'No ha cargado ningun audio',
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
    return;
  }
  else {
    submitButton.style.display = 'none';
    cancelButton.style.display = 'inline-block';
    
    const tipoCampanaMasDialer = (tipoCampanaAuditoria() == "Reorden") ? "Reorden - " + obtenerDialer() : tipoCampanaAuditoria();


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


    audioFiles.forEach(async audioFile => {
      const payload = {
        "audioFile": audioFile,
        "auditor": auditor,
        "grupo_vendedor": grupoVendedor(),
        "motivo": obtenerMotivo(),
        "nombre_vendedor": obtenerNombreVendedor(),
        "tipo_campana": tipoCampanaMasDialer
      };

      const response = await fetchApi('/analizar-textos', accessToken, "POST", payload);
      
      const row = document.createElement('tr');
        tbody.appendChild(row);

        //td1
        const tdAudioDate = document.createElement('td');
        tdAudioDate.textContent = response.Fecha_Audio;
        row.appendChild(tdAudioDate);

        const tdName = document.createElement('td');
        tdName.textContent = response.Nombre_Audio;
        row.appendChild(tdName);

        const tdDuration = document.createElement('td');
        tdDuration.textContent = response.Duracion;
        row.appendChild(tdDuration);

        const tdResult = document.createElement('td');
        tdResult.textContent = response.Resumen; 
        tdResult.setAttribute('contenteditable', 'true');
        tdResult.classList.add('editable-field');
        row.appendChild(tdResult);

        const tdTextLink = document.createElement('td');
        const textLink = document.createElement('a');
        textLink.href = "#";
        textLink.innerText = `Ver`;
        textLink.onclick = function(event) {
            event.preventDefault();
            mostrarTextoTransformado(response.Transcripcion, response.Nombre_Audio);
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
            mostrarResultados("modal", "modalBody", response, accessToken);
            document.getElementById('modalContent').scrollTop = 0;
        }
        td2.appendChild(link);
        row.appendChild(td2);

        const tdReporte2 = document.createElement('td');
        const link2 = document.createElement('a');
        link2.href = '#';
        link2.innerText = `Ver`;
        //link2.setAttribute('id', (linkIDCounter++).toString());
        
        link2.onclick = function(event) {
            //event.preventDefault();
            //resetModal();
      
           //const linkId = "1";
           
            //mostrarResultadosFeedback(linkId, "modalFeedbackInterno", "modalBodyFeedbackInterno", resultados,auditor,grupo, motivo, asesor,tipoCampana, audioFile.name, textoTransformado.duration);
            //document.getElementById('modalFeedbackInterno-content').scrollTop = 0;
        }
        tdReporte2.appendChild(link2);
        row.appendChild(tdReporte2);

    });
    
    statusMessage.textContent = "";
    document.getElementById('complete-icon').style.display = 'none';
    Swal.fire({
      title: 'Éxito!',
      text: 'Proceso terminado.',
      icon: 'success',
      confirmButtonText: 'OK'
    });
    submitButton.style.display = 'inline-block';
    cancelButton.style.display = 'none';

    /*
    Promise.all([analizarTextos(audioFiles,auditor,grupoVendedor(), obtenerMotivo(), obtenerNombreVendedor(),tipoCampanaMasDialer)]).then(results => {
      statusMessage.textContent = "";
      document.getElementById('complete-icon').style.display = 'none';
      Swal.fire({
        title: 'Éxito!',
        text: 'Proceso terminado.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      submitButton.style.display = 'inline-block';
      cancelButton.style.display = 'none';
    }); 
*/

  }
    
  }); //submit

  const modal = document.getElementById('modal');
  modal.addEventListener('click', function(event) {
      if (event.target === modal) {
          closeModal();
      }
  });

  const modal2 = document.getElementById('modalTextoTransformado');  
  modal2.addEventListener('click', function(event) {
    if (event.target === modal2) {
      closeModalTextoTransformado();
    }
  });

  /* COMENTADO POR SEGURIDAD
  const modal3 = document.getElementById('modalFeedbackInterno');  
  modal3.addEventListener('click', function(event) {
    if (event.target === modal3) {
      closeModalFeedbackInterno();
    }
  });
*/

  const modal4 = document.getElementById('modalReporteGeneral');  
  modal4.addEventListener('click', function(event) {
    if (event.target === modal4) {
      closeModalmodalReporteGeneral();
    }
  });

  const modal5 = document.getElementById('modalFacturacion');  
  modal5.addEventListener('click', function(event) {
    if (event.target === modal5) {
      closeModalmodalFacturacion();
    }
  });

  document.getElementById('cancelButton').addEventListener('click', function() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no puede deshacerse.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, estoy seguro',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            location.reload();
        }
    });
  });





});


