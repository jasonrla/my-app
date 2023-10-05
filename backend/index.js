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
    const dynamicContent = "Hello, Dynamic World!";
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Dynamic Page</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 20px;
                }
                h1 {
                    color: blue;
                }
            </style>
        </head>
        <body>
            <h1>${dynamicContent}</h1>
        </body>
        </html>
    `;
    res.send(html);
});

app.get('/store', async (req, res) => {
    const value = await db.storeValue('example');
    res.json({ value });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});