const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcDir = 'public_original/js/';
const destDir = 'public/js/';

fs.readdirSync(srcDir).forEach(file => {
  if (path.extname(file) === '.js') {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file.replace('.js', '.min.js'));
    execSync(`terser ${srcFile} -o ${destFile} --compress --mangle`);
  }
});
