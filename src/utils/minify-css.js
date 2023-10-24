const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcDir = 'public_original/css/';
const destDir = 'public/css/';

fs.readdirSync(srcDir).forEach(file => {
  if (path.extname(file) === '.css') {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file.replace('.css', '.min.css'));
    execSync(`cleancss -o ${destFile} ${srcFile}`);
  }
});
