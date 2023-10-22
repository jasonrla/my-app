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
  modalBody.innerHTML = '';
  
  await fetchApi('/set-audio-data', accessToken, "POST", {"aName": response.Nombre_Audio}); //REVISAR SI ES NECESARIO
  //REPORTE SE VE VARIAS VECES

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

  async function checkSelectionsAndShowTable() {
      
      let tipoFeedback = obtenerTipoFeedback();
      let asunto = obtenerAsunto();
      let actitudVend = obtenerActitudVendedor();

      if (tipoFeedback != "Seleccione una opción" && asunto != "Seleccione una opción" && actitudVend != "Seleccione una opción") {
          modalBody.innerHTML = '';
          
          downloadBtnPDFInterno.removeAttribute('disabled'); 
          downloadBtnPDFInterno2.removeAttribute('disabled'); 
          imageInput.removeAttribute('disabled'); 
          attachImagesBtn.removeAttribute('disabled');

          table = document.createElement('table');

          createReportTable(table, response, accessToken);
          modalBody.appendChild(table);
          
          let payload =  {
            "tipoFeedback": tipoFeedback, 
            "asunto": asunto, 
            "actitudVend": actitudVend, 
            "observacionesDetalleText": observacionesDetalleText
          };

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
    const resultados = await fetchApi('/get-general-report-data', accessToken, "POST", data);

    mostrarResultadosReporteGeneral("modalReporteGeneral", "modalBodyReporteGeneral", resultados.resultados_nuevo, accessToken, data);

    document.getElementById('modalReporteGeneral-content').scrollTop = 0;
  }
}

async function mostrarResultadosReporteGeneral(modalUsed, modalBodyUsed, resultados_nuevo, accessToken, data) {
  const modal = document.getElementById(modalUsed);
  const modalBody = document.getElementById(modalBodyUsed);
  modalBody.innerHTML = ''; // Limpiar el contenido anterior
  
  const table = document.createElement('table');
  
  modalBody.appendChild(table);

  //await fetchApi('/set-audio-data', accessToken, "POST", {"aName": data.dataToExport.Nombre_Audio});

  const resultados = await fetchApi('/get-general-report-rows', accessToken, "POST", {"resultados_nuevo": resultados_nuevo, "data": data});

  const rowsData = resultados.rows_data;

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

async function getAudioDurationHHMMSS(blob) {
  let formattedHours;
  let formattedMinutes;
  let formattedSeconds;
  let durationInSeconds;
  try {
      durationInSeconds = await getAudioDurationInSecs(blob);
      const hours = Math.floor(durationInSeconds / 60 / 60);
      formattedHours = String(hours).padStart(2, '0');
      const minutes = Math.floor(durationInSeconds / 60);
      formattedMinutes = String(minutes).padStart(2, '0');
      const seconds = Math.round(durationInSeconds % 60);
      formattedSeconds = String(seconds).padStart(2, '0');
  } catch (durationError) {
      console.error('Error al obtener la duración:', durationError);
  }
  return {
    "durationFormat" : `${formattedHours}:${formattedMinutes}:${formattedSeconds}`,
    "durationInSeconds": durationInSeconds
  }
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

  let prodEnv = await fetchApi('/get-env', accessToken);  
  prod = prodEnv.env;

  /*
  const miListbox = document.getElementById("miListbox");
  const grupo_vendedor = document.getElementById("grupoVendedor");

  miListbox.addEventListener("change", function() {
    const seleccionado = miListbox.value;
    grupo_vendedor.textContent = seleccionado ? `Grupo: ${seleccionado}` : "";
  });*/

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

      const th7 = document.createElement('th');
      th7.textContent = 'Reporte 2';
      headerRow.appendChild(th7);

      const tbody = document.createElement('tbody');
      table.appendChild(tbody);

      for (const audioFile of audioFiles) {

        let transcripcion = "";
        let duracion = "";
        let audioFileName = "";

        if(prod){

          audioFileName = audioFile.name;

          showLoadingIcon('Procesando audio: ' + audioFileName);

          duracion = await getAudioDurationHHMMSS(audioFile);

          const formData1 = new FormData();
          formData1.append('audioFile', audioFile);
          formData1.append('duracion', duracion.durationFormat);
          formData1.append('durationInSeconds', duracion.durationInSeconds);
          
          const requestOptions1 = {
            method: 'POST',
            headers: {'Authorization': `Bearer ${accessToken}`},
            body: formData1
          };

          console.log(audioFile);
          console.log(audioFile.name);
          let data = {};
          const resp = await fetch('/transformar-audio', requestOptions1);
          data = resp.ok ? await resp.json() : console.log('Error:', response.status, response.statusText);
          transcripcion = data.text;
          console.log(transcripcion);

          
        }
        else{
          transcripcion = "Audio transcripcion";
          //transcripcion = "Buenas. Muy buenas tardes Alicia, ¿cómo estás? Bien. Qué bueno, me da mucho gusto saludar que te llegó la orden. Sí. Excelente. ¿Cuántos días tiene tomándose el tratamiento? Dos, tres, como cuatro días, cinco días, como media semana. ¿Media semana? Ajá. Ok mi amor, ¿ha visto algún cambio ya positivo? No, ahorita no. Ya me duelen mis dedos. ¿Te duelen los dedos? Ajá. Ok, ¿tú tienes artritis, Alicia? No sé, no me han dicho, pero creo que sí. Ok, salvo FLEX, tú sabes que contiene colágeno que te va a ayudar a desinflamar y poco a poco, como es un tratamiento natural, va a ir sacando la inflamación y va a ir quitando el dolor. ¿Tienes algún dedito chueco? No, nada más así como con bolas. ¿Bolas? Eso es la inflamación de la membrana sinovial del líquido, el líquido se sale. Esa inflamación es la que te tiene así, con dolor y los dedos rígidos. Te sientes rígido, ¿es solamente en los dedos o hay alguna otra coyuntura que te ha afectado? No, nada más los dedos. Los dedos, ¿cuántos libros estás pesando, Alicia? Peso 142. ¿Y la estatura tuya, mi amor, cuánto es? Cinco. Cinco, vamos a ver. Tienes un poquito de sobrepeso, ¿verdad? ¿Cuánto debería ser el peso normal, sabes? ¿Te ha dicho tu médico? No, no me ha dicho que estoy sobrepeso. Si me está dando bien tus medidas, sí. ¿Peso normal para tu tamaño deberían ser 130 libras? ¿Cuántos años tienes? 50. Pero tú tienes una voz muy engañosa, Alicia. Se escucha como una muchachita, se escucha muy joven. Siempre se lo dice la gente, ¿verdad? Sí. Aparte del tratamiento para la inflamación de las articulaciones, ¿estás tomando algo más? ¿Indicado por el médico? ¿Cómo? ¿Estás tomando algún tratamiento recetado por el doctor? No, nada más para la diabetes. ¿Nada más para la diabetes? ¿Y qué tiempo tiene con diabetes? Hace como dos años. ¿Estás usando insulina o metformina? Metformina. ¿De 500? Ajá. ¿De 500 una vez o dos veces? ¿Cómo? ¿Una vez o dos veces al día tomas la metformina? Dos veces al día. Ok, entonces todavía tienes diabetes tipo 2, Alicia. Es la menos mala. La diabetes puede avanzar o puede retroceder. Así como puede bajarte a que esté normal, puede avanzar a degenerarse a tipo 1. Todavía estás a tiempo de estimular el páncreas para detener el avance de la diabetes. Sabes que la diabetes es degenerativa, progresiva. Y lamentablemente el uso prolongado de esa medicina puede dañar el hígado y los riñones. ¿Algún deterioro en algún órgano del cuerpo? No. Hasta ahora, gracias a Dios. Todo bien, gracias a Dios. Hay que mantenerse así. ¿El nivel de azúcar en la mañana en cuánto te aparece? ¿Tú te la checas? En 30. ¿En 30? A veces en 111. Ok, entonces usted está... Usted está regulada, Alicia. O sea que todavía estimulando el páncreas se normaliza. La única diabetes que no tiene solución y no tiene vuelta atrás es la diabetes mellitus. Tú sabes que hay diferentes tipos de diabetes, ¿verdad? Sí. La diabetes mellitus, que es la mala, que es la tipo 1 o la tipo 2 la que tiene, la diabetes estacional que da en el embarazo. Y hay pacientes que están prediabéticos que a veces nunca se les desarrolla la diabetes tipo 2. Entonces, el tratamiento para la páncreas se llama REVENSI para pacientes tipo 2 y prediabéticos. Esto lo que hace es estimular la célula beta del páncreas para ayudar con la producción de insulina de manera natural. Entonces, esto te ayuda a que el páncreas, o sea tu órgano, que ahora mismo no está produciendo insulina 100%, empiece a funcionar de una mejor manera. Entonces, eso te ayuda a que te regules sin necesidad de medicina. O sea que poco a poco tu propio médico te va a ir quitando el medicamento. Lo primero es bajar a prediabetes. Ya después que estés en prediabetes estamos a un paso a que estés normal. Y puedes lograr porque tú estás regulada, mi amor. Si usted tuviera mal, sí no, pero usted tiene diabetes tipo 2. Anota el nombre del tratamiento, Alicia. Se llama REVENSI. Le toma una sola de ese. Y apenas tiene 2 años, mi amor. Eso no se te ha desarrollado todavía. A veces tú vas al médico y se te sube el azúcar un día y el médico te manda pastillas de por vida. En vez de decirte, haga una dieta, cuídate, tómate esto, tómate lo otro, y ya. Pero te manda medicina y el cuerpo se va acostumbrando al químico. Hay muchas personas que se han tomado el tratamiento y que a los 3 meses ya están normales. Y como tú sabes que si tú estás bien, la medicina química te puede bajar mucho el azúcar y eso también es peligroso. El azúcar es muy bajita. Entonces tengo personas que el médico automáticamente le quitó la medicina. Ya no la pueden beber porque no la necesitan. Eso es muy fuerte. Entonces ya que el páncreas trabaja, si se toman esa medicina le bajaría demasiado y eso es peligroso. Tengo pacientes que ya no. El mismo médico se la quitó porque entonces se la baja mucho ya. O sea que ya no la necesitan y tú puedes entrar ahí porque tú estás controlada. Anota el nombre del tratamiento, Alisa, para que te lo empieces a tomar en ayunas. Dime, amor. ¿Cuál es la diferencia del azúcar? Ese es nuestro laboratorio. Nosotros, aparte de los tratamientos para los dolores y la inflamación, tenemos más de 30 productos para el cuidado de la salud. Esa es para la diabetes tipo 2 o prediabética. Se llama Revense. ¿Y eso cuánto sale? Ese tratamiento del azúcar sale en $299,95. Es un tratamiento, sí, claro que es caro, mi amor. No es un tratamiento paliativo. Los tratamientos paliativos son los que te alivian el momento y al finalizar el tratamiento vuelve usted con lo mismo y tiene que estar tomando medicina de por vida. Eso es un tratamiento, un solo tratamiento. Viene por seis meses porque se toma una sola cápsula diario y eso no es simplemente para regular el azúcar en la sangre. Eso es para que tu páncreas, si tú has buscado o has leído un poquito, sabes, que el órgano que produce insulina naturalmente en el cuerpo se llama páncreas y que eso es lo que no te está funcionando bien. Este tratamiento es para ese órgano. Entonces ya funcionando tu órgano en mayor capacidad, controla solo el azúcar en la sangre sin necesidad de pastillas. Es un tratamiento para la páncreas, no simplemente para limpiarle la sangre. La pastilla de metformina, ¿qué hace? Regula el azúcar en la sangre. Regula. O sea, no es un tratamiento para tu páncreas, sino para regular lo que ya hay en la sangre. Este tratamiento es para evitar que el azúcar se suba. ¿Y yo si no lo puedo encontrar aquí como en los naturistas? Ah, no, no, mi vida, ese tratamiento es de nosotros, del laboratorio de Svense. Y en este caso sale 299.95 porque era un paciente con dos años de diabetes. Tú todavía, gracias a papá Dios, está controlada, no tiene daños severos de hígado, riñón y eso. Porque un paciente ya más avanzado con daños severos de órgano, tú sabes que lleva un medicamento más agresivo, más medicamento, más tiempo. En el caso tuyo, no. Yo te voy a poner un descuento para personas de bajos recursos. Pero vas a ver el cambio, porque te lo digo, porque teníamos un paciente que vino con diabetes tipo 2 y el señor tenía 30 años con la enfermedad, tomando pastillas. Y siempre estaba el señor como controlado. Él se veía, se picaba el azúcar 110, 112, 90 en la mañana y se tomó el tratamiento. En el 2017, el señor tiene todos esos años que no usa medicina. Realmente, usted se le subió una vez el azúcar y el médico automáticamente lo diagnosticó con la enfermedad. Porque si ya tenía diabetes desarrollada, ¿tú crees que ese señor con dos meses de tratamiento ya le estaba bien y ya no se podía tomar la pastilla porque se ponía muy bajita su azúcar? El médico se la quitó rotundamente y el señor a la fecha se mantiene controlado. Estaba sobrepeso, bajó. Bajó también de peso, tenía como 40 libras de más. Que también eso le ayudó muchísimo en su proceso. Yo sé que tú no bajaste de peso. ¿Usted quiere decir que estoy subida de peso? No, no, no. Tú no estás subida de peso. Tú nada más tienes unas libritas de más, mi vida. No, te digo el señor que estaba subido de peso. No, pero yo digo, ¿cuánto es lo que tendría que pesar? Tú, para 5, para el tamaño de 5 serían 130. Pero eso sí es también la medida que tú me estás dando porque yo no sé realmente. Yo voy de acuerdo a lo que tú me dices. Pero si tú entiendes que tienes una pancita por ahí, abdomen, que lo tienes un poquito crecido, ¿sí tienes quien te varíe? Pues no, no tengo, así nunca he tomado uno. Entonces tú no tienes sobrepeso, hay algo mal con la medida entonces. A lo mejor es 5 o 2, no me acuerdo la medida. A lo mejor es 5 o 2. Pero de qué 5, pasa casi todos 5, pero no es. Sí, pero que tú sabes que hay que tener lo correcto porque yo lo meto en un aparatico aquí que me da si es sobrepeso, cuánta libra tiene demás y todo eso. Pero para eso necesito la medida exacta, si sea 5 o 2, 5 o 2 o 5 o 3. Es la única manera de uno saber si estás bien o si yo te estoy diciendo lo correcto. La última vez que me me dio la doctora hace meses que fueron 5 o 2. 5 o 2. Entonces si tú tienes 5 o 2, tú dijiste que eran 145. Sí, a pesos 142, pero yo creo que como depende también porque los zapatos, me peso y peso 143 y me quito los zapatos y peso 141, así. Ah, no, eso es por la ropa. Tú mides, tú pesas como 140, no, si tienes 5 o 2, mi amor, está bien, depende del peso, estás en el peso. Pero eso el doctor no te ha dicho nada, estás en el peso. Tienes que tener, como con ropa y sin ropa es diferente, tienes que tener como 140 libras o 141, estás bien. Si es 5 o 2, estás perfecta y eso te ayuda muchísimo a que se mejore muchísimo más rápido cuando tú tienes sobrepeso. Mira, cuando hay un bebé, si tú has tenido niños, para darle medicamento lo pesan porque la cantidad de medicamento va de acuerdo al peso. Entonces, si te mandan un medicamento, como se lo mandan a todo el mundo, y tú tienes, por ejemplo, sobrepeso, no te va a trabajar igual porque hay más volumen del cuerpo, ¿tú ves? Aunque sea el que no tiene enfermedad. Oí un doctor que estaba hablando, un doctor de aquí del BIDOBIDO, pero hay de Tijuana, que estaba diciendo que esas pastillas que le dan a uno para la diabetes, no le tienen que dar los doctores simplemente la misma pastilla a todo el paciente que tiene diabetes. Exacto. Porque la pastilla, el paciente tiene que ser pesado, medido. Exacto. Y aquí no, aquí nomás le dicen nomás que le sale el aceite de araita y luego le dan a uno la pastilla. Y créeme que nosotros con tantos pacientes que tenemos, latinos, que tienen sus soluciones naturales con nosotros, es lo mismo. Y todos los días tratamos los mismos casos sin saber cuánto mide, cuánto pesa el paciente. Le mandan la misma medicina, los mismos miligramos. Hay gente que no me está haciendo nada la pastilla. Y el médico le cambia para insulina. A mí ya me la quería dar, a mí ya me la quería dar la insulina al doctor. Pero le dije no, le dije yo no quiero eso. Porque si yo quiero, yo no puedo controlar el azúcar. Simplemente nomás que hay veces que uno come cosas. Desarreglo. Pues no le digo de comer. Pero bueno, ya con la del pancrea evitamos que se siga deteriorando, porque el doctor manda insulina cuando la azúcar ya la pastilla no la puede controlar en la sangre. ¿Entiendes? Entonces con este tratamiento tú vas a ayudar a tu páncreas para que se estimule. Porque a veces tú haces desarreglo o no puedes hacer la dieta por X o por Y y se puede subir. Pero si ya el páncreas está produciendo más insulina, el azúcar no se va a disparar. Porque eso es como el metabolismo. Es como el metabolismo. Por ejemplo, yo tengo metabolismo rápido, yo puedo comer lo que sea. Yo puedo comer puerco, puedo comer vaca, lo que sea. Yo no aumento de peso. Coma una loma, mi metabolismo está acelerado. Así estoy yo, así como comidas pues, mis tres comidas y no he aumentado de peso. Mi peso que antes tenía, antes como más joven, pesaba 160, 170 así. Pero ya de repente fui bajando de peso, sí, pero nunca he estado gorda yo. Porque se te aceleró el metabolismo. Entonces, mi reina, esta medicina de Red Veins, como acelera el proceso de la producción de insulina natural del cuerpo, aunque comas lo que comas, no te eleva el nivel de azúcar en la sangre. Porque es tu páncreas que va a trabajar. Te lo pongo así de ejemplo de metabolismo para que veas. Porque es así, yo soy delgada, a veces quiero aumentar 10 libras, 15 libras y no puedo. Porque mi metabolismo es muy rápido, ¿tú ves? Entonces mira, con ese cuento, en vez que lo pagues en 300, te queda en 249,95. ¿Ok? Es una sola, Alicia, que te vas a tomar. Vas a ver que no sé cuándo tienes cita, me imagino que cada tres meses. Cada lunes, ¿verdad? ¿A los tres? Sí. Y ya la tengo para el mes, en ese mes el 21 la tengo en el doctor. Sí, al final del mes. Entonces, vamos a ir avanzado con el tratamiento. ¿Tú conoces la prueba A1C? No. Es una prueba donde se determina la diabetes que tienes. Yo sé que la doctora te la hace. ¿Ok? Porque yo cuando te chequean, pueden ver también una curva de cómo se ha comportado el azúcar en los últimos días. Entonces, este tratamiento está próximo para llegar el martes, que tendría tú alrededor de una o dos semanas con el producto. Entonces, la doctora ve la estabilidad, pero ella tiene después, al finalizar el tratamiento, que hacerte esa prueba. A1C es la prueba que determina la diabetes. Si estás en tipo 2, es una prueba de por ciento. Te voy a decir más o menos, a ver si te la he hecho yo alguna vez. Una persona normal tiene 5.7. Una persona con pre-diabetes está por encima de 5.7 a 6.4. Una con tipo 2 está por encima de 6.4. Una persona que pasa del por ciento A1C de 14 está tipo 1. Ese es la prueba de la insulina glicosilada. Se llama A1C. A1C. Ellos te hacen esa prueba. Al finalizar el tratamiento, debes hacerla. ¿Ok? Ahí es para que te deje trabajar la medicina. ¿Ok? ¿Qué le parece si le habla dentro de una semana? Porque ahorita no tengo para pagarlo. Ay, mi vida. El problema es que el descuento en el momento de la promoción y fuera de la promoción se cae. Ahí lo tendrías que pagar y si está chiquita de dinero, entonces hasta 10 dólares, como está la situación, es una ayuda de descuento. ¿Con qué tarjeta es que tú haces los pagos? No, yo no tengo tarjeta. Yo lo pago ahí directamente en el... ¿Tú puedes tomar una de predébito? ¿Tú puedes tomar una de predébito? Mi vida, la que tiene todo el mundo también te sirve. Si quiere, luego me habla porque el tratamiento no ha comido nada. Bueno, vamos a ayudarte entonces en ese caso. Si tú lo puedes pagar para la próxima semana, hacemos una infección para que lo puedas recibir entonces. Alicia. Sí, pues ahí habla en otra semana. Mi vida, o sea, el descuento que te consigo es para recibirlo para la próxima semana, que sería... Sí, pero ahorita no puedo porque acabo de pagar mi renta. Ahorita no tengo. Apenas voy a contar con el cheque y te voy a agarrar para la semana que entra. Sí, pero es para la semana que entra, que te va a llegar. No es ahora, para el miércoles o el jueves. Te lo voy a autorizar con mi código de especialista. Es lo más que puedo hacer para que te quede en el costo mínimo, para ver si puedes hacerle esfuerzo. Mira, ahí te quedaría con mi código de empleada en 169,95. Te queda todo el tratamiento. Estaría llegando para la fecha de martes o miércoles, 13 o 14. Para esa fecha, ¿tú crees que puedes sacarlo en el correo cuando te llegue? ¿Para cuándo? Miércoles o jueves de la próxima semana. Miércoles o jueves. De la próxima semana. ¿Y en cuánto dices? No, no, espérate, miércoles o jueves no. Martes 12, miércoles 13, 170 te llegaría. Son 3 francos de resbenz de 60 cápsulas cada uno. ¿En 170? Sí, en 170. Ahí te lo estoy poniendo con mi código de especialista, mi reina, ya para la recomendación sí te pido que me sea discreta con empresa. Conozco bien el resultado del producto. ¿Crees que contaría con el tiempo y el dinero para hacer el esfuerzo, para buscarlo para el 12 o el 13, cuando le llegue al correo? ¿En 170 dices? Sí, en 170 cerrarlo, mi reina. En 170. ¿No es eso que puedo pagarlo? Sí, mira, yo te lo estoy poniendo con mi código de especialista, ya tú sabes. Entonces, el departamento de confirmación y envío te llama en un rato, es una llamada de dos minutos para validar ese descuento. Ellos son los que validan que es en 170. Lo más que sabes es que ahorita después de que te acuerde contigo, no puedo agarrar llamadas aquí en el trabajo. ¿Y a qué hora es que tú, o sea, tú estás de break ahora? Ahorita estoy en break, ya he comido. ¿Y cuándo entras? Ahorita entro a las 12. ¿En cuánto tiempo? Entro como en, ya, yo creo, ya va a picar la raya, vamos, ya va a ir. Porque yo le digo que te llamen y es un minuto que duran contigo evaluándote para que te llamen rápido, nada más para confirmar el envío. ¿Oíste? Ve comiendo entonces. ¿Es breve? Ali, es breve. Dios te bendiga, mi reina.";
          duracion = "00:03:22";
          audioFileName = "Audio.mp3"
        }
        
        showLoadingIcon('Analizando texto: ' + audioFileName);

        const payload = {
          'audioFileName': audioFileName,
          'auditor': auditor,
          'grupo_vendedor': grupoVendedor(),
          'motivo': obtenerMotivo(),
          'nombre_vendedor': obtenerNombreVendedor(),
          'tipo_campana': tipoCampanaMasDialer,
          'transcripcion': transcripcion,
          'duracion': duracion.durationFormat
        }

        let response = {};
        const resp = await fetchApi('/analizar-textos', accessToken, "POST", payload);
        response = resp;
        console.log("response");
        console.log(resp);
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
          
          //data.push(response);
          await fetchApi('/set-data-to-export', accessToken, "POST", response);
          //console.log(data);
      };
      
      const data = await fetchApi('/get-data-to-export', accessToken);  
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
    
    exportTableToExcel(tableElement, accessToken);
  });

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


