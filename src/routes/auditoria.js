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

router.get('/font-size', verifyAccessToken, auditoriaController.getFontSize);

router.get('/listbox1', verifyAccessToken, auditoriaController.getListBox1);

router.get('/listbox2', verifyAccessToken, auditoriaController.getListBox2);

router.get('/listbox3', verifyAccessToken, auditoriaController.getListBox3);

router.get('/get-pdf-options', verifyAccessToken, auditoriaController.getPDFoptions);

router.post('/set-audio-data', verifyAccessToken, auditoriaController.setAudioData);

router.get('/get-audio-data', verifyAccessToken, auditoriaController.getAudioData);

router.get('/get-current-date', verifyAccessToken, auditoriaController.getCurrentDate);

module.exports = router;
