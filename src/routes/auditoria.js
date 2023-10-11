const express = require('express');
const auditoriaController = require('../controllers/auditoriaController');
const verifyAccessToken = require('../middleware/verifyAccessToken');

const router = express.Router();

router.get('/auditoria', auditoriaController.getAuditoriaPage);

router.get('/authentication', auditoriaController.getAuthentication);

router.get('/auditor-name', auditoriaController.getAuditorName); //verifyAccessToken

router.get('/listbox-vendedores', auditoriaController.getListBoxVendedores);

router.get('/listbox-motivo', auditoriaController.getListBoxMotivo);

router.get('/listbox-dialer', auditoriaController.getListBoxDialer);

router.post('/analizar-textos', auditoriaController.analizarTextos);

module.exports = router;
