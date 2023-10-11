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

    const payload = {
      "audioFiles": audioFiles,
      "auditor": auditor,
      "grupo_vendedor": grupoVendedor(),
      "motivo": obtenerMotivo(),
      "nombre_vendedor": obtenerNombreVendedor(),
      "tipo_campana": tipoCampanaMasDialer
    };

    const response = await fetchApi('/analizar-textos', accessToken, "POST", payload);
    console.log(response);
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
    }); */


  }
    
  });




});


