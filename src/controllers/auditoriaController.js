const express = require('express');
const path = require('path');
require('dotenv').config();
const app = express();
const gvars = require('../utils/const.js');
const { analizarTextos, puntuacion, currentDate, convertDateFormat, calcularPromedio, getColumnLetter, transformDateFormat, audioToText, promedioSimple, addLog, executeQuery} = require('../utils/functions.js');
const pool = require('../database/db.js');

const http = require('http');
const socketIo = require('socket.io');
const { ok } = require('assert');
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

exports.getAuditoriaPage = (req, res) => {
    if(gvars.tkn == "" || gvars.tkn == undefined || gvars.tkn == null){
        res.redirect('/');
    }
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'html', 'auditoria.html'));
};

exports.getAuthentication = (req, res) => {
    const data = {"token": gvars.tkn}
    res.json(data);
};

exports.getEnv = (req, res) => {
    const data = {"env": gvars.prodEnv}
    res.json(data);
};

exports.getAuditorName = (req, res) => {
    const data = {
        "auditor": req.session.auditor,//gvars.auditor, 
        "role": req.session.role, //gvars.role
    }
    res.json(data);
};

exports.getListBoxVendedores = async (req, res) => {
    const data = {
        "Equipo": "-",
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
    res.json(data);
};

exports.getListBoxMotivo = async (req, res) => {
    const data = {
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
    res.json(data);
};

exports.getListBoxDialer = async (req, res) => {
    const data = {
        "Dialer VTA": "",
        "Dialer OCP": "",
        "Dialer Biolux NC": ""
    };
    res.json(data);
};

exports.getListBoxLideres = async (req, res) => {
    const data = {
        "Vivianne Herranz": "",
        "Judith Ayala": "",
        "Kelly Velarde": "",
        "Alvaro Villar": "",
        "Jordin Franco": "",
        "Denia Herrea": "",
        "Zully Soto": "",
        "Roberto Perez": ""
    };

    await executeQuery(req.session, 'SELECT * FROM configuraciones.prompts WHERE process = $1', ['saludo_institucional'])

    res.json(data);
};

exports.getListBoxGrupos = async (req, res) => {
    const data = {
        "-":"",
        "C1": "",
        "C2": "",
        "C3": "",
        "C4": "",
        "C5": "",
        "C6": "",
        "C7": "",
        "C8": "",
        "GCC": "",
        "ONLINE 2": "",
        "ONLINE 3": "",
        "TEAM 3": "",
        "TEAM 5": "",
        "TEAM 6": "",
        "TRAINING": "",
    };
    res.json(data);
};

exports.getListBox1 = async (req, res) => {
    const data = {
        "Retroalimentación": "",
        "Informativo": "",
        "Positivo": "",
        "Llamado de atención": "",
        "FeedBack calidad": ""
    };
    res.json(data);
};

exports.getListBox2 = async (req, res) => {
    const data = {
        "Auditoria de Calidad": "",
        "Lanzamiento de Producto Nuevo": "",
        "Escucha por Auditoría": "",
        "Estado de Conexión": "",
        "Baja Facturación": "",
        "Refuerzo de Producto": "",
        "Gestión CC": "",
        "Mala Tipificación": ""
    };
    res.json(data);
};

exports.getListBox3 = async (req, res) => {
    const data = {
        "Buena": "",
        "Regular": "",
        "Mala": ""
    };
    res.json(data);
};

exports.getFontSize = async (req, res) => {
    const data = {
        "fontH": gvars.fontH, 
        "font": gvars.font, 
        "fontC": gvars.fontC,
    };
    res.json(data);
};

exports.getPDFoptions = async (req, res) => {
    const data = {
        "margin":       6,
        "image":        { type: 'jpeg', quality: 0.98 },
        "html2canvas":  { scale: 2 },
        "jsPDF":        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    res.json(data);
};

exports.excelOptions = async (req, res) => {
    
    // Convertir la tabla a un libro de trabajo de Excel
    const wb = req.body.wb;

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

    const fileName = 'Procesamiento_audios_'+transformDateFormat(currentDate())+'.xlsx'

    res.json({
        "wb": wb,
        "fileName": fileName
    });
};

exports.setAudioData = async (req, res) => {
    req.session.fechaCal = currentDate()
    //gvars.fechaCal = currentDate()
    req.session.aName = req.body.aName
    //gvars.aName = req.body.aName
    res.json({
        "success": "ok"
    })
};

exports.getAudioData = async (req, res) => {
    res.json({
        "fechaCal": convertDateFormat(req.session.fechaCal),//gvars.fechaCal),
        "aName": req.session.aName
        //"aName": gvars.aName
    });
};

exports.getCurrentDate = async (req, res) => {
    res.json({
        "currentDate": convertDateFormat(currentDate()),
    });
};

exports.getDate = async (req, res) => {
    res.json({
        "date": currentDate(),
    });
};


exports.setDataToExport = async (req, res) => {
    req.session.dataToExport.push(req.body);
    //gvars.dataToExport.push(req.body);
    res.json({
        "success": "ok"
    });
};

exports.getDataToExport = async (req, res) => {
    res.json({
        "dataToExport": req.session.dataToExport,//gvars.dataToExport,
    });
};

exports.getDataToExportExcel = async (req, res) => {

    const template = {
        "Auditor": "",
        "Grupo": "",
        "Motivo": "",
        "Asesor": "",
        "Tipo_de_Campana": "",
        "Fecha_Audio": "",
        "Nombre_Audio": "",
        "Duracion": "",
        "Transcripcion": "",
        "Saludo_institucional": "",
        "Simpatia_empatia": "",
        "Res_Pres_Empatica": "",
        "ResFinal_Pres_Empatica": "",
        "Saludo_institucional_comentario": "",
        "Simpatia_empatia_comentario": "",
        "Precalificacion": "",
        "Preguntas_subjetivas": "",
        "Res_Calificacion": "",
        "ResFinal_Calificacion": "",
        "Precalificacion_comentario": "",
        "Preguntas_subjetivas_comentario": "",
        "Etiqueta_Enfermedad": "",
        "Enfocarse_enfermedad": "",
        "Tono_voz": "",
        "Conocimiento_patologia": "",
        "Dato_duro": "",
        "Res_PanOscuro": "",
        "ResFinal_PanOscuro": "",
        "Etiqueta_Enfermedad_comentario": "",
        "Enfocarse_enfermedad_comentario": "",
        "Tono_voz_comentario": "",
        "Conocimiento_patologia_comentario": "",
        "Dato_duro_comentario": "",
        "Testimonio": "",
        "Res_Testimonio": "",
        "ResFinal_Testimonio": "",
        "Testimonio_comentario": "",
        "Solucion_beneficios": "",
        "Res_SolBeneficios": "",
        "ResFinal_SolBeneficios": "",
        "Solucion_beneficios_comentario": "",
        "Respaldo": "",
        "Res_Respaldo": "",
        "ResFinal_Respaldo": "",
        "Respaldo_comentario": "",
        "Cierre_venta": "",
        "Res_CierreVenta": "",
        "ResFinal_CierreVenta": "",
        "Cierre_venta_comentario": "",
        "Comunicacion_efectiva": "",
        "Comunicacion_efectiva_comentario": "",
        "Concimiento_tratamiento": "",
        "Concimiento_tratamiento_comentario": "",
        "Rebate_objeciones": "",
        "Rebate_objeciones_comentario": "",
        "Resumen": "",
        "Etapas_Venta": "",
        "Habil_comerciales": "",
        "Resultado_Calibracion": ""
    };

    const data = {
        "dataToExport": req.session.dataToExport,//gvars.dataToExport,
    };

    data.dataToExport = data.dataToExport.map(item => {
        return { ...template, ...item };
    });

    res.json(data);
};

exports.getGeneralReportData = async (req, res) => {   
    const data = req.body.dataToExport;
    let resultados_nuevo = [];

    if (gvars.selectedProcesses.includes("1")) {
        const Saludo_institucional_prom = calcularPromedio(data, "Saludo_institucional");
        const Simpatia_empatia_prom = calcularPromedio(data, "Simpatia_empatia");

        resultados_nuevo.push(
            {"valor":Saludo_institucional_prom, "comentario":"", "sub_proceso":"saludo_institucional"},
            {"valor":Simpatia_empatia_prom, "comentario":"", "sub_proceso":"simpatia_empatia"}
        );
    }
    
    if (gvars.selectedProcesses.includes("2")) {
        const Precalificacion_prom= calcularPromedio(data, "Precalificacion");
        const Preguntas_subjetivas_prom= calcularPromedio(data, "Preguntas_subjetivas");

        resultados_nuevo.push(
            {"valor":Precalificacion_prom, "comentario":"", "sub_proceso":"precalificacion"},
            {"valor":Preguntas_subjetivas_prom, "comentario":"", "sub_proceso":"preguntas_subjetivas"}
        );
    }

    if (gvars.selectedProcesses.includes("3")) {
        const Etiqueta_Enfermedad_prom= calcularPromedio(data, "Etiqueta_Enfermedad");
        const Enfocarse_enfermedad_prom= calcularPromedio(data, "Enfocarse_enfermedad");
        const Tono_voz_prom= calcularPromedio(data, "Tono_voz");
        const Conocimiento_patologia_prom= calcularPromedio(data, "Conocimiento_patologia");
        const Dato_duro_prom= calcularPromedio(data, "Dato_duro");

        resultados_nuevo.push(
            {"valor":Etiqueta_Enfermedad_prom, "comentario":"", "sub_proceso":"etiqueta_enfermedad"},
            {"valor":Enfocarse_enfermedad_prom, "comentario":"", "sub_proceso":"enfocarse_enfermedad"},
            {"valor":Tono_voz_prom, "comentario":"", "sub_proceso":"tono_voz"},
            {"valor":Conocimiento_patologia_prom, "comentario":"", "sub_proceso":"conocimiento_patologia"},
            {"valor":Dato_duro_prom, "comentario":"", "sub_proceso":"dato_duro"}
        );
    }

    if (gvars.selectedProcesses.includes("4")) {
        const Testimonio_prom= calcularPromedio(data, "Testimonio");

        resultados_nuevo.push(
            {"valor":Testimonio_prom, "comentario":"", "sub_proceso":"testimonio"}
        );
    }

    if (gvars.selectedProcesses.includes("5")) {
        const Solucion_beneficios_prom= calcularPromedio(data, "Solucion_beneficios");

        resultados_nuevo.push(
            {"valor":Solucion_beneficios_prom, "comentario":"", "sub_proceso":"solucion_beneficios"}
        );
    }

    if (gvars.selectedProcesses.includes("6")) {
        const Respaldo_prom= calcularPromedio(data, "Respaldo");

        resultados_nuevo.push(
            {"valor":Respaldo_prom, "comentario":"", "sub_proceso":"respaldo"}
        );
    }

    if (gvars.selectedProcesses.includes("7")) {
        const Cierre_venta_prom= calcularPromedio(data, "Cierre_venta");

        resultados_nuevo.push(
            {"valor":Cierre_venta_prom, "comentario":"", "sub_proceso":"cierre_venta"}
        );
    }

    if (gvars.selectedProcesses.includes("8")) {
        const Comunicacion_efectiva_prom= calcularPromedio(data, "Comunicacion_efectiva");

        resultados_nuevo.push(
            {"valor":Comunicacion_efectiva_prom, "comentario":"", "sub_proceso":"comunicacion_efectiva"}
        );
    }

    if (gvars.selectedProcesses.includes("9")) {
        const Concimiento_tratamiento_prom= calcularPromedio(data, "Concimiento_tratamiento");

        resultados_nuevo.push(
            {"valor":Concimiento_tratamiento_prom, "comentario":"", "sub_proceso":"conocimiento_tratamiento"}
        );
    }

    if (gvars.selectedProcesses.includes("10")) {
        const Rebate_objeciones_prom= calcularPromedio(data, "Rebate_objeciones");

        resultados_nuevo.push(
            {"valor":Rebate_objeciones_prom, "comentario":"", "sub_proceso":"rebate_objeciones"}
        );
    }

    /*
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
      {"valor":Saludo_institucional_prom, "comentario":"", "sub_proceso":"saludo_institucional"},
      {"valor":Simpatia_empatia_prom, "comentario":"", "sub_proceso":"simpatia_empatia"},
      {"valor":Precalificacion_prom, "comentario":"", "sub_proceso":"precalificacion"},
      {"valor":Preguntas_subjetivas_prom, "comentario":"", "sub_proceso":"preguntas_subjetivas"},
      {"valor":Etiqueta_Enfermedad_prom, "comentario":"", "sub_proceso":"etiqueta_enfermedad"},
      {"valor":Enfocarse_enfermedad_prom, "comentario":"", "sub_proceso":"enfocarse_enfermedad"},
      {"valor":Tono_voz_prom, "comentario":"", "sub_proceso":"tono_voz"},
      {"valor":Conocimiento_patologia_prom, "comentario":"", "sub_proceso":"conocimiento_patologia"},
      {"valor":Dato_duro_prom, "comentario":"", "sub_proceso":"dato_duro"},
      {"valor":Testimonio_prom, "comentario":"", "sub_proceso":"testimonio"},
      {"valor":Solucion_beneficios_prom, "comentario":"", "sub_proceso":"solucion_beneficios"},
      {"valor":Respaldo_prom, "comentario":"", "sub_proceso":"respaldo"},
      {"valor":Cierre_venta_prom, "comentario":"", "sub_proceso":"cierre_venta"},
      {"valor":Comunicacion_efectiva_prom, "comentario":"", "sub_proceso":"comunicacion_efectiva"},
      {"valor":Concimiento_tratamiento_prom, "comentario":"", "sub_proceso":"conocimiento_tratamiento"},
      {"valor":Rebate_objeciones_prom, "comentario":"", "sub_proceso":"rebate_objeciones"}
    ];
    */
    res.json({"resultados_nuevo": resultados_nuevo});
};

function getValor(resultados, sub_proceso){
    const item = resultados.find(obj => obj.sub_proceso === sub_proceso);
    const result = item ? item.valor : null;
    return result;
}

exports.getRowsData = async (req, res) => {
    
    const response = req.body;

    req.session.fechaCal = currentDate();
    //gvars.fechaCal = currentDate();
    req.session.aName = response.Nombre_Audio;
    //gvars.aName = response.Nombre_Audio;

    const rowsData = [        
        {fontSize: gvars.fontH, header: true, cells: [{text: "Acta Calibracion Cariola", colSpan: 10, centered: true, colour3: true}]},
        {cells: [{text: " ", colSpan: 9},{text: response.Duracion, bold: true, centered: true}]},
  
        {fontSize: gvars.font, cells: [{text: " ", colSpan: 9},{text: "Resultado Calibración", centered: true, colour: true, bold: true, width: true}]},
        {fontSize: gvars.font, cells: [{text: "Auditor:", colour2: true, bold: true}, {text: response.Auditor, colSpan: 8},{text: response.Resultado_Calibracion, centered: true, colour: true, bold: true, width: true}]},
  
        {fontSize: gvars.font, cells: [{text: "Fecha de Calibración:", colour2: true, bold: true}, {text: req.session.fechaCal, colSpan: 9}]},//gvars.fechaCal, colSpan: 9}]},
  
        {fontSize: gvars.font, cells: [{text: " ", colSpan: 8},{text: "Etapas de la Venta", colour2: true, bold: true, width: true},{text: response.Etapas_Venta, centered: true, width: true}]},
        {fontSize: gvars.font, cells: [{text: "Grupo:", colour2: true, bold: true}, {text: response.Grupo, colSpan: 7},{text: "Habilidades Comerciales", colour2: true, bold: true},{text: response.Habil_comerciales, centered: true}]},
  
        {fontSize: gvars.font, cells: [{text: "Motivo Auditoría:", colour2: true, bold: true}, {text: response.Motivo, colSpan: 9}]},
        {fontSize: gvars.font, cells: [{text: "Nombre Asesor:", colour2: true, bold: true}, {text: response.Asesor, colSpan: 7},{text: "Lead", colour2: true, bold: true},{text: " ", centered: true}]},
        {fontSize: gvars.font, cells: [{text: "Tipo de Campaña:", colour2: true, bold: true}, {text: response.Tipo_de_Campana, colSpan: 7},{text: "Fecha", colour2: true, bold: true},{text: " ", centered: true}]},
        {fontSize: gvars.font, cells: [{text: "Supervisor:", colour2: true, bold: true}, {text: " ", colSpan:9}]},
  
        {cells: [{text: " ", colSpan: 10}]},
  
        {header: true, cells: ["Pesos", "Item", "Detalle", {text: "Puntuación", colSpan: 2, centered: true}, {text: "Comentario", colSpan: 5, centered: true}]}
    ];

    if (gvars.selectedProcesses.includes("1")) {
        rowsData.push(
            {fontSize: gvars.fontC, rowSpan: 3, cells: [{ text: gvars.peso1+"%", centered: true }, "1. PRESENTACIÓN EMPÁTICA", "SALUDO INSTITUCIONAL", {text: response.Saludo_institucional, colSpan: 2, centered: true},{text: response.Saludo_institucional_comentario, colSpan: 5}]},
            {fontSize: gvars.fontC, cells: ["SIMPATÍA / EMPATÍA", {text: response.Simpatia_empatia, colSpan: 2, centered: true},{text: response.Simpatia_empatia_comentario, colSpan: 5}]},
            {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: response.ResFinal_Pres_Empatica, colSpan: 2, centered: true},{text: " ", colSpan: 7}]}
        );
    };
    if(gvars.selectedProcesses.includes("2")) {
        rowsData.push(
            {fontSize: gvars.fontC, rowSpan: 3, cells: [{ text: gvars.peso2+"%", centered: true }, "2. CALIFICACION", "PRECALIFICACION", {text: response.Precalificacion, colSpan: 2, centered: true},{text: response.Precalificacion_comentario, colSpan: 5}]},
            {fontSize: gvars.fontC, cells: ["PREGUNTAS SUBJETIVAS", {text: response.Preguntas_subjetivas, colSpan: 2, centered: true},{text: response.Preguntas_subjetivas_comentario, colSpan: 5}]},
            {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: response.ResFinal_Calificacion, colSpan: 2, centered: true},{text: " ", colSpan: 7}]}
        );
    };
    if(gvars.selectedProcesses.includes("3")) {
        rowsData.push(
            {fontSize: gvars.fontC, rowSpan:6, cells: [{ text: gvars.peso3+"%", centered: true }, "3. PANORAMA OSCURO", "EL VENDEDOR ETIQUETA CON UNA ENFERMEDAD AL CLIENTE Y EXPLICA LA GRAVEDAD QUE PUEDE EMPEORAR DE FORMA PERSONALIZADA", {text: response.Etiqueta_Enfermedad, colSpan: 2, centered: true},{text: response.Etiqueta_Enfermedad_comentario, colSpan: 5}]},
            {fontSize: gvars.fontC, cells: ["ENFOCARSE EN LA ENFERMEDAD IDENTIFICADA EN LA CALIFICACIÓN", {text: response.Enfocarse_enfermedad, colSpan: 2, centered: true},{text: response.Enfocarse_enfermedad_comentario, colSpan: 5}]},
            {fontSize: gvars.fontC, cells: ["TONO DE VOZ (PREOCUPA AL CLIENTE / PACIENTE)", {text: response.Tono_voz, colSpan: 2, centered: true},{text: response.Tono_voz_comentario, colSpan: 5}]},
            {fontSize: gvars.fontC, cells: ["CONOCIMIENTO DE LA PATOLOGÍA", {text: response.Conocimiento_patologia, colSpan: 2, centered: true},{text: response.Conocimiento_patologia_comentario, colSpan: 5}]},
            {fontSize: gvars.fontC, cells: ["DATO DURO", {text: response.Dato_duro, colSpan: 2, centered: true},{text: response.Dato_duro_comentario, colSpan: 5}]},
            {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: response.ResFinal_PanOscuro, colSpan: 2, centered: true},{text: " ", colSpan: 7}]},
        );
    };
    if(gvars.selectedProcesses.includes("4")) {
        rowsData.push(
            {fontSize: gvars.fontC, rowSpan:2, cells: [{ text: gvars.peso4+"%", centered: true }, "4. TESTIMONIO", "SE MENCIONA ALGUNA REFERENCIA QUE HAYA TOMADO EL TRATAMIENTO Y LE HAYA FUNCIONADO", {text: response.Testimonio, colSpan: 2, centered: true},{text: response.Testimonio_comentario, colSpan: 5}]},
            {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: response.ResFinal_Testimonio, colSpan: 2, centered: true},{text: " ", colSpan: 7}]},
        );
    };
    if(gvars.selectedProcesses.includes("5")) {
        rowsData.push(
            {fontSize: gvars.fontC, rowSpan:2, cells: [{ text: gvars.peso5+"%", centered: true }, "5. SOLUCIÓN / BENEFICIOS", "SE REALIZA UN MATCH ENTRE LA CALIFICACIÓN Y LOS BENEFICIOS DEL TRATAMIENTO", {text: response.Solucion_beneficios, colSpan: 2, centered: true},{text: response.Solucion_beneficios_comentario, colSpan: 5}]},
            {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: response.ResFinal_SolBeneficios, colSpan: 2, centered: true},{text: " ", colSpan: 7}]},    
        );
    };
    if(gvars.selectedProcesses.includes("6")) {
        rowsData.push( 
            {fontSize: gvars.fontC, rowSpan:2, cells: [{ text: gvars.peso6+"%", centered: true }, "6. RESPALDO", "SE UTILIZA LA MATRIZ DE VALOR (TRAYECTORIA, CALIDAD, PROFESIONALISMO Y SERVICIO)", {text: response.Respaldo, colSpan: 2, centered: true},{text: response.Respaldo_comentario, colSpan: 5}]},
            {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: response.ResFinal_Respaldo, colSpan: 2, centered: true},{text: " ", colSpan: 7}]},
     );
    };
    if(gvars.selectedProcesses.includes("7")) {
        rowsData.push(
            {fontSize: gvars.fontC, rowSpan:2, cells: [{ text: gvars.peso7+"%", centered: true }, "7. CIERRE DE VENTA", "TOMA EL MOMENTO ADECUADO PARA ORDENAR LA FORMA DE PAGO", {text: response.Cierre_venta, colSpan: 2, centered: true},{text: response.Cierre_venta_comentario, colSpan: 5}]},
            {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: response.ResFinal_CierreVenta, colSpan: 2, centered: true},{text: " ", colSpan: 7}]},
        );
    };

    rowsData.push(
        {cells: [{text: " ", colSpan: 10}]},
    );

    if(gvars.selectedProcesses.includes("8")) {
        rowsData.push(
            {fontSize: gvars.fontC, cells: ["", {text: "COMUNICACION EFECTIVA", colour: true, bold: false}, {text: "Puntuación:", bold: true, colour2: true},{text: response.Comunicacion_efectiva, colSpan: 2, centered: true},{text: response.Comunicacion_efectiva_comentario, colSpan: 5}]},            
        );
    };
    if(gvars.selectedProcesses.includes("9")) {
        rowsData.push(
            {fontSize: gvars.fontC, cells: ["", {text: "CONOCIMIENTO DEL TRATAMIENTO", colour: true, bold: false}, {text: "Puntuación:", bold: true, colour2: true},{text: response.Concimiento_tratamiento, colSpan: 2, centered: true},{text: response.Concimiento_tratamiento_comentario, colSpan: 5}]},

        );
    };
    if(gvars.selectedProcesses.includes("10")) {
        rowsData.push(
            {fontSize: gvars.fontC, cells: ["", {text: "REBATE DE POSIBLES OBJECIONES", colour: true, bold: false}, {text: "Puntuación:", bold: true, colour2: true},{text: response.Rebate_objeciones, colSpan: 2, centered: true},{text: response.Rebate_objeciones_comentario, colSpan: 5}]},        
        );
    };

    rowsData.push(
        {cells: [{text: " ", colSpan: 10}]},
    );

    /*
    const rowsData = [        
        {fontSize: gvars.fontH, header: true, cells: [{text: "Acta Calibracion Cariola", colSpan: 10, centered: true, colour3: true}]},
        {cells: [{text: " ", colSpan: 9},{text: response.Duracion, bold: true, centered: true}]},
  
        {fontSize: gvars.font, cells: [{text: " ", colSpan: 9},{text: "Resultado Calibración", centered: true, colour: true, bold: true, width: true}]},
        {fontSize: gvars.font, cells: [{text: "Auditor:", colour2: true, bold: true}, {text: response.Auditor, colSpan: 8},{text: response.Resultado_Calibracion, centered: true, colour: true, bold: true, width: true}]},
  
        {fontSize: gvars.font, cells: [{text: "Fecha de Calibración:", colour2: true, bold: true}, {text: gvars.fechaCal, colSpan: 9}]},
  
        {fontSize: gvars.font, cells: [{text: " ", colSpan: 8},{text: "Etapas de la Venta", colour2: true, bold: true, width: true},{text: response.Etapas_Venta, centered: true, width: true}]},
        {fontSize: gvars.font, cells: [{text: "Grupo:", colour2: true, bold: true}, {text: response.Grupo, colSpan: 7},{text: "Habilidades Comerciales", colour2: true, bold: true},{text: response.Habil_comerciales, centered: true}]},
  
        {fontSize: gvars.font, cells: [{text: "Motivo Auditoría:", colour2: true, bold: true}, {text: response.Motivo, colSpan: 9}]},
        {fontSize: gvars.font, cells: [{text: "Nombre Asesor:", colour2: true, bold: true}, {text: response.Asesor, colSpan: 7},{text: "Lead", colour2: true, bold: true},{text: " ", centered: true}]},
        {fontSize: gvars.font, cells: [{text: "Tipo de Campaña:", colour2: true, bold: true}, {text: response.Tipo_de_Campana, colSpan: 7},{text: "Fecha", colour2: true, bold: true},{text: " ", centered: true}]},
        {fontSize: gvars.font, cells: [{text: "Supervisor:", colour2: true, bold: true}, {text: " ", colSpan:9}]},
  
        {cells: [{text: " ", colSpan: 10}]},
  
        {header: true, cells: ["Pesos", "Item", "Detalle", {text: "Puntuación", colSpan: 2, centered: true}, {text: "Comentario", colSpan: 5, centered: true}]},
        {fontSize: gvars.fontC, rowSpan: 3, cells: [{ text: gvars.peso1, centered: true }, "1. PRESENTACIÓN EMPÁTICA", "SALUDO INSTITUCIONAL", {text: response.Saludo_institucional, colSpan: 2, centered: true},{text: response.Saludo_institucional_comentario, colSpan: 5}]},
        {fontSize: gvars.fontC, cells: ["SIMPATÍA / EMPATÍA", {text: response.Simpatia_empatia, colSpan: 2, centered: true},{text: response.Simpatia_empatia_comentario, colSpan: 5}]},
        {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: response.Res_Pres_Empatica, colSpan: 2, centered: true},{text: " ", colSpan: 7}]},
        
        {fontSize: gvars.fontC, rowSpan: 3, cells: [{ text: gvars.peso2, centered: true }, "2. CALIFICACION", "PRECALIFICACION", {text: response.Precalificacion, colSpan: 2, centered: true},{text: response.Precalificacion_comentario, colSpan: 5}]},
        {fontSize: gvars.fontC, cells: ["PREGUNTAS SUBJETIVAS", {text: response.Preguntas_subjetivas, colSpan: 2, centered: true},{text: response.Preguntas_subjetivas_comentario, colSpan: 5}]},
        {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: response.Res_Calificacion, colSpan: 2, centered: true},{text: " ", colSpan: 7}]},
        
        {fontSize: gvars.fontC, rowSpan:6, cells: [{ text: gvars.peso3, centered: true }, "3. PANORAMA OSCURO", "EL VENDEDOR ETIQUETA CON UNA ENFERMEDAD AL CLIENTE Y EXPLICA LA GRAVEDAD QUE PUEDE EMPEORAR DE FORMA PERSONALIZADA", {text: response.Etiqueta_Enfermedad, colSpan: 2, centered: true},{text: response.Etiqueta_Enfermedad_comentario, colSpan: 5}]},
        {fontSize: gvars.fontC, cells: ["ENFOCARSE EN LA ENFERMEDAD IDENTIFICADA EN LA CALIFICACIÓN", {text: response.Enfocarse_enfermedad, colSpan: 2, centered: true},{text: response.Enfocarse_enfermedad_comentario, colSpan: 5}]},
        {fontSize: gvars.fontC, cells: ["TONO DE VOZ (PREOCUPA AL CLIENTE / PACIENTE)", {text: response.Tono_voz, colSpan: 2, centered: true},{text: response.Tono_voz_comentario, colSpan: 5}]},
        {fontSize: gvars.fontC, cells: ["CONOCIMIENTO DE LA PATOLOGÍA", {text: response.Conocimiento_patologia, colSpan: 2, centered: true},{text: response.Conocimiento_patologia_comentario, colSpan: 5}]},
        {fontSize: gvars.fontC, cells: ["DATO DURO", {text: response.Dato_duro, colSpan: 2, centered: true},{text: response.Dato_duro_comentario, colSpan: 5}]},
        {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: response.Res_PanOscuro, colSpan: 2, centered: true},{text: " ", colSpan: 7}]},
  
        {fontSize: gvars.fontC, rowSpan:2, cells: [{ text: gvars.peso4, centered: true }, "4. TESTIMONIO", "SE MENCIONA ALGUNA REFERENCIA QUE HAYA TOMADO EL TRATAMIENTO Y LE HAYA FUNCIONADO", {text: response.Testimonio, colSpan: 2, centered: true},{text: response.Testimonio_comentario, colSpan: 5}]},
        {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: response.Res_Testimonio, colSpan: 2, centered: true},{text: " ", colSpan: 7}]},
  
        {fontSize: gvars.fontC, rowSpan:2, cells: [{ text: gvars.peso5, centered: true }, "5. SOLUCIÓN / BENEFICIOS", "SE REALIZA UN MATCH ENTRE LA CALIFICACIÓN Y LOS BENEFICIOS DEL TRATAMIENTO", {text: response.Solucion_beneficios, colSpan: 2, centered: true},{text: response.Solucion_beneficios_comentario, colSpan: 5}]},
        {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: response.Res_SolBeneficios, colSpan: 2, centered: true},{text: " ", colSpan: 7}]},
  
        {fontSize: gvars.fontC, rowSpan:2, cells: [{ text: gvars.peso6, centered: true }, "6. RESPALDO", "SE UTILIZA LA MATRIZ DE VALOR (TRAYECTORIA, CALIDAD, PROFESIONALISMO Y SERVICIO)", {text: response.Respaldo, colSpan: 2, centered: true},{text: response.Respaldo_comentario, colSpan: 5}]},
        {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: response.Res_Respaldo, colSpan: 2, centered: true},{text: " ", colSpan: 7}]},
  
        {fontSize: gvars.fontC, rowSpan:2, cells: [{ text: gvars.peso7, centered: true }, "7. CIERRE DE VENTA", "TOMA EL MOMENTO ADECUADO PARA ORDENAR LA FORMA DE PAGO", {text: response.Cierre_venta, colSpan: 2, centered: true},{text: response.Cierre_venta_comentario, colSpan: 5}]},
        {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: response.Res_CierreVenta, colSpan: 2, centered: true},{text: " ", colSpan: 7}]},
  
        {cells: [{text: " ", colSpan: 10}]},
  
        {fontSize: gvars.fontC, cells: ["", {text: "COMUNICACION EFECTIVA", colour: true, bold: false}, {text: "Puntuación:", bold: true, colour2: true},{text: response.Comunicacion_efectiva, colSpan: 2, centered: true},{text: response.Comunicacion_efectiva_comentario, colSpan: 5}]},
        {fontSize: gvars.fontC, cells: ["", {text: "CONOCIMIENTO DEL TRATAMIENTO", colour: true, bold: false}, {text: "Puntuación:", bold: true, colour2: true},{text: response.Concimiento_tratamiento, colSpan: 2, centered: true},{text: response.Concimiento_tratamiento_comentario, colSpan: 5}]},
        {fontSize: gvars.fontC, cells: ["", {text: "REBATE DE POSIBLES OBJECIONES", colour: true, bold: false}, {text: "Puntuación:", bold: true, colour2: true},{text: response.Rebate_objeciones, colSpan: 2, centered: true},{text: response.Rebate_objeciones_comentario, colSpan: 5}]},
  
        {cells: [{text: " ", colSpan: 10}]},
    ];
*/

    res.json({
        "rows_data": rowsData
    });
}

exports.getGeneralReportRows = async (req, res) => {

    resultados = req.body.resultados_nuevo;
    data = req.body.data.dataToExport;

    req.session.fechaCal = currentDate();
    //gvars.fechaCal = currentDate();
    req.session.aName = data[0].Nombre_Audio;
    //gvars.aName = data[0].Nombre_Audio;

    const [auditor, fechaCalibracion, grupo, motivoAuditoria, nombreAsesor, tipoCampana] = [data[0].Auditor, req.session.fechaCal, data[0].Grupo, data[0].Motivo, data[0].Asesor, data[0].Tipo_de_Campana];//gvars.fechaCal, data[0].Grupo, data[0].Motivo, data[0].Asesor, data[0].Tipo_de_Campana];
    const [saludo, simpatiaEmpatia] = [getValor(resultados, "saludo_institucional"), getValor(resultados, "simpatia_empatia")];
    const [percalificacion, preguntasSubjetivas] = [getValor(resultados, "precalificacion"), getValor(resultados, "preguntas_subjetivas")];
    const [etiqueta, enfoque, tono, conocimiento, datoDuro] = [getValor(resultados, "etiqueta_enfermedad"), getValor(resultados, "enfocarse_enfermedad"), getValor(resultados, "tono_voz"), getValor(resultados, "conocimiento_patologia"), getValor(resultados, "dato_duro")];
    const [referencia] = [getValor(resultados, "testimonio")]; 
    const [match] = [getValor(resultados, "solucion_beneficios")];
    const [matriz] = [getValor(resultados, "respaldo")];
    const [momento] = [getValor(resultados, "cierre_venta")];
    const [puntComEfec] = [getValor(resultados, "comunicacion_efectiva")];
    const [puntConTrat] = [getValor(resultados, "conocimiento_tratamiento")];
    const [puntRebObj] = [getValor(resultados, "rebate_objeciones")];
    //const [comentario_saludo, comentario_empatia, comentario_prec, comentario_pregSub, comentario_etiqEnf, comentario_enfocEnf, comentario_tonoVoz, comentario_conPat, comentario_datoDuro, comentario_test, comentario_solBenef, comentario_resp, comentario_cierreVenta, comentario_comEfectiva, comentario_conocTratamiento, comentario_rebObjeciones] = 
    //[resultados[0].comentario, resultados[1].comentario, resultados[2].comentario, resultados[3].comentario, resultados[4].comentario, resultados[5].comentario, resultados[6].comentario, resultados[7].comentario, resultados[8].comentario, resultados[9].comentario, 
    //resultados[10].comentario, resultados[11].comentario, resultados[12].comentario, resultados[13].comentario, resultados[14].comentario, resultados[15].comentario];

    const result1 = puntuacion(saludo,simpatiaEmpatia);
    const result2 = puntuacion(percalificacion,preguntasSubjetivas);
    const result3 = puntuacion(etiqueta, enfoque, tono, conocimiento, datoDuro);
    const result4 = puntuacion(referencia);
    const result5 = puntuacion(match);
    const result6 = puntuacion(matriz);
    const result7 = puntuacion(momento);

    const etapasVenta = ((gvars.peso1/100 * result1) + (gvars.peso2/100*result2) + (gvars.peso3/100*result3) + (gvars.peso4/100*result4) + (gvars.peso5/100*result5) + (gvars.peso6/100*result6) + (gvars.peso7/100*result7)).toFixed(2);
    const habComerciales = (puntuacion(puntComEfec, puntConTrat, puntRebObj)).toFixed(2);

    const resCal = promedioSimple([etapasVenta,habComerciales]); 

    let rowsData = [
        {fontSize: gvars.fontH, header: true, cells: [{text: "Acta Calibración Cariola", colSpan: 5, centered: true, colour3: true}]},
        {cells: [{text: " ", colSpan: 5}]},
  
        {fontSize: gvars.font, cells: [{text: " ", colSpan: 4},{text: "Resultado Calibración", centered: true, colour: true, bold: true}]},
        {fontSize: gvars.font, cells: [{text: "Auditor:", colour2: true, bold: true}, {text: auditor, colSpan: 3},{text: resCal+"%", centered: true, colour: true, bold: true}]},
  
        {fontSize: gvars.font, cells: [{text: "Fecha de Calibración:", colour2: true, bold: true}, {text: fechaCalibracion, colSpan: 4}]},
  
        {fontSize: gvars.font, cells: [{text: " ", colSpan: 3},{text: "Etapas de la Venta", colour2: true, bold: true},{text: etapasVenta+"%", centered: true}]},
        {fontSize: gvars.font, cells: [{text: "Grupo:", colour2: true, bold: true}, {text: grupo, colSpan: 2},{text: "Habilidades Comerciales", colour2: true, bold: true},{text: habComerciales+"%", centered: true}]},
  
        {fontSize: gvars.font, cells: [{text: "Motivo Auditoría:", colour2: true, bold: true}, {text: motivoAuditoria, colSpan: 4}]},
        {fontSize: gvars.font, cells: [{text: "Nombre Asesor:", colour2: true, bold: true}, {text: nombreAsesor, colSpan: 4}]},
        {fontSize: gvars.font, cells: [{text: "Tipo de Campaña:", colour2: true, bold: true}, {text: tipoCampana, colSpan: 4}]},
        
        {cells: [{text: " ", colSpan: 5}]},
  
        {header: true, cells: ["Pesos", "Item", "Detalle", {text: "Puntuación", colSpan: 2, centered: true}]}
    ]

    if (gvars.selectedProcesses.includes("1")) {
        rowsData.push(
            {fontSize: gvars.fontC, rowSpan: 3, cells: [{ text: gvars.peso1+"%", centered: true }, "1. PRESENTACIÓN EMPÁTICA", "SALUDO INSTITUCIONAL", {text: saludo, colSpan: 2, centered: true}]},
            {fontSize: gvars.fontC, cells: ["SIMPATÍA / EMPATÍA", {text: simpatiaEmpatia, colSpan: 2, centered: true}]},
            {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result1+"%", colSpan: 2, centered: true}]},
        );
    }

    if (gvars.selectedProcesses.includes("2")) {
        rowsData.push(
            {fontSize: gvars.fontC, rowSpan: 3, cells: [{ text: gvars.peso2+"%", centered: true }, "2. CALIFICACION", "PRECALIFICACION", {text: percalificacion, colSpan: 2, centered: true}]},
            {fontSize: gvars.fontC, cells: ["PREGUNTAS SUBJETIVAS", {text: preguntasSubjetivas, colSpan: 2, centered: true}]},
            {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result2+"%", colSpan: 2, centered: true}]},
        );
    }

    if (gvars.selectedProcesses.includes("3")) {
        rowsData.push(
            {fontSize: gvars.fontC, rowSpan:6, cells: [{ text: gvars.peso3+"%", centered: true }, "3. PANORAMA OSCURO", "EL VENDEDOR ETIQUETA CON UNA ENFERMEDAD AL CLIENTE Y EXPLICA LA GRAVEDAD QUE PUEDE EMPEORAR DE FORMA PERSONALIZADA", {text: etiqueta, colSpan: 2, centered: true}]},
            {fontSize: gvars.fontC, cells: ["ENFOCARSE EN LA ENFERMEDAD IDENTIFICADA EN LA CALIFICACIÓN", {text: enfoque, colSpan: 2, centered: true}]},
            {fontSize: gvars.fontC, cells: ["TONO DE VOZ (PREOCUPA AL CLIENTE / PACIENTE)", {text: tono, colSpan: 2, centered: true}]},
            {fontSize: gvars.fontC, cells: ["CONOCIMIENTO DE LA PATOLOGÍA", {text: conocimiento, colSpan: 2, centered: true}]},
            {fontSize: gvars.fontC, cells: ["DATO DURO", {text: datoDuro, colSpan: 2, centered: true}]},
            {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result3+"%", colSpan: 2, centered: true}]},
        );
    }

    if (gvars.selectedProcesses.includes("4")) {
        rowsData.push(
            {fontSize: gvars.fontC, rowSpan:2, cells: [{ text: gvars.peso4+"%", centered: true }, "4. TESTIMONIO", "SE MENCIONA ALGUNA REFERENCIA QUE HAYA TOMADO EL TRATAMIENTO Y LE HAYA FUNCIONADO", {text: referencia, colSpan: 2, centered: true}]},
            {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result4+"%", colSpan: 2, centered: true}]},
        );
    }

    if (gvars.selectedProcesses.includes("5")) {
        rowsData.push(
            {fontSize: gvars.fontC, rowSpan:2, cells: [{ text: gvars.peso5+"%", centered: true }, "5. SOLUCIÓN / BENEFICIOS", "SE REALIZA UN MATCH ENTRE LA CALIFICACIÓN Y LOS BENEFICIOS DEL TRATAMIENTO", {text: match, colSpan: 2, centered: true}]},
            {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result5+"%", colSpan: 2, centered: true}]},    
        );
    }

    if (gvars.selectedProcesses.includes("6")) {
        rowsData.push( 
            {fontSize: gvars.fontC, rowSpan:2, cells: [{ text: gvars.peso6+"%", centered: true }, "6. RESPALDO", "SE UTILIZA LA MATRIZ DE VALOR (TRAYECTORIA, CALIDAD, PROFESIONALISMO Y SERVICIO)", {text: matriz, colSpan: 2, centered: true}]},
            {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result6+"%", colSpan: 2, centered: true}]},
        );
    }

    if (gvars.selectedProcesses.includes("7")) {
        rowsData.push(
            {fontSize: gvars.fontC, rowSpan:2, cells: [{ text: gvars.peso7+"%", centered: true }, "7. CIERRE DE VENTA", "TOMA EL MOMENTO ADECUADO PARA ORDENAR LA FORMA DE PAGO", {text: momento, colSpan: 2, centered: true}]},
            {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result7+"%", colSpan: 2, centered: true}]},
        );
    }

    if (gvars.selectedProcesses.includes("8")) {
        rowsData.push(
            {fontSize: gvars.fontC, cells: ["", {text: "COMUNICACION EFECTIVA", colour: true, bold: false}, {text: "Puntuación:", bold: true, colour2: true},{text: puntComEfec, colSpan: 2, centered: true}]},            
        );
    }

    if (gvars.selectedProcesses.includes("9")) {
        rowsData.push(
            {fontSize: gvars.fontC, cells: ["", {text: "CONOCIMIENTO DEL TRATAMIENTO", colour: true, bold: false}, {text: "Puntuación:", bold: true, colour2: true},{text: puntConTrat, colSpan: 2, centered: true}]},

        );
    }

    if (gvars.selectedProcesses.includes("10")) {
        rowsData.push(
            {fontSize: gvars.fontC, cells: ["", {text: "REBATE DE POSIBLES OBJECIONES", colour: true, bold: false}, {text: "Puntuación:", bold: true, colour2: true},{text: puntRebObj, colSpan: 2, centered: true}]},        
        );
    }

    rowsData.push({cells: [{text: " ", colSpan: 5}]});

    /*
    const rowsData = [
        {fontSize: gvars.fontH, header: true, cells: [{text: "Acta Calibración Cariola", colSpan: 5, centered: true, colour3: true}]},
        {cells: [{text: " ", colSpan: 5}]},
  
        {fontSize: gvars.font, cells: [{text: " ", colSpan: 4},{text: "Resultado Calibración", centered: true, colour: true, bold: true}]},
        {fontSize: gvars.font, cells: [{text: "Auditor:", colour2: true, bold: true}, {text: auditor, colSpan: 3},{text: resCal+"%", centered: true, colour: true, bold: true}]},
  
        {fontSize: gvars.font, cells: [{text: "Fecha de Calibración:", colour2: true, bold: true}, {text: fechaCalibracion, colSpan: 4}]},
  
        {fontSize: gvars.font, cells: [{text: " ", colSpan: 3},{text: "Etapas de la Venta", colour2: true, bold: true},{text: etapasVenta+"%", centered: true}]},
        {fontSize: gvars.font, cells: [{text: "Grupo:", colour2: true, bold: true}, {text: grupo, colSpan: 2},{text: "Habilidades Comerciales", colour2: true, bold: true},{text: habComerciales+"%", centered: true}]},
  
        {fontSize: gvars.font, cells: [{text: "Motivo Auditoría:", colour2: true, bold: true}, {text: motivoAuditoria, colSpan: 4}]},
        {fontSize: gvars.font, cells: [{text: "Nombre Asesor:", colour2: true, bold: true}, {text: nombreAsesor, colSpan: 4}]},
        {fontSize: gvars.font, cells: [{text: "Tipo de Campaña:", colour2: true, bold: true}, {text: tipoCampana, colSpan: 4}]},
        
        {cells: [{text: " ", colSpan: 5}]},
  
        {header: true, cells: ["Pesos", "Item", "Detalle", {text: "Puntuación", colSpan: 2, centered: true}]},
        {fontSize: gvars.fontC, rowSpan: 3, cells: [{ text: gvars.peso1+"%", centered: true }, "1. PRESENTACIÓN EMPÁTICA", "SALUDO INSTITUCIONAL", {text: saludo, colSpan: 2, centered: true}]},
        {fontSize: gvars.fontC, cells: ["SIMPATÍA / EMPATÍA", {text: simpatiaEmpatia, colSpan: 2, centered: true}]},
        {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result1+"%", colSpan: 2, centered: true}]},
        
        {fontSize: gvars.fontC, rowSpan: 3, cells: [{ text: gvars.peso2+"%", centered: true }, "2. CALIFICACION", "PRECALIFICACION", {text: percalificacion, colSpan: 2, centered: true}]},
        {fontSize: gvars.fontC, cells: ["PREGUNTAS SUBJETIVAS", {text: preguntasSubjetivas, colSpan: 2, centered: true}]},
        {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result2+"%", colSpan: 2, centered: true}]},
        
        {fontSize: gvars.fontC, rowSpan:6, cells: [{ text: gvars.peso3+"%", centered: true }, "3. PANORAMA OSCURO", "EL VENDEDOR ETIQUETA CON UNA ENFERMEDAD AL CLIENTE Y EXPLICA LA GRAVEDAD QUE PUEDE EMPEORAR DE FORMA PERSONALIZADA", {text: etiqueta, colSpan: 2, centered: true}]},
        {fontSize: gvars.fontC, cells: ["ENFOCARSE EN LA ENFERMEDAD IDENTIFICADA EN LA CALIFICACIÓN", {text: enfoque, colSpan: 2, centered: true}]},
        {fontSize: gvars.fontC, cells: ["TONO DE VOZ (PREOCUPA AL CLIENTE / PACIENTE)", {text: tono, colSpan: 2, centered: true}]},
        {fontSize: gvars.fontC, cells: ["CONOCIMIENTO DE LA PATOLOGÍA", {text: conocimiento, colSpan: 2, centered: true}]},
        {fontSize: gvars.fontC, cells: ["DATO DURO", {text: datoDuro, colSpan: 2, centered: true}]},
        {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result3+"%", colSpan: 2, centered: true}]},
  
        {fontSize: gvars.fontC, rowSpan:2, cells: [{ text: gvars.peso4+"%", centered: true }, "4. TESTIMONIO", "SE MENCIONA ALGUNA REFERENCIA QUE HAYA TOMADO EL TRATAMIENTO Y LE HAYA FUNCIONADO", {text: referencia, colSpan: 2, centered: true}]},
        {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result4+"%", colSpan: 2, centered: true}]},
  
        {fontSize: gvars.fontC, rowSpan:2, cells: [{ text: gvars.peso5+"%", centered: true }, "5. SOLUCIÓN / BENEFICIOS", "SE REALIZA UN MATCH ENTRE LA CALIFICACIÓN Y LOS BENEFICIOS DEL TRATAMIENTO", {text: match, colSpan: 2, centered: true}]},
        {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result5+"%", colSpan: 2, centered: true}]},
  
        {fontSize: gvars.fontC, rowSpan:2, cells: [{ text: gvars.peso6+"%", centered: true }, "6. RESPALDO", "SE UTILIZA LA MATRIZ DE VALOR (TRAYECTORIA, CALIDAD, PROFESIONALISMO Y SERVICIO)", {text: matriz, colSpan: 2, centered: true}]},
        {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result6+"%", colSpan: 2, centered: true}]},
  
        {fontSize: gvars.fontC, rowSpan:2, cells: [{ text: gvars.peso7+"%", centered: true }, "7. CIERRE DE VENTA", "TOMA EL MOMENTO ADECUADO PARA ORDENAR LA FORMA DE PAGO", {text: momento, colSpan: 2, centered: true}]},
        {fontSize: gvars.fontC, resultRow: true, cells: [{text: "Resultado", bold: true}, {text: result7+"%", colSpan: 2, centered: true}]},
  
        {cells: [{text: " ", colSpan: 5}]},
  
        {fontSize: gvars.fontC, cells: ["", {text: "COMUNICACION EFECTIVA", colour: true, bold: false}, {text: "Puntuación:", bold: true, colour2: true},{text: puntComEfec, colSpan: 2, centered: true}]},
        {fontSize: gvars.fontC, cells: ["", {text: "CONOCIMIENTO DEL TRATAMIENTO", colour: true, bold: false}, {text: "Puntuación:", bold: true, colour2: true},{text: puntConTrat, colSpan: 2, centered: true}]},
        {fontSize: gvars.fontC, cells: ["", {text: "REBATE DE POSIBLES OBJECIONES", colour: true, bold: false}, {text: "Puntuación:", bold: true, colour2: true},{text: puntRebObj, colSpan: 2, centered: true}]},
  
        {cells: [{text: " ", colSpan: 5}]},
        
    ];
    */

    res.json({
        "rows_data": rowsData
    });
}

exports.getFeedbackReportRows = async (req, res) => {

    ({
        tipoFeedback, 
        asunto, 
        actitudVend, 
        observacionesDetalleText
    } = req.body);

    const rowsData = [
        {cells: [{text: " ", colSpan: 10}]},
        {cells: [{text: "Detalle Feedback:", colSpan: 10, bold: true}]},
        {cells: [{text: " ", colSpan: 10}]},
        {fontSize: gvars.font, cells: [{text: "- Fecha: ", colSpan: 10}]},
        {fontSize: gvars.font, cells: [{text: "- Lead: ", colSpan: 10}]},
        {fontSize: gvars.font, cells: [{text: "- Fecha del Lead: ", colSpan: 10}]},
        {fontSize: gvars.font, cells: [{text: "- Grupo: ", colSpan: 10}]},
        {fontSize: gvars.font, cells: [{text: "- Agentes: ", colSpan: 10}]},
        {fontSize: gvars.font, cells: [{text: "- Lider: ", colSpan: 10}]},
        {fontSize: gvars.font, cells: [{text: "- Tipo de feedback: " + tipoFeedback, colSpan: 10}]},
        {fontSize: gvars.font, cells: [{text: "- Asunto o Motivo de la Auditoría: " + asunto, colSpan: 10}]},
        //{fontSize: gvars.font, cells: [{text: "- Actitud de vendedor: " + actitudVend, colSpan: 10}]},
        {fontSize: gvars.font, cells: [{text: observacionesDetalleText, colSpan: 10, editable: true}]},
        {cells: [{text: " ", colSpan: 10}]},
        {cells: [{text: " ", colSpan: 10}]},
    ];

    res.json({
        "rows_data": rowsData
    });
}

exports.transformarAudio = async (req, res) => {

    const file = req.file;

    if (!file && gvars.env) {
        return res.status(400).json({error: 'No se envió ningún archivo.'});
    }

    const resultado = await audioToText(req.session, file);
    
    if("error" in resultado){
        console.log("Error en transformar audio");
        return res.status(400).json(resultado);
    }

    res.json(resultado);
}

exports.analizarTextos = async (req, res) => {
    
    const resultado = await analizarTextos(req.session,req.body);

    if("error" in resultado){
        console.log("Error en analizar textos");
        res.status(400).json(resultado);
    }
    else{
        res.json(resultado);
    }
};

exports.reportData = async (req, res) => {
    
    const resultados = req.body;

    const [auditor, fechaCalibracion, grupo, motivoAuditoria, vendedor, tipoCampana] = [resultados.Auditor, resultados.Fecha_Audio, resultados.Grupo, resultados.Motivo, resultados.Asesor, resultados.Tipo_de_Campana];
    const [saludo, simpatiaEmpatia] = [resultados.Saludo_institucional, resultados.Simpatia_empatia];
    const [percalificacion, preguntasSubjetivas] = [resultados.Precalificacion, resultados.Preguntas_subjetivas];
    const [etiqueta, enfoque, tono, conocimiento, datoDuro] = [resultados.Etiqueta_Enfermedad, resultados.Enfocarse_enfermedad, resultados.Tono_voz, resultados.Conocimiento_patologia, resultados.Dato_duro];
    const [referencia] = [resultados.Testimonio]; 
    const [match] = [resultados.Solucion_beneficios];
    const [matriz] = [resultados.Respaldo];
    const [momento] = [resultados.Cierre_venta];
    const [puntComEfec] = [resultados.Comunicacion_efectiva];
    const [puntConTrat] = [resultados.Concimiento_tratamiento];
    const [puntRebObj] = [resultados.Rebate_objeciones];
    const [comentario_saludo, comentario_empatia, comentario_prec, comentario_pregSub, comentario_etiqEnf, comentario_enfocEnf, comentario_tonoVoz, comentario_conPat, comentario_datoDuro, comentario_test, comentario_solBenef, comentario_resp, comentario_cierreVenta, comentario_comEfectiva, comentario_conocTratamiento, comentario_rebObjeciones] = 
    [resultados.Saludo_institucional_comentario, resultados.Simpatia_empatia_comentario, resultados.Precalificacion_comentario, resultados.Preguntas_subjetivas_comentario, resultados.Etiqueta_Enfermedad_comentario, resultados.Enfocarse_enfermedad_comentario, resultados.Tono_voz_comentario, resultados.Conocimiento_patologia_comentario, resultados.Dato_duro_comentario, resultados.Testimonio_comentario, 
    resultados.Solucion_beneficios_comentario, resultados.Respaldo_comentario, resultados.Cierre_venta_comentario, resultados.Comunicacion_efectiva_comentario, resultados.Concimiento_tratamiento_comentario, resultados.Rebate_objeciones_comentario];

    //fechaCal = fechaCalibracion;
    //aName = audioFileName;

    const result1 = puntuacion(saludo,simpatiaEmpatia);
    const result2 = puntuacion(percalificacion,preguntasSubjetivas);
    const result3 = puntuacion(etiqueta, enfoque, tono, conocimiento, datoDuro);
    const result4 = puntuacion(referencia);
    const result5 = puntuacion(match);
    const result6 = puntuacion(matriz);
    const result7 = puntuacion(momento);

    console.log("PESO1")
    console.log(gvars.peso1);
    console.log(result1);
    console.log(gvars.peso1/100*result1);
    const etapasVenta = Math.round((gvars.peso1/100 * result1) + (gvars.peso2/100*result2) + (gvars.peso3/100*result3) + 
    (gvars.peso4/100*result4) + (gvars.peso5/100*result5) + (gvars.peso6/100*result6) + (gvars.peso7/100*result7)).toString();
    const habComerciales = Math.round(puntuacion(puntComEfec, puntConTrat, puntRebObj)).toString();

    const resCal = Math.round((etapasVenta+habComerciales)/(2)).toString();

    const resultado = {
    "etapasVenta": etapasVenta,
    "habComerciales": habComerciales,
    "resCal": resCal,
    "result1": result1,
    "result2": result2,
    "result3": result3,
    "result4": result4,
    "result5": result5,
    "result6": result6,
    "result7": result7,
    "peso1": gvars.peso1,
    "peso2": gvars.peso2,
    "peso3": gvars.peso3,
    "peso4": gvars.peso4,
    "peso5": gvars.peso5,
    "peso6": gvars.peso6,
    "peso7": gvars.peso7
    }

    res.json(resultado);
};


exports.getInvoiceData = async (req, res) => {
    res.json(gvars.invoice);
};

exports.setSelectedProcesses = async (req, res) => {
    gvars.selectedProcesses = req.body.processes;
    console.log(typeof req.body.processes);
    if(req.body.processes.length == 0){
        console.log("Ningún proceso fue seleccionado");
        res.status(400).json({"error": "Ningún proceso fue seleccionado"});
    }
    else{
        res.json({"status": "ok"});
    }
};

exports.resetValues = async (req, res) => {
    req.session.dataToExport = [];
    //gvars.dataToExport = [];
    res.json({"status": "ok"});
};

exports.getLogs = async (req, res) => {
    res.json(gvars.logs);
};