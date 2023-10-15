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

async function mostrarTextoTransformado(texto, audioFileName, accessToken) {    
  const modal = document.getElementById('modalTextoTransformado');
  const modalBody = document.getElementById('modalBodyTextoTransformado');
  const modalTitle = modal.querySelector('h2'); // Accedemos al título del modal

  await fetchApi('/set-audio-data', accessToken, "POST", {"aName": audioFileName});
  
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
}

function storeListboxSelection(linkId, listboxValues) {
  linkSelections[linkId] = listboxValues;
  console.log("store: " + linkId + " - " + listboxValues);
}

function obtenerTipoFeedback() {
  const listbox = document.getElementById('listBox1');
  return listbox.options[listbox.selectedIndex].text;
}

function obtenerAsunto() {
  const listbox = document.getElementById('listBox2');
  return listbox.options[listbox.selectedIndex].text;
}

function obtenerActitudVendedor() {
  const listbox = document.getElementById('listBox3');
  return listbox.options[listbox.selectedIndex].text;
}

function getListboxValue(listboxId) {
  return document.getElementById(listboxId).value;
}

async function mostrarResultados(modalUsed, modalBodyUsed, response, accessToken){//, nombreAuditor, grupoVendedor, motivo, asesor, tipoCampanaVendedor, audioFileName, audioDuracion) {
  const modal = document.getElementById(modalUsed);
  const modalBody = document.getElementById(modalBodyUsed);
  modalBody.innerHTML = '';
  
  const table = document.createElement('table');
  await createReportTable(table, response, accessToken);
  
  modalBody.appendChild(table);
  modal.style.display = 'block';
}

async function exportTableToPDF(modalBody, fileName, accessToken) {
  let element = document.getElementById(modalBody);  // Reemplaza 'your-table-id' con el ID de tu tabla

  const response = await fetchApi('/get-pdf-options', accessToken);

  let opt = {
      margin:       response.margin,
      filename:     fileName + ".pdf",
      image:        response.image,
      html2canvas:  response.html2canvas,
      jsPDF:        response.jsPDF
  };

  html2pdf().from(element).set(opt).save();
}

async function createReportTable(table, response, accessToken){//, nombreAuditor, grupoVendedor, motivo, asesor, tipoCampanaVendedor, audioFileName, audioDuracion){
  
  const resFont = await fetchApi('/font-size', accessToken);
  const result = await fetchApi('/report-data', accessToken, "POST", response);
  await fetchApi('/set-audio-data', accessToken, "POST", {"aName": response.Nombre_Audio});
  
  const rowsData = [
      //{cells: [{image: "/public/img/logo.svg"}]},
      {fontSize: resFont.fontH, header: true, cells: [{text: "Acta Calibracion Cariola", colSpan: 5, centered: true, colour3: true}]},
      {cells: [{text: " ", colSpan: 4},{text: response.Duracion, bold: true, centered: true}]},

      {fontSize: resFont.font, cells: [{text: " ", colSpan: 4},{text: "Resultado Calibración", centered: true, colour: true, bold: true}]},
      {fontSize: resFont.font, cells: [{text: "Auditor:", colour2: true, bold: true}, {text: auditor, colSpan: 3},{text: result.resCal+"%", centered: true, colour: true, bold: true}]},

      {fontSize: resFont.font, cells: [{text: "Fecha de Calibración:", colour2: true, bold: true}, {text: response.Fecha_Audio, colSpan: 4}]},

      {fontSize: resFont.font, cells: [{text: " ", colSpan: 3},{text: "Etapas de la Venta", colour2: true, bold: true},{text: result.etapasVenta+"%", centered: true}]},
      {fontSize: resFont.font, cells: [{text: "Grupo:", colour2: true, bold: true}, {text: response.Grupo, colSpan: 2},{text: "Habilidades Comerciales", colour2: true, bold: true},{text: result.habComerciales+"%", centered: true}]},

      {fontSize: resFont.font, cells: [{text: "Motivo Auditoría:", colour2: true, bold: true}, {text: response.Motivo, colSpan: 4}]},
      {fontSize: resFont.font, cells: [{text: "Nombre Asesor:", colour2: true, bold: true}, {text: response.Asesor, colSpan: 2},{text: "Lead", colour2: true, bold: true},{text: " ", centered: true}]},
      {fontSize: resFont.font, cells: [{text: "Tipo de Campaña:", colour2: true, bold: true}, {text: response.Tipo_de_Campana, colSpan: 2},{text: "Fecha", colour2: true, bold: true},{text: " ", centered: true}]},
      {fontSize: resFont.font, cells: [{text: "Supervisor:", colour2: true, bold: true}, {text: " ", colSpan:4}]},

      {cells: [{text: " ", colSpan: 5}]},

      {header: true, cells: ["Pesos", "Item", "Detalle", {text: "Puntuación", colSpan: 2, centered: true}]},
      {fontSize: resFont.fontC, rowSpan: 3, cells: [{ text: result.peso1 + "%", centered: true }, "1. PRESENTACIÓN EMPÁTICA", "SALUDO INSTITUCIONAL", {text: response.Saludo_institucional, colSpan: 2, centered: true}]},
      {fontSize: resFont.fontC, cells: ["SIMPATÍA / EMPATÍA", {text: response.Simpatia_empatia, colSpan: 2, centered: true}]},
      {fontSize: resFont.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result.result1+"%", colSpan: 2, centered: true}]},
      
      {fontSize: resFont.fontC, rowSpan: 3, cells: [{ text: result.peso2+"%", centered: true }, "2. CALIFICACION", "PRECALIFICACION", {text: response.Precalificacion, colSpan: 2, centered: true}]},
      {fontSize: resFont.fontC, cells: ["PREGUNTAS SUBJETIVAS", {text: response.Preguntas_subjetivas, colSpan: 2, centered: true}]},
      {fontSize: resFont.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result.result2+"%", colSpan: 2, centered: true}]},
      
      {fontSize: resFont.fontC, rowSpan:6, cells: [{ text: result.peso3+"%", centered: true }, "3. PANORAMA OSCURO", "EL VENDEDOR ETIQUETA CON UNA ENFERMEDAD AL CLIENTE Y EXPLICA LA GRAVEDAD QUE PUEDE EMPEORAR DE FORMA PERSONALIZADA", {text: response.Etiqueta_Enfermedad, colSpan: 2, centered: true}]},
      {fontSize: resFont.fontC, cells: ["ENFOCARSE EN LA ENFERMEDAD IDENTIFICADA EN LA CALIFICACIÓN", {text: response.Enfocarse_enfermedad, colSpan: 2, centered: true}]},
      {fontSize: resFont.fontC, cells: ["TONO DE VOZ (PREOCUPA AL CLIENTE / PACIENTE)", {text: response.Tono_voz, colSpan: 2, centered: true}]},
      {fontSize: resFont.fontC, cells: ["CONOCIMIENTO DE LA PATOLOGÍA", {text: response.Conocimiento_patologia, colSpan: 2, centered: true}]},
      {fontSize: resFont.fontC, cells: ["DATO DURO", {text: response.Dato_duro, colSpan: 2, centered: true}]},
      {fontSize: resFont.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result.result3+"%", colSpan: 2, centered: true}]},

      {fontSize: resFont.fontC, rowSpan:2, cells: [{ text: result.peso4+"%", centered: true }, "4. TESTIMONIO", "SE MENCIONA ALGUNA REFERENCIA QUE HAYA TOMADO EL TRATAMIENTO Y LE HAYA FUNCIONADO", {text: response.Testimonio, colSpan: 2, centered: true}]},
      {fontSize: resFont.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result.result4+"%", colSpan: 2, centered: true}]},

      {fontSize: resFont.fontC, rowSpan:2, cells: [{ text: result.peso5+"%", centered: true }, "5. SOLUCIÓN / BENEFICIOS", "SE REALIZA UN MATCH ENTRE LA CALIFICACIÓN Y LOS BENEFICIOS DEL TRATAMIENTO", {text: response.Solucion_beneficios, colSpan: 2, centered: true}]},
      {fontSize: resFont.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result.result5+"%", colSpan: 2, centered: true}]},

      {fontSize: resFont.fontC, rowSpan:2, cells: [{ text: result.peso6+"%", centered: true }, "6. RESPALDO", "SE UTILIZA LA MATRIZ DE VALOR (TRAYECTORIA, CALIDAD, PROFESIONALISMO Y SERVICIO)", {text: response.Respaldo, colSpan: 2, centered: true}]},
      {fontSize: resFont.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result.result6+"%", colSpan: 2, centered: true}]},

      {fontSize: resFont.fontC, rowSpan:2, cells: [{ text: result.peso7+"%", centered: true }, "7. CIERRE DE VENTA", "TOMA EL MOMENTO ADECUADO PARA ORDENAR LA FORMA DE PAGO", {text: response.Cierre_venta, colSpan: 2, centered: true}]},
      {fontSize: resFont.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result.result7+"%", colSpan: 2, centered: true}]},

      {cells: [{text: " ", colSpan: 5}]},

      {fontSize: resFont.fontC, cells: ["", {text: "COMUNICACION EFECTIVA", colour: true, bold: false}, {text: "Puntuación:", bold: true, colour2: true},{text: response.Comunicacion_efectiva, colSpan: 2, centered: true}]},
      {fontSize: resFont.fontC, cells: ["", {text: "CONOCIMIENTO DEL TRATAMIENTO", colour: true, bold: false}, {text: "Puntuación:", bold: true, colour2: true},{text: response.Concimiento_tratamiento, colSpan: 2, centered: true}]},
      {fontSize: resFont.fontC, cells: ["", {text: "REBATE DE POSIBLES OBJECIONES", colour: true, bold: false}, {text: "Puntuación:", bold: true, colour2: true},{text: response.Rebate_objeciones, colSpan: 2, centered: true}]},

      {cells: [{text: " ", colSpan: 5}]},

      {cells: [{text: "Comentarios:", colSpan: 5, bold: true}]},
      
      {fontSize: resFont.font, cells: [{text: "- Saludo Institucional: "+response.Saludo_institucional_comentario, colSpan: 5}]},
      {fontSize: resFont.font, cells: [{text: "- Simpatía/Empatía: "+response.Simpatia_empatia_comentario, colSpan: 5}]},
      {fontSize: resFont.font, cells: [{text: "- Precalificación: "+response.Precalificacion_comentario, colSpan: 5}]},
      {fontSize: resFont.font, cells: [{text: "- Preguntas subjetivas: "+response.Preguntas_subjetivas_comentario, colSpan: 5}]},
      {fontSize: resFont.font, cells: [{text: "- Etiqueta enfermedad: "+response.Etiqueta_Enfermedad_comentario, colSpan: 5}]},
      {fontSize: resFont.font, cells: [{text: "- Enfocarse en la enfermedad: "+response.Enfocarse_enfermedad_comentario, colSpan: 5}]},
      {fontSize: resFont.font, cells: [{text: "- Tono de voz: "+response.Tono_voz_comentario, colSpan: 5}]},
      {fontSize: resFont.font, cells: [{text: "- Conocimiento de la patología: "+response.Conocimiento_patologia_comentario, colSpan: 5}]},
      {fontSize: resFont.font, cells: [{text: "- Dato duro: "+response.Dato_duro_comentario, colSpan: 5}]},
      {fontSize: resFont.font, cells: [{text: "- Testimonio: "+response.Testimonio_comentario, colSpan: 5}]},
      {fontSize: resFont.font, cells: [{text: "- Solución/Beneficios: "+response.Solucion_beneficios_comentario, colSpan: 5}]},
      {fontSize: resFont.font, cells: [{text: "- Respaldo: "+response.Respaldo_comentario, colSpan: 5}]}, 
      {fontSize: resFont.font, cells: [{text: "- Cierre de venta: "+response.Cierre_venta_comentario, colSpan: 5}]},      
      {fontSize: resFont.font, cells: [{text: "- Comunicación efectiva: "+response.Comunicacion_efectiva_comentario, colSpan: 5}]},      
      {fontSize: resFont.font, cells: [{text: "- Conocimiento del tratamiento: "+response.Concimiento_tratamiento_comentario, colSpan: 5}]},      
      {fontSize: resFont.font, cells: [{text: "- Rebate de objeciones: "+response.Rebate_objeciones_comentario, colSpan: 5}]},      
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


async function mostrarResultadosFeedback(linkId,modalUsed, modalBodyUsed,response, accessToken){
    
  const modal = document.getElementById(modalUsed);
  const modalBody = document.getElementById(modalBodyUsed);
  modalBody.innerHTML = ''; // Limpiar el contenido anterior
  
  const resFont = await fetchApi('/font-size', accessToken);
  await fetchApi('/set-audio-data', accessToken, "POST", {"aName": response.Nombre_Audio});

  let table;

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
  //aName = audioFileName;

  async function checkSelectionsAndShowTable() {
      
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

          table = document.createElement('table');

          await createReportTable(table, response, accessToken); //tableResult = 
          modalBody.appendChild(table);
          
          const rowsData = [
              {cells: [{text: " ", colSpan: 5}]},
              {cells: [{text: "Resultados adicionales:", colSpan: 5, bold: true}]},
              {cells: [{text: " ", colSpan: 5}]},
              {fontSize: resFont.font, cells: [{text: "- Tipo de feedback: " + tipoFeedback, colSpan: 5}]},
              {fontSize: resFont.font, cells: [{text: "- Asunto: " + asunto, colSpan: 5 }]},
              {fontSize: resFont.font, cells: [{text: "- Actitud de vendedor: " + actitudVend, colSpan: 5 }]},
              {fontSize: resFont.font, cells: [{text: observacionesDetalleText, colSpan: 5, editable: true}]},
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
              
              table.appendChild(tr); //table

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
  
      for (const element of imageFiles) {
          const file = element;
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
              table.appendChild(tr);
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

async function mostrarResultadosReporteGeneral(modalUsed, modalBodyUsed, response, accessToken) {
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

  await fetchApi('/set-audio-data', accessToken, "POST", {"aName": response.Nombre_Audio});

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

    try {
      const motivoData = await fetchApi('/listbox1', accessToken);
      updateListbox('listBox1', motivoData);
    } catch (error) {
        console.error('Error:', error);
    }

    try {
      const motivoData = await fetchApi('/listbox2', accessToken);
      updateListbox('listBox2', motivoData);
    } catch (error) {
        console.error('Error:', error);
    }

    try {
      const motivoData = await fetchApi('/listbox3', accessToken);
      updateListbox('listBox3', motivoData);
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
              mostrarTextoTransformado(response.Transcripcion, response.Nombre_Audio, accessToken);
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
              event.preventDefault();
              //resetModal();
        
              const linkId = "1";
            
              mostrarResultadosFeedback(linkId, "modalFeedbackInterno", "modalBodyFeedbackInterno", response, accessToken);
              document.getElementById('modalFeedbackInterno-content').scrollTop = 0;
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

  document.getElementById('downloadBtnPDFGeneral').addEventListener('click', async function() {
    const response = await fetchApi('/get-audio-data', accessToken);
    exportTableToPDF('modalBodyReporteGeneral', 'ReporteGeneral_' + response.fechaCal, accessToken);
  });

  document.getElementById('downloadBtnPDFGeneral2').addEventListener('click', async function() {
    const response = await fetchApi('/get-audio-data', accessToken);
    exportTableToPDF('modalBodyReporteGeneral', 'ReporteGeneral_' + response.fechaCal, accessToken);
  });

  document.getElementById('downloadBtnPDFInterno').addEventListener('click', async function() {
    const response = await fetchApi('/get-audio-data', accessToken);
    exportTableToPDF('modalBodyFeedbackInterno', 'Reporte2_' + response.aName + "_" + response.fechaCal, accessToken);
  });

  document.getElementById('downloadBtnPDFInterno2').addEventListener('click', async function() {
    const response = await fetchApi('/get-audio-data', accessToken);
    exportTableToPDF('modalBodyFeedbackInterno', 'Reporte2_' + response.aName + "_" + response.fechaCal, accessToken);
  });

  document.getElementById('downloadBtnPDFTextoTransformado').addEventListener('click', async function() {
    const response = await fetchApi('/get-audio-data', accessToken);
    exportTableToPDF('modalBodyTextoTransformado', 'Transcripción_' + response.aName + "_" + response.fechaCal, accessToken);
  });

  document.getElementById('downloadBtnPDFModal').addEventListener('click', async function() {
    const response = await fetchApi('/get-audio-data', accessToken);
    exportTableToPDF('modalBody', 'Reporte1_' + response.aName + "_" + response.fechaCal, accessToken);
  });

  document.getElementById('downloadBtnPDFModal2').addEventListener('click', async function() {
    const response = await fetchApi('/get-audio-data', accessToken);
    exportTableToPDF('modalBody', 'Reporte1_' + response.aName + "_" + response.fechaCal, accessToken);
  });

  document.getElementById('downloadBtnPDFFacturacion').addEventListener('click', async function() {
    const response = await fetchApi('/get-current-date', accessToken);
    exportTableToPDF('modalBodymodalFacturacion', 'Facturacion_' + response.currentDate, accessToken);
  });

  document.getElementById('downloadBtnPDFFacturacion2').addEventListener('click', async function() {
    const response = await fetchApi('/get-current-date', accessToken);
    exportTableToPDF('modalBodymodalFacturacion', 'Facturacion_' + response.currentDate, accessToken);
  });

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


