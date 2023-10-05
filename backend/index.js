const express = require('express');
const cors = require('cors');
const yaml = require('js-yaml');
const fs = require('fs');
const db = require('./db');
const port = 3000;

const app = express();

// Load config.yml
const config = yaml.load(fs.readFileSync('config.yml', 'utf8'));

app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.get('/store', async (req, res) => {
    const value = await db.storeValue('example');
    res.json({ value });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });