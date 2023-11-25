const path = require('path');

module.exports = {
  entry: {
    index: './public/js/index.js',
    mobile: './public/js/mobile.js'
  }, // El punto de entrada de tu aplicación
  output: {
    filename: '[name].bundle.js', // El nombre del archivo bundle
    path: path.resolve(__dirname, 'public/dist'), // si no se quiere minificar y solo hacer bundle: public/js, ademas eliminar: && npm run minify  en package.json
  },
};
