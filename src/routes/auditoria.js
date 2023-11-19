const express = require('express');
const auditoriaController = require('../controllers/auditoriaController');
const authController = require('../controllers/authController');
const {verifyAccessToken, checkRole} = require('../middleware/middleware.js');
const router = express.Router();
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });

const admin = 'admin';
const user = 'user';

router.get('/auditoria', auditoriaController.getAuditoriaPage);

router.get('/authentication', auditoriaController.getAuthentication);

router.get('/get-env', verifyAccessToken, checkRole(admin, user), auditoriaController.getEnv);

router.get('/auditor-name', verifyAccessToken, checkRole(admin, user), auditoriaController.getAuditorName);

router.get('/listbox-vendedores', verifyAccessToken, checkRole(admin, user), auditoriaController.getListBoxVendedores);

router.get('/listbox-motivo', verifyAccessToken, checkRole(admin, user), auditoriaController.getListBoxMotivo);

router.get('/listbox-dialer', verifyAccessToken, checkRole(admin, user), auditoriaController.getListBoxDialer);

router.get('/listbox-lideres', verifyAccessToken, checkRole(admin, user), auditoriaController.getListBoxLideres);

router.get('/listbox-grupos', verifyAccessToken, checkRole(admin, user), auditoriaController.getListBoxGrupos);

router.post('/transformar-audio', verifyAccessToken, checkRole(admin, user), upload.single('audioFile'), auditoriaController.transformarAudio);

router.post('/analizar-textos', verifyAccessToken, checkRole(admin, user), auditoriaController.analizarTextos);

router.post('/report-data', verifyAccessToken, checkRole(admin, user), auditoriaController.reportData);

router.get('/font-size', verifyAccessToken, checkRole(admin, user), auditoriaController.getFontSize);

router.get('/listbox1', verifyAccessToken, checkRole(admin, user), auditoriaController.getListBox1);

router.get('/listbox2', verifyAccessToken, checkRole(admin, user), auditoriaController.getListBox2);

router.get('/listbox3', verifyAccessToken, checkRole(admin, user), auditoriaController.getListBox3);

router.get('/get-pdf-options', verifyAccessToken, checkRole(admin, user), auditoriaController.getPDFoptions);

router.post('/excel-options', verifyAccessToken, checkRole(admin, user), auditoriaController.excelOptions);

router.post('/set-audio-data', verifyAccessToken, checkRole(admin, user), auditoriaController.setAudioData);

router.get('/get-audio-data', verifyAccessToken, checkRole(admin, user), auditoriaController.getAudioData);

router.get('/get-current-date', verifyAccessToken, checkRole(admin, user), auditoriaController.getCurrentDate);

router.get('/get-date', verifyAccessToken, checkRole(admin, user), auditoriaController.getDate);

router.post('/set-data-to-export', verifyAccessToken, checkRole(admin, user), auditoriaController.setDataToExport);

router.get('/get-data-to-export', verifyAccessToken, checkRole(admin, user), auditoriaController.getDataToExport);

router.get('/get-data-to-export-excel', verifyAccessToken, checkRole(admin, user), auditoriaController.getDataToExportExcel);

router.post('/get-general-report-data', verifyAccessToken, checkRole(admin, user), auditoriaController.getGeneralReportData);

router.post('/get-rows-data', verifyAccessToken, checkRole(admin, user), auditoriaController.getRowsData);

router.post('/get-general-report-rows', verifyAccessToken, checkRole(admin, user), auditoriaController.getGeneralReportRows);

router.post('/get-feedback-report-rows', verifyAccessToken, checkRole(admin, user), auditoriaController.getFeedbackReportRows);

router.get('/get-invoice-data', verifyAccessToken, checkRole(admin), auditoriaController.getInvoiceData);

router.post('/set-selected-processes', verifyAccessToken, checkRole(admin, user), auditoriaController.setSelectedProcesses);

router.get('/reset-values', verifyAccessToken, checkRole(admin, user), auditoriaController.resetValues);

router.get('/get-logs', verifyAccessToken, checkRole(admin, user), auditoriaController.getLogs);

module.exports = router;
