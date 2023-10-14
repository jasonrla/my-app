const express = require('express');
const auditoriaController = require('../controllers/auditoriaController');
const verifyAccessToken = require('../middleware/verifyAccessToken');

const router = express.Router();

router.get('/auditoria', auditoriaController.getAuditoriaPage);

router.get('/authentication', auditoriaController.getAuthentication);

router.get('/auditor-name', verifyAccessToken, auditoriaController.getAuditorName);

router.get('/listbox-vendedores', verifyAccessToken, auditoriaController.getListBoxVendedores);

router.get('/listbox-motivo', verifyAccessToken, auditoriaController.getListBoxMotivo);

router.get('/listbox-dialer', verifyAccessToken, auditoriaController.getListBoxDialer);

router.post('/analizar-textos', verifyAccessToken, auditoriaController.analizarTextos);

router.post('/report-data', verifyAccessToken, auditoriaController.reportData);

module.exports = router;
