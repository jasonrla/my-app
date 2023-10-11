const express = require('express');
const path = require('path');
require('dotenv').config();
const app = express();
const gvars = require('../utils/const.js');

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
 const data ={
    "auditor": req.body.auditor,
    "grupo": req.body.grupo_vendedor
 };
    res.json(data);
};

