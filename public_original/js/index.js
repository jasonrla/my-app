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
      console.error(`Failed to fetch ${url}`);
      return await response.json();
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

for (const element of radioButtons) {
    element.addEventListener("change", handleRadioButtonChange);
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

  for (const element of radios) {
      if (element.checked) {
          seleccionado = element.value;
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

function obtenerFechaReporteFeedback() {
  return document.getElementById('datepicker').value;
}

function obtenerFechaLead() {
  return document.getElementById('datepicker2').value;
}

function obtenerValorLead() {
  return document.getElementById('autoResizeTextarea1').value;
}

function setListBox(id, desiredValue) {
  var selectBox = document.getElementById(id);

  if (!selectBox) {
    console.error('No se encontró el listbox con el id:', id);
    return;
  }

  for (var i = 0; i < selectBox.options.length; i++) {
      if (selectBox.options[i].innerText === desiredValue || selectBox.options[i].textContent === desiredValue) {
          console.log('Encontrado en el índice:', i, 'con el valor:', selectBox.options[i].value);
          selectBox.selectedIndex = i;
          selectBox.dispatchEvent(new Event('change'));  // Disparamos un evento de cambio manualmente.
          return;
      }
  }

  console.error('No se encontró el valor deseado:', desiredValue);
}

async function mostrarTextoTransformado(texto, audioFileName, accessToken) {    
  const modal = document.getElementById('modalTextoTransformado');
  const modalBody = document.getElementById('modalBodyTextoTransformado');
  const modalTitle = modal.querySelector('h2');

  await fetchApi('/set-audio-data', accessToken, "POST", {"aName": audioFileName});
  
  modalTitle.textContent = audioFileName;
  modalBody.textContent = texto;
  modalBody.style.textAlign = "justify";
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
  //linkSelections[linkId] = listboxValues;
  //console.log("store: " + linkId + " - " + listboxValues);
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

function obtenerAgente() {
  const listbox = document.getElementById('listboxAgentes');
  return listbox.options[listbox.selectedIndex].text;
}

function obtenerLider() {
  const listbox = document.getElementById('listboxLideres');
  return listbox.options[listbox.selectedIndex].text;
}

function obtenerGrupo() {
  const listbox = document.getElementById('listboxGrupos');
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

async function exportTableToPDF(modalBody, fileName, accessToken, audioFileName) {
  let element = document.getElementById(modalBody);

  let titleElement = document.createElement("h1");
  titleElement.innerHTML = audioFileName;

  let imageElement = document.createElement("img");
  imageElement.src = "/public/img/logo.svg";
  imageElement.style.float = "right";
  imageElement.style.marginBottom = "20px";
  
  let newDiv = document.createElement("div");
  newDiv.appendChild(imageElement);
  newDiv.appendChild(titleElement);
  newDiv.appendChild(element.cloneNode(true));

  const response = await fetchApi('/get-pdf-options', accessToken);

  let opt = {
      margin:       response.margin,
      filename:     fileName + ".pdf",
      image:        response.image,
      html2canvas:  response.html2canvas,
      jsPDF:        response.jsPDF
  };

  html2pdf().from(newDiv).set(opt).save();
}

async function exportTableToExcel(tableElement, accessToken) {
  const wb1 = XLSX.utils.table_to_book(tableElement, { sheet: "Sheet 1" });
  const res = await fetchApi('/excel-options', accessToken, "POST", { "wb": wb1});
  XLSX.writeFile(res.wb, res.fileName);

}

function generateFacturacion(audioFiles, accessToken){
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
    mostrarResultadosFacturacion("modalFacturacion", "modalBodymodalFacturacion", accessToken);
    document.getElementById('modalFacturacion-content').scrollTop = 0;
  }
}

async function mostrarResultadosFacturacion(modalUsed, modalBodyUsed, accessToken){

  const decimals = 8;

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

  const response = await fetchApi('/get-date', accessToken);

  const dateValueCell = document.createElement('td');
  dateValueCell.appendChild(document.createTextNode(response.date)); //////////////////////////
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
  
  const invoice = await fetchApi('/get-invoice-data', accessToken);

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

function createHiddenTableFromData(data) {

  if (!Array.isArray(data)) {
    data = Object.values(data);
  }

  // Verificar si ya existe una tabla anterior y eliminarla si es así
  const existingTable = document.getElementById('hiddenTable');
  if (existingTable) {
      existingTable.remove();
  }
  
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
  console.log(table);
  return table;
}

async function createReportTable(table, response, accessToken){
  
  const resp = await fetchApi('/get-rows-data', accessToken, "POST", response);

  const rowsData = resp.rows_data;
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

              if (cellData.width) {
                td.classList.add("cell-width");
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




let myCalendar;

function openCalendar() {
  myCalendar.open();
}

async function mostrarResultadosFeedback(linkId,modalUsed, modalBodyUsed,response, accessToken){
  
  const modal = document.getElementById(modalUsed);
  const modalBody = document.getElementById(modalBodyUsed);
  modalBody.innerHTML = '';
  
  await fetchApi('/set-audio-data', accessToken, "POST", {"aName": response.Nombre_Audio});

  setListBox("listboxAgentes",response.Asesor);
  setListBox("listboxGrupos",response.Grupo);

  resetModal();
  
  let table;

  let observacionesDetalleText = "- Observaciones/Detalle: ";

  myCalendar = flatpickr("#datepicker", {
    altInput: true,
    altFormat: "m/d/Y",
    dateFormat: "Y-m-d",
    defaultDate: "today"
  });

  myCalendar = flatpickr("#datepicker2", {
    altInput: true,
    altFormat: "m/d/Y",
    dateFormat: "Y-m-d",
  });

/*
  const datePicker1 = document.getElementById('date-picker1');
  const datePicker2 = document.getElementById('date-picker2');
  //datePicker1.style.display = 'inline-block';  // Muestra el calendario
  //datePicker2.style.display = 'inline-block';  // Muestra el calendario

  datePicker1.addEventListener('keydown', function(e) {
    e.preventDefault();
  });

  datePicker2.addEventListener('keydown', function(e) {
    e.preventDefault();
  });

  datePicker1.addEventListener('change', function() {
    // Haz algo con la fecha seleccionada
    console.log('Fecha seleccionada:', datePicker1.value);
  });
  
  datePicker2.addEventListener('change', function() {
    // Haz algo con la fecha seleccionada
    console.log('Fecha seleccionada:', datePicker2.value);
  });
*/
  const listBoxFeedbackDate = document.getElementById('datepicker');
  const listBoxLeadValue = document.getElementById('autoResizeTextarea1');  
  const listBoxLeadDate = document.getElementById('datepicker2');  
  const listBox1 = document.getElementById('listBox1');
  const listBox2 = document.getElementById('listBox2');
  const listBox3 = document.getElementById('listBox3');
  const listBoxAgente = document.getElementById('listboxAgentes');
  const listBoxLider = document.getElementById('listboxLideres');
  const listBoxGrupo = document.getElementById('listboxGrupos');
  
  const downloadBtnPDFInterno = document.getElementById('downloadBtnPDFInterno');
  const downloadBtnPDFInterno2 = document.getElementById('downloadBtnPDFInterno2');
  const imageInput = document.getElementById('imageInput');
  const attachImagesBtn = document.getElementById('attachImagesBtn');

  let closeButtonCounter = 0;

  
          modalBody.innerHTML = '';
          
          
          //imageInput.removeAttribute('disabled'); 
          //attachImagesBtn.removeAttribute('disabled');

          table = document.createElement('table');

          //createReportTable(table, response, accessToken);
          modalBody.appendChild(table);
          
          let payload =  {
            //"tipoFeedback": tipoFeedback, 
            //"asunto": asunto, 
            //"actitudVend": actitudVend, 
            //"observacionesDetalleText": observacionesDetalleText
          };

          /*
          const resp = await fetchApi('/get-feedback-report-rows', accessToken, "POST", payload);
          const rowsData = resp.rows_data;
      
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
*/
          createReportTable(table, response, accessToken);

  async function checkSelectionsAndShowTable() {
  
  let feedbackDate = obtenerFechaReporteFeedback();
  let leadDate = obtenerFechaLead();
  let lead = obtenerValorLead();
  let tipoFeedback = obtenerTipoFeedback();
  let asunto = obtenerAsunto();
  let actitudVend = obtenerActitudVendedor();
  let agente = obtenerAgente();
  let lider = obtenerLider();
  let grupo = obtenerGrupo();

  if (tipoFeedback != "Seleccione una opción" && 
        asunto != "Seleccione una opción" && 
        actitudVend != "Seleccione una opción" &&
        agente != "Seleccione una opción" &&
        lider != "Seleccione una opción" &&
        grupo != "Seleccione una opción" &&
        lead != "" &&
        leadDate != "") {

    downloadBtnPDFInterno.removeAttribute('disabled'); 
    downloadBtnPDFInterno2.removeAttribute('disabled'); 
    }else{
        modal.style.display = 'block';
        downloadBtnPDFInterno.setAttribute('disabled', 'true'); // Deshabilita el botón si no se cumplen las condiciones
        downloadBtnPDFInterno2.setAttribute('disabled', 'true'); // Deshabilita el botón si no se cumplen las condiciones
    }
  }
  
  //}

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
              closeButton.style.top = '5px'; 
              closeButton.style.right = '5px';
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
              td.colSpan = 10; 
          
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
    listBoxLeadValue.addEventListener('change', checkSelectionsAndShowTable);
    listBoxLeadDate.addEventListener('change', checkSelectionsAndShowTable);
    listBox1.addEventListener('change', checkSelectionsAndShowTable);
    listBox2.addEventListener('change', checkSelectionsAndShowTable);
    listBox3.addEventListener('change', checkSelectionsAndShowTable);
    listBoxAgente.addEventListener('change', checkSelectionsAndShowTable);
    listBoxLider.addEventListener('change', checkSelectionsAndShowTable);
    listBoxGrupo.addEventListener('change', checkSelectionsAndShowTable);

    modal.style.display = 'block';
    resetModal();


}

async function generateGeneralReport(audioFiles, accessToken){
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

    const data = await fetchApi('/get-data-to-export', accessToken);  
    data.dataToExport.forEach(item => {
      item.Transcripcion = "-";
    });
    
    const resultados = await fetchApi('/get-general-report-data', accessToken, "POST", data);

    mostrarResultadosReporteGeneral("modalReporteGeneral", "modalBodyReporteGeneral", resultados.resultados_nuevo, accessToken, data);

    document.getElementById('modalReporteGeneral-content').scrollTop = 0;
  }
}

async function mostrarResultadosReporteGeneral(modalUsed, modalBodyUsed, resultados_nuevo, accessToken, data) {
  const modal = document.getElementById(modalUsed);
  const modalBody = document.getElementById(modalBodyUsed);
  modalBody.innerHTML = '';
  
  const table = document.createElement('table');
  
  modalBody.appendChild(table);

  const resultados = await fetchApi('/get-general-report-rows', accessToken, "POST", {"resultados_nuevo": resultados_nuevo, "data": data});

  const rowsData = resultados.rows_data;

  rowsData.forEach(rowData => {
      const tr = document.createElement('tr');

      rowData.cells.forEach((cellData, index) => {
          const td = document.createElement('td');
          
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
  document.getElementById('listboxLideres').selectedIndex = 0; // Establece la primera opción
  //document.getElementById('listboxAgentes').selectedIndex = 0; // Establece la primera opción
  //document.getElementById('listboxGrupos').selectedIndex = 0; // Establece la primera opción
  document.getElementById('autoResizeTextarea1').value = " "; // Establece la primera opción
  document.getElementById('datepicker2').value = ""; // Establece la primera opción

  downloadBtnPDFInterno.setAttribute('disabled', 'true');
  downloadBtnPDFInterno2.setAttribute('disabled', 'true');
  imageInput.value = '';
}





function showLoadingIcon(text) {
  const loadingTextIcon = document.getElementById('loading-icon');
  loadingTextIcon.style.display = 'inline-block';

  const loadingTextElement = document.getElementById('loading-text');
  loadingTextElement.style.display = 'inline-block';
  loadingTextElement.textContent = text;

  document.getElementById('complete-icon').style.display = 'none';
  document.getElementById('complete-text').style.display = 'none';
}

function showCompleteIcon() {
  
  document.getElementById('loading-icon').style.display = 'none';
  document.getElementById('loading-text').style.display = 'none';
  
  const completeTextIcon = document.getElementById('complete-icon')
  completeTextIcon.style.display = 'inline-block';

  const completeTextElement = document.getElementById('complete-text')
  completeTextElement.style.display = 'inline-block';
  completeTextElement.textContent = 'Procesamiento completado';
}

function ocultarOpciones(userRole){
  if (userRole === "user"){
    document.getElementById("adminOption").style.display = "none";
  }
}

let auditor = "";

document.addEventListener('DOMContentLoaded', async function() {
  
  const toggleButton = document.getElementById("toggleButton");
  const content = document.getElementById("content");

  toggleButton.addEventListener("click", function() {
    const sidebar = document.getElementById("sidebar");

    if (sidebar.style.width === "280px") {
      sidebar.style.width = "20px";
      content.style.marginLeft = "30px";
    } else {
      sidebar.style.width = "280px";
      content.style.marginLeft = "280px";
    }
  });

  document.addEventListener('click', function(event) {
    var sidebar = document.getElementById('sidebar');
    if (!sidebar.contains(event.target)) {
      // Contrae la barra lateral aquí
      sidebar.style.width = "20px";
      content.style.marginLeft = "30px";
      isSidebarExpanded = false;
    }
  });

  let accessToken;
  let userRole;
  
  try {
      const authData = await fetchApi('/authentication');
      accessToken = authData.token;
  } catch (error) {
      console.error('Error:', error);
  }

  try {
      const auditorData = await fetchApi('/auditor-name', accessToken);
      const verifName = document.getElementById('verifName');
      const role = document.getElementById('role');

      if(auditorData.error){
        console.log(auditorData);
        role.textContent = auditorData.error;
        role.style.fontWeight = 'bold';
        role.style.color = 'red';
      }else{
        auditor = auditorData.auditor;
        userRole = auditorData.role;
        verifName.textContent = auditorData.auditor;
        role.textContent = "["+auditorData.role+"]";
        role.style.fontWeight = 'bold';
        role.style.color = '#0056b3';
        ocultarOpciones(auditorData.role);
      }

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

  try {
    const motivoData = await fetchApi('/listbox-vendedores', accessToken);
    updateListbox('listboxAgentes', motivoData);
  } catch (error) {
      console.error('Error:', error);
  }

  try {
    const motivoData = await fetchApi('/listbox-lideres', accessToken);
    updateListbox('listboxLideres', motivoData);
  } catch (error) {
      console.error('Error:', error);
  }

  try {
    const motivoData = await fetchApi('/listbox-grupos', accessToken);
    updateListbox('listboxGrupos', motivoData);
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

  let prodEnv = await fetchApi('/get-env', accessToken);  
  prod = prodEnv.env;

  const miListbox = document.getElementById("miListbox");
  const grupo_vendedor = document.getElementById("grupoVendedor");

  miListbox.addEventListener("change", function() {
    const seleccionado = miListbox.value;
    grupo_vendedor.textContent = seleccionado ? `Grupo: ${seleccionado}` : "";
  });

  const selectAll = document.getElementById('selectAll');
  const deselectAll = document.getElementById('deselectAll');
  const boxes = document.querySelectorAll('.box');

  // Funcionalidad para "Select All"
  selectAll.addEventListener('change', function () {
      boxes.forEach(box => {
          box.checked = selectAll.checked;
      });
      deselectAll.checked = false;
  });

  // Funcionalidad para "Deselect All"
  deselectAll.addEventListener('change', function () {
      boxes.forEach(box => {
          box.checked = false;
      });
      selectAll.checked = false;
  });

  // Actualizar el estado de "Select All" y "Deselect All" basado en los otros checkboxes
  boxes.forEach(box => {
      box.addEventListener('change', function () {
          if (Array.from(boxes).every(b => b.checked)) {
              selectAll.checked = true;
              deselectAll.checked = false;
          } else if (Array.from(boxes).every(b => !b.checked)) {
              deselectAll.checked = true;
              selectAll.checked = false;
          } else {
              selectAll.checked = false;
              deselectAll.checked = false;
          }
      });
  });

  // Función para obtener solo los checkboxes que han sido seleccionados
  function getSelectedBoxes() {
      const selectedBoxes = [];
      boxes.forEach(box => {
          if (box.checked) {
              selectedBoxes.push(box.value);
          }
      });
      return selectedBoxes;
  }


  
  audioForm.addEventListener('submit', async function(event) {

    event.preventDefault();

    const checks = getSelectedBoxes();

    await fetchApi('/reset-values', accessToken);  

    statusMessage.textContent = '';
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
    else if (checks.length == 0) {
      Swal.fire({
        title: 'Error!',
        text: 'No ha seleccionado ningun proceso',
        icon: 'error',
        confirmButtonText: 'Entendido'
      })
      return;
    }
    else {
      
      await fetchApi('/set-selected-processes', accessToken, "POST", {"processes": getSelectedBoxes()});

      submitButton.style.display = 'none';
      cancelButton.style.display = 'inline-block';
      
      const DownloadExcelBtn = document.getElementById("downloadBtn");
      const GeneralReportBtn = document.getElementById("generalReport");
      DownloadExcelBtn.removeAttribute('disabled');
      GeneralReportBtn.removeAttribute('disabled');

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

      if(userRole === "admin"){
        const th7 = document.createElement('th');
        th7.textContent = 'Reporte 2';
        headerRow.appendChild(th7);
      }

      const tbody = document.createElement('tbody');
      table.appendChild(tbody);

      let respAudio;

      for (const audioFile of audioFiles) {

        let transcripcion = "";
        let duracion = "";
        let audioFileName = "";

        audioFileName = prod ? audioFile.name : "Audio file name test";
        
        showLoadingIcon('Procesando audio: ' + audioFileName);

        const formData1 = new FormData();
        formData1.append('audioFile', audioFile);
        
        const requestOptions1 = {
          method: 'POST',
          headers: {'Authorization': `Bearer ${accessToken}`},
          body: formData1
        };

        let data = {};
        respAudio = await fetch('/transformar-audio', requestOptions1);

        if ("error" in respAudio){
          console.log("Error al analizar audio: "+audioFileName);
          console.log(resp);
          continue;
        }

        data = await respAudio.json()
        transcripcion = data.text;
        duracion = data.duracion;
        
        showLoadingIcon('Analizando texto: ' + audioFileName);

        const payload = {
          'audioFileName': audioFileName,
          'auditor': auditor,
          'grupo_vendedor': grupoVendedor(),
          'motivo': obtenerMotivo(),
          'nombre_vendedor': obtenerNombreVendedor(),
          'tipo_campana': tipoCampanaMasDialer,
          'transcripcion': transcripcion,
          'duracion': duracion
        }

        let response = {};
        const resp = await fetchApi('/analizar-textos', accessToken, "POST", payload);

        if (resp.error) {
          console.log("Error al analizar textos del audio: "+audioFileName);
          console.log(resp);
          continue;
        }
    
        response = resp;
        
        const row = document.createElement('tr');
        tbody.appendChild(row);

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

        if(userRole === "admin"){
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
        }

        await fetchApi('/set-data-to-export', accessToken, "POST", response);
        
      };
    
      const data = await fetchApi('/get-data-to-export-excel', accessToken);  
      data.dataToExport.forEach(item => {
        item.Transcripcion = "-";
      });
      
      createHiddenTableFromData(data.dataToExport);

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

      showCompleteIcon();
    }  

  }); //submit

  document.getElementById('downloadBtn').addEventListener('click', async function() {
    
    const tableElement = document.getElementById('hiddenTable');

    if (audioFiles.length == 0) {
      Swal.fire({
        title: 'Error!',
        text: 'No se ha procesado ningun audio',
        icon: 'error',
        confirmButtonText: 'Entendido'
      })
      return;
    }
    else if (!tableElement && audioFiles.length != 0) {
      console.error('La tabla no se encontró en el DOM');
      Swal.fire({
        title: 'Error!',
        text: 'Por favor espere a que se procesen todos los archivos de audio',
        icon: 'error',
        confirmButtonText: 'Entendido'
      })
      return;
    }
    
    console.log(tableElement);
    exportTableToExcel(tableElement, accessToken);
  });

  document.getElementById('datajson').addEventListener('click', async function() {
    const data = await fetchApi('/get-data-to-export', accessToken);  

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const date = await fetchApi('/get-current-date', accessToken);
    
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'Data_'+date.currentDate+'.json');
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('downloadBtnPDFGeneral').addEventListener('click', async function() {
    const response = await fetchApi('/get-audio-data', accessToken);
    exportTableToPDF('modalBodyReporteGeneral', 'ReporteGeneral_' + response.fechaCal, accessToken, "Reporte General");
  });

  document.getElementById('downloadBtnPDFGeneral2').addEventListener('click', async function() {
    const response = await fetchApi('/get-audio-data', accessToken);
    exportTableToPDF('modalBodyReporteGeneral', 'ReporteGeneral_' + response.fechaCal, accessToken, "Reporte General");
  });

  document.getElementById('downloadBtnPDFInterno').addEventListener('click', async function() {
    const response = await fetchApi('/get-audio-data', accessToken);
    exportTableToPDF('modalBodyFeedbackInterno', 'Reporte2_' + response.aName + "_" + response.fechaCal, accessToken, "Reporte 2");
  });

  document.getElementById('downloadBtnPDFInterno2').addEventListener('click', async function() {
    const response = await fetchApi('/get-audio-data', accessToken);
    exportTableToPDF('modalBodyFeedbackInterno', 'Reporte2_' + response.aName + "_" + response.fechaCal, accessToken, "Reporte 2");
  });

  document.getElementById('downloadBtnPDFTextoTransformado').addEventListener('click', async function() {
    const response = await fetchApi('/get-audio-data', accessToken);
    exportTableToPDF('modalBodyTextoTransformado', 'Transcripción_' + response.aName + "_" + response.fechaCal, accessToken, response.aName);
  });

  document.getElementById('downloadBtnPDFModal').addEventListener('click', async function() {
    const response = await fetchApi('/get-audio-data', accessToken);
    exportTableToPDF('modalBody', 'Reporte1_' + response.aName + "_" + response.fechaCal, accessToken, "Reporte 1");
  });

  document.getElementById('downloadBtnPDFModal2').addEventListener('click', async function() {
    const response = await fetchApi('/get-audio-data', accessToken);
    exportTableToPDF('modalBody', 'Reporte1_' + response.aName + "_" + response.fechaCal, accessToken, "Reporte 1");
  });

  document.getElementById('downloadBtnPDFFacturacion').addEventListener('click', async function() {
    const response = await fetchApi('/get-current-date', accessToken);
    exportTableToPDF('modalBodymodalFacturacion', 'Facturacion_' + response.currentDate, accessToken, "Facturación");
  });

  document.getElementById('downloadBtnPDFFacturacion2').addEventListener('click', async function() {
    const response = await fetchApi('/get-current-date', accessToken);
    exportTableToPDF('modalBodymodalFacturacion', 'Facturacion_' + response.currentDate, accessToken, "Facturación");
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

  document.getElementById('generalReport').addEventListener('click', function() {
    generateGeneralReport(audioFiles, accessToken);
  });

  document.getElementById('facturacion').addEventListener('click', function() {
    generateFacturacion(audioFiles, accessToken);
  });

  document.getElementById('logout').addEventListener('click', async function() {
    console.log("logout");
    localStorage.removeItem('accessToken');
  });

  window.history.pushState(null, null, location.href);
  window.onpopstate = function () {
    window.history.go(1);
  };

});


