const express = require('express');
const path = require('path');
require('dotenv').config();
const app = express();
const gvars = require('../utils/const.js');
const { analizarTextos, puntuacion } = require('../utils/functions.js');

const http = require('http');
const socketIo = require('socket.io');
const { ok } = require('assert');
const server = http.createServer(app);
const io = socketIo(server);

//let data = {};
exports.getAuditoriaPage = (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'html', 'auditoria.html'));
};

exports.getAuthentication = (req, res) => {
    const data = {"token": gvars.tkn}
    res.json(data);
};

exports.getAuditorName = (req, res) => {
    const data = {"auditor": gvars.auditor}
    res.json(data);
};

exports.getListBoxVendedores = async (req, res) => {
    const data = {
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

exports.analizarTextos = async (req, res) => {
    const resultado = await analizarTextos(req.body.audioFile, req.body.auditor, req.body.grupo_vendedor, req.body.motivo, req.body.nombre_vendedor, req.body.tipo_campana);
    res.json(resultado);
};

exports.reportData = async (req, res) => {
    
    const resultados = req.body;

    console.log("resultados");
    console.log(resultados);

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
    "font": gvars.font,
    "fontH": gvars.fontH,
    "fontC": gvars.fontC,
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

    console.log("resultado");
    console.log(resultado);

    res.json(resultado);
};

