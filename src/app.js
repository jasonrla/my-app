const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./routes/auth');
const auditoriaRoutes = require('./routes/auditoria');

require('dotenv').config();

const app = express();
const port = 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/public', express.static(path.resolve(__dirname, '..', 'public')));

app.use('/', authRoutes);
app.use('/', auditoriaRoutes);

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
});
