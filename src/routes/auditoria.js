const express = require('express');
const auditoriaController = require('../controllers/auditoriaController');
const authController = require('../controllers/authController');
const verifyAccessToken = require('../middleware/verifyAccessToken');
const router = express.Router();
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/auditoria', auditoriaController.getAuditoriaPage);

router.get('/authentication', auditoriaController.getAuthentication);

router.get('/get-env', auditoriaController.getEnv);

router.get('/auditor-name', verifyAccessToken, auditoriaController.getAuditorName);

router.get('/listbox-vendedores', verifyAccessToken, auditoriaController.getListBoxVendedores);

router.get('/listbox-motivo', verifyAccessToken, auditoriaController.getListBoxMotivo);

router.get('/listbox-dialer', verifyAccessToken, auditoriaController.getListBoxDialer);

router.post('/transformar-audio', verifyAccessToken, upload.single('audioFile'), auditoriaController.transformarAudio);

router.post('/analizar-textos', verifyAccessToken, auditoriaController.analizarTextos);

router.post('/report-data', verifyAccessToken, auditoriaController.reportData);

router.get('/font-size', verifyAccessToken, auditoriaController.getFontSize);

router.get('/listbox1', verifyAccessToken, auditoriaController.getListBox1);

router.get('/listbox2', verifyAccessToken, auditoriaController.getListBox2);

router.get('/listbox3', verifyAccessToken, auditoriaController.getListBox3);

router.get('/get-pdf-options', verifyAccessToken, auditoriaController.getPDFoptions);

router.post('/excel-options', verifyAccessToken, auditoriaController.excelOptions);

router.post('/set-audio-data', verifyAccessToken, auditoriaController.setAudioData);

router.get('/get-audio-data', verifyAccessToken, auditoriaController.getAudioData);

router.get('/get-current-date', verifyAccessToken, auditoriaController.getCurrentDate);

router.get('/get-date', verifyAccessToken, auditoriaController.getDate);

router.post('/set-data-to-export', verifyAccessToken, auditoriaController.setDataToExport);

router.get('/get-data-to-export', verifyAccessToken, auditoriaController.getDataToExport);

router.post('/get-general-report-data', verifyAccessToken, auditoriaController.getGeneralReportData);

router.post('/get-rows-data', verifyAccessToken, auditoriaController.getRowsData);

router.post('/get-general-report-rows', verifyAccessToken, auditoriaController.getGeneralReportRows);

router.post('/get-feedback-report-rows', verifyAccessToken, auditoriaController.getFeedbackReportRows);

router.get('/get-invoice-data', verifyAccessToken, auditoriaController.getInvoiceData);

module.exports = router;
