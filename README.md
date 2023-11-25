# my-app

Conectar a EC2

Instalar dependencias para amazon cognito
npm install amazon-cognito-identity-js express body-parser --save



jason.lopez@MP7MWRMQ ~ % chmod 400 EC2-ssh.pem
jason.lopez@MP7MWRMQ ~ % ssh -i EC2-ssh.pem ec2-user@PublicIP
   ,     #_
   ~\_  ####_        Amazon Linux 2023
  ~~  \_#####\
  ~~     \###|
  ~~       \#/ ___   https://aws.amazon.com/linux/amazon-linux-2023
   ~~       V~' '->
    ~~~         /
      ~~._.   _/
         _/ _/
       _/m/'
[ec2-user@ip-IP ~]$ exit
logout
Connection to PublicIP closed.
jason.lopez@MP7MWRMQ ~ % 


BD

Nombre de usuario maestro
postgres
Contraseña maestra
TlUnCLJDMhrHs1jLuGQICopiar




jason.lopez@MP7MWRMQ ~ % chmod 400 key_pair_2.pem
jason.lopez@MP7MWRMQ ~ % ssh -i key_pair_2.pem ec2-user@PublicIP
(Type YES)
[ec2-user@ip-172-31-94-119 ~]$ sudo yum update -y
[ec2-user@ip-172-31-94-119 ~]$ sudo yum install -y nodejs
[ec2-user@ip-172-31-94-119 ~]$ node -v
[ec2-user@ip-172-31-94-119 ~]$ npm -v
[ec2-user@ip-172-31-94-119 ~]$ sudo yum install git -y
[ec2-user@ip-172-31-94-119 ~]$ git --version
[ec2-user@ip-172-31-94-119 ~]$ git clone https://github.com/jasonrla/my-app.git
[ec2-user@ip-172-31-94-119 ~]$ cd my-app
[ec2-user@ip-172-31-94-119 my-app]$ ls -al
[ec2-user@ip-172-31-94-119 my-app]$ npm install

npm install express-jwt
npm install jwks-rsa
npm install jsonwebtoken
npm install dotenv
npm install socket.io
npm install aws-amplify
npm install node-fetch form-data
npm install multer
npm install form-data
npm install winston
npm install --save-dev javascript-obfuscator
npm install clean-css-cli
npm install clean-css-cli html-minifier terser --save-dev
npm install --save-dev mkdirp "minify-js": "node src/utils/minify-js.js",
npm install mp3-duration
npm install pg
npm install express-session

———————————————————
Ejecutar en local:

npm run minify
node src/app.js

———————————————————

 ssh -i ec2.pem ec2-user@PublicIP "cd my-app && git pull origin main && cd .. && ./start-app.sh"

Para deployar:

Actualizar el nombre del servidor en deploy.yml
Modificar el servidor en:
* Add SSH key to known hosts
* Deploy to EC2
Esperar que el deploy termine
Luego en el servidor ejecutar:
./start-app.sh
———————————————————

nano start-app.sh
./start-app.sh

———————————————————

nvm install 16.20.2
nvm use 16.20.2
node -v


rm -rf my-app
git clone https://github.com/jasonrla/my-app.git
cd my-app
npm install
npm install dotenv
cd ..
./start-app.sh 

———————————————————


INSTALAR NVM

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc  # This loads nvm
echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> ~/.bashrc  # This loads nvm bash_completion

source ~/.bashrc

nvm --version

nvm install 16.20.2

nvm use 16.20.2

node -v

———————————————————


#!/bin/bash

# Establecer variables de entorno
export UserPoolId=
export ClientId=
export region=
export openTokn=

# ... añade todas las variables que necesites

# Iniciar la aplicación
cd my-app
git pull origin main
npm run minify
node src/app.js

———————————————————

Para las variables de entorno:
touch start-app.sh
nano start-app.sh
Control + O para guardar
Enter
Contro + X para salir
chmod +x start-app.sh (hace el archivo ejecutable)
./start-app.sh (con esto se ejecuta el servidor)


const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});


* 		Identificar el Grupo de Seguridad: Selecciona tu instancia y busca los detalles en la parte inferior de la página. Encuentra la pestaña que dice "Security groups" y anota el ID del grupo de seguridad asociado con tu instancia.
* 		Ir al Grupo de Seguridad: En el panel izquierdo, haz clic en "Security Groups" bajo la sección "Security and Compliance". Luego, encuentra y selecciona el grupo de seguridad que anotaste anteriormente.
* 		Editar Reglas de Entrada: Con el grupo de seguridad seleccionado, haz clic en la pestaña "Inbound rules" y luego en el botón "Edit inbound rules".
* 		Agregar Regla: Haz clic en "Add rule" para añadir una nueva regla. Establece el tipo como "Custom TCP", el protocolo como "TCP", el rango de puertos como 3000, y la fuente como "Anywhere" (o limita la fuente a IPs específicas si lo prefieres para mayor seguridad).
* 		Guardar Cambios: Haz clic en "Save rules" para aplicar los cambios.
* 		Verificar Acceso: Ahora intenta acceder a tu aplicación desde un navegador web usando tu IP pública y el puerto 3000 (e.g., PublicIP). Deberías poder acceder a ella si todo está configurado correctamente.


node backend/index.js


npm install aws-sdk
npm install amazon-cognito-identity-js
npm install amazon-cognito-identity-js aws-sdk express cors body-parser

