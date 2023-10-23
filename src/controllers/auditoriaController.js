const express = require('express');
const path = require('path');
require('dotenv').config();
const app = express();
const gvars = require('../utils/const.js');
const { analizarTextos, puntuacion, currentDate, convertDateFormat, calcularPromedio, getColumnLetter, transformDateFormat, audioToText } = require('../utils/functions.js');

const http = require('http');
const socketIo = require('socket.io');
const { ok } = require('assert');
const server = http.createServer(app);
const io = socketIo(server);

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
    const data = {"auditor": gvars.auditor}
    res.json(data);
};

exports.getListBoxVendedores = async (req, res) => {
    const data = {
        "Equipo": "",
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

exports.getListBox1 = async (req, res) => {
    const data = {
        "FORMATIVO": "",
        "POSITIVO": "",
        "LLAMADA DE ATENCIÓN": ""
    };
    res.json(data);
};

exports.getListBox2 = async (req, res) => {
    const data = {
        "ESTADOS DE CONEXIÓN": "",
        "BAJA CONVERSIÓN": "",
        "BAJA FACTURACIÓN": "",
        "TRAINING POR PRODUCTO": "",
        "APOYO POR CONSULTA": "",
        "GESTIÓN CC": "",
        "PRECIO BAJO": ""
    };
    res.json(data);
};

exports.getListBox3 = async (req, res) => {
    const data = {
        "BUENA": "",
        "REGULAR": "",
        "MALA": ""
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
    gvars.fechaCal = currentDate()
    gvars.aName = req.body.aName
    res.json({
        "success": "ok"
    })
};

exports.getAudioData = async (req, res) => {
    res.json({
        "fechaCal": convertDateFormat(gvars.fechaCal),
        "aName": gvars.aName
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
    gvars.dataToExport.push(req.body);
    res.json({
        "success": "ok"
    });
};

exports.getDataToExport = async (req, res) => {
    res.json({
        "dataToExport": gvars.dataToExport,
    });
};

exports.getGeneralReportData = async (req, res) => {   
    const data = req.body.dataToExport;

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
  
    res.json({"resultados_nuevo": resultados_nuevo});
};

exports.getRowsData = async (req, res) => {
    
    const response = req.body;

    gvars.fechaCal = currentDate();
    gvars.aName = response.Nombre_Audio;

    const rowsData = [
        //{cells: [{image: "/public/img/logo.svg"}]},
        
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
  /*
        {cells: [{text: "Comentarios:", colSpan: 5, bold: true}]},
        
        {fontSize: gvars.font, cells: [{text: "- Saludo Institucional: "+response.Saludo_institucional_comentario, colSpan: 5}]},
        {fontSize: gvars.font, cells: [{text: "- Simpatía/Empatía: "+response.Simpatia_empatia_comentario, colSpan: 5}]},
        {fontSize: gvars.font, cells: [{text: "- Precalificación: "+response.Precalificacion_comentario, colSpan: 5}]},
        {fontSize: gvars.font, cells: [{text: "- Preguntas subjetivas: "+response.Preguntas_subjetivas_comentario, colSpan: 5}]},
        {fontSize: gvars.font, cells: [{text: "- Etiqueta enfermedad: "+response.Etiqueta_Enfermedad_comentario, colSpan: 5}]},
        {fontSize: gvars.font, cells: [{text: "- Enfocarse en la enfermedad: "+response.Enfocarse_enfermedad_comentario, colSpan: 5}]},
        {fontSize: gvars.font, cells: [{text: "- Tono de voz: "+response.Tono_voz_comentario, colSpan: 5}]},
        {fontSize: gvars.font, cells: [{text: "- Conocimiento de la patología: "+response.Conocimiento_patologia_comentario, colSpan: 5}]},
        {fontSize: gvars.font, cells: [{text: "- Dato duro: "+response.Dato_duro_comentario, colSpan: 5}]},
        {fontSize: gvars.font, cells: [{text: "- Testimonio: "+response.Testimonio_comentario, colSpan: 5}]},
        {fontSize: gvars.font, cells: [{text: "- Solución/Beneficios: "+response.Solucion_beneficios_comentario, colSpan: 5}]},
        {fontSize: gvars.font, cells: [{text: "- Respaldo: "+response.Respaldo_comentario, colSpan: 5}]}, 
        {fontSize: gvars.font, cells: [{text: "- Cierre de venta: "+response.Cierre_venta_comentario, colSpan: 5}]},      
        {fontSize: gvars.font, cells: [{text: "- Comunicación efectiva: "+response.Comunicacion_efectiva_comentario, colSpan: 5}]},      
        {fontSize: gvars.font, cells: [{text: "- Conocimiento del tratamiento: "+response.Concimiento_tratamiento_comentario, colSpan: 5}]},      
        {fontSize: gvars.font, cells: [{text: "- Rebate de objeciones: "+response.Rebate_objeciones_comentario, colSpan: 5}]},   
        
        */
    ];

    res.json({
        "rows_data": rowsData
    });
}

exports.getGeneralReportRows = async (req, res) => {

    resultados = req.body.resultados_nuevo;
    data = req.body.data.dataToExport;

    gvars.fechaCal = currentDate();
    gvars.aName = data[0].Nombre_Audio;

    const [auditor, fechaCalibracion, grupo, motivoAuditoria, nombreAsesor, tipoCampana] = [data[0].Auditor, gvars.fechaCal, data[0].Grupo, data[0].Motivo, data[0].Asesor, data[0].Tipo_de_Campana];
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

    const result1 = puntuacion(saludo,simpatiaEmpatia);
    const result2 = puntuacion(percalificacion,preguntasSubjetivas);
    const result3 = puntuacion(etiqueta, enfoque, tono, conocimiento, datoDuro);
    const result4 = puntuacion(referencia);
    const result5 = puntuacion(match);
    const result6 = puntuacion(matriz);
    const result7 = puntuacion(momento);

    const etapasVenta = (gvars.peso1/100 * result1) + (gvars.peso2/100*result2) + (gvars.peso3/100*result3) + (gvars.peso4/100*result4) + (gvars.peso5/100*result5) + (gvars.peso6/100*result6) + (gvars.peso7/100*result7)
    const habComerciales = puntuacion(puntComEfec, puntConTrat, puntRebObj);

    const resCal = (etapasVenta+habComerciales)/(2);

    const rowsData = [
        {fontSize: gvars.fontH, header: true, cells: [{text: "Acta Calibración Cariola", colSpan: 5, centered: true, colour3: true}]},
        {cells: [{text: " ", colSpan: 5}]},
        //{cells: [{text: " ", colSpan: 5}]},
  
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
        {fontSize: gvars.fontC, rowSpan: 3, cells: [{ text: gvars.peso1 + "%", centered: true }, "1. PRESENTACIÓN EMPÁTICA", "SALUDO INSTITUCIONAL", {text: saludo, colSpan: 2, centered: true}]},
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
        {cells: [{text: " ", colSpan: 5}]},
        {cells: [{text: "Resultados adicionales:", colSpan: 5, bold: true}]},
        {cells: [{text: " ", colSpan: 5}]},
        {fontSize: gvars.font, cells: [{text: "- Tipo de feedback: " + tipoFeedback, colSpan: 5}]},
        {fontSize: gvars.font, cells: [{text: "- Asunto: " + asunto, colSpan: 5 }]},
        {fontSize: gvars.font, cells: [{text: "- Actitud de vendedor: " + actitudVend, colSpan: 5 }]},
        {fontSize: gvars.font, cells: [{text: observacionesDetalleText, colSpan: 5, editable: true}]},
        {cells: [{text: " ", colSpan: 5}]},
    ];

    res.json({
        "rows_data": rowsData
    });
}

exports.transformarAudio = async (req, res) => {

    const file = req.file;
    const duracion = req.body.duracion;
    const durationInSeconds = req.body.durationInSeconds;

    if (!file) {
        return res.status(400).json({error: 'No se envió ningún archivo.'});
    }

    const resultado = await audioToText(file, duracion, durationInSeconds);
    res.json(resultado);
}

exports.analizarTextos = async (req, res) => {
    
    const resultado = await analizarTextos(req.body);
    res.json(resultado);
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

    const etapasVenta = (gvars.peso1/100 * result1) + (gvars.peso2/100*result2) + (gvars.peso3/100*result3) + 
    (gvars.peso4/100*result4) + (gvars.peso5/100*result5) + (gvars.peso6/100*result6) + (gvars.peso7/100*result7)
    const habComerciales = puntuacion(puntComEfec, puntConTrat, puntRebObj);

    const resCal = (etapasVenta+habComerciales)/(2);

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