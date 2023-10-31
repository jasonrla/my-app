
const { Logger } = require('aws-amplify');
const gvars = require('../utils/const.js');
const FormData = require('form-data');
const { error } = require('console');
const mp3Duration = require('mp3-duration');
const fs = require('fs');

function currentDate() {
    const date = new Date();
    
    const day = String(date.getDate()).padStart(2, '0');  // Día
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Mes (los meses comienzan en 0, así que añadimos 1)
    const year = date.getFullYear();  // Año
    
    const hours = String(date.getHours()).padStart(2, '0');  // Horas
    const minutes = String(date.getMinutes()).padStart(2, '0');  // Minutos
    const seconds = String(date.getSeconds()).padStart(2, '0');  // Segundos
    
    const formattedDate = `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
}

function getColumnLetter(cellKey) {
    const match = cellKey.match(/[A-Z]+/);
    return match ? match[0] : null;
}

function transformDateFormat(dateStr) {
    // Convertir "09/18/2023 22:08:15" a "_09182023_220815"
    return dateStr.replace(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/, '$2$1$3_$4$5$6');
}

function convertDateFormat(dateString) {
    const parts = dateString.split(' ');
    const dateParts = parts[0].split('/');
    const formattedDate = dateParts[2] + dateParts[1] + dateParts[0];
    const formattedTime = parts[1].replace(/:/g, '');

    return formattedDate + '_' + formattedTime;
}

function puntuacion(...numeros) {
    let sum = 0;
    let count = 0;
    
    for(let num of numeros) {
        if (num) {
            num = parseInt(num);
            if (!isNaN(num)) {
                sum += num;
                count++;
            }
        }
    }
    if (count === 0) return 0;

    let promedio = (sum / count) * 10;
    return promedio;
}

function getAudioDuration(audioFile) {
    return new Promise((resolve, reject) => {
      const audioFilePath = audioFile.path;
  
      mp3Duration(audioFilePath, function(err, duration) {
        if (err) {
          reject(err);
          return;
        }
  
        // Redondear la duración a segundos enteros más cercanos
        const roundedDuration = Math.round(duration);
  
        const hours = Math.floor(roundedDuration / 3600);
        const minutes = Math.floor((roundedDuration - (hours * 3600)) / 60);
        const seconds = Math.floor(roundedDuration % 60);
  
        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');
  
        const formattedDuration = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  
        resolve({
          "durationFormat": formattedDuration,
          "durationInSeconds": roundedDuration // Utiliza la duración redondeada
        });
      });
    });
}


function procesarAudio(nombreAudio, transcripcionTexto, duracion, durationInSeconds) {
    console.log(gvars.transcripciones);
    gvars.transcripciones[nombreAudio] = {
        transcripcion: transcripcionTexto,
        duracion: duracion,
        durationInSeconds: durationInSeconds
    };
    console.log("se guardo en transcripciones");
    console.log(gvars.transcripciones);
}

function obtenerDetallesAudio(nombreAudio) {
    if (gvars.transcripciones.hasOwnProperty(nombreAudio)) {
        console.log("se encontró audio en gvars.transcripciones")
        return {
            transcripcion: gvars.transcripciones[nombreAudio].transcripcion,
            duracion: gvars.transcripciones[nombreAudio].duracion,
            durationInSeconds: gvars.transcripciones[nombreAudio].durationInSeconds
        };
    } else {
        console.log("null");
        return null; // o cualquier valor que quieras retornar en caso de que el audio no exista
    }
}



function guardarAnalisisTexto(nombreAudio, tipo, valor, comentario, otrosValores = {}) {
    if (!gvars.textosAnalizados[nombreAudio]) {
        gvars.textosAnalizados[nombreAudio] = {};
    }
    
    gvars.textosAnalizados[nombreAudio][tipo] = {
        ...otrosValores,
        valor: valor,
        comentario: comentario
    };
    console.log("se guardo en textosAnalizados");
    console.log(gvars.textosAnalizados);
}

function obtenerDetallesTexto(nombreAudio, tipo) {
    if (gvars.textosAnalizados[nombreAudio] && gvars.textosAnalizados[nombreAudio][tipo]) {
        console.log("se encontró audio en gvars.textosAnalizados")
        return gvars.textosAnalizados[nombreAudio][tipo];
    } else {
        return null; // o cualquier valor que quieras retornar en caso de que el audio o el tipo no existan
    }
}



async function audioToText(audioFile) {

    if(gvars.prodEnv){

        let texto = ""; let durationFormat, durationInSeconds;

        let detallesAudio1 = obtenerDetallesAudio(audioFile.originalname);

        if (detallesAudio1) {
            texto = detallesAudio1.transcripcion;
            durationFormat = detallesAudio1.duracion;
            durationInSeconds = detallesAudio1.durationInSeconds;
        } else {

            //let durationFormat, durationInSeconds;
            getAudioDuration(audioFile)
            .then(result => {
                console.log("result");
                if (result) {  // Verificar si result es null o undefined.
                    durationFormat = result.durationFormat;
                    durationInSeconds = result.durationInSeconds;
                    console.log("durationFormat:", durationFormat);
                    console.log("durationInSeconds:", durationInSeconds);
                } else {
                console.log("Result es undefined o null");
                }
            })
            .catch(err => {
            console.log(`Error: ${err.message}`);
            });

            console.log("audioToText");
            console.log(audioFile);
            
            const formData = new FormData();
            formData.append('file', fs.createReadStream(audioFile.path),{ 
                filename: audioFile.originalname,
                contentType: 'audio/mpeg'
            }); 
            formData.append('model', 'whisper-1');

            const requestOptions = {
                method: 'POST',
                headers: {
                'Authorization': `Bearer ${process.env.openTokn}`
                },
                body: formData
            };

            let transcripcion;
            //let texto = "";

            try {
                const response = await fetch('https://api.openai.com/v1/audio/transcriptions', requestOptions);
                
                if(!response.ok){
                    console.log("Error al transformar el audio: " + audioFile.originalname);
                    return {"error": true, "response": response};
                }

                transcripcion = await response.json();
                
                console.log("Transformando audio");
                console.log(transcripcion);

                texto = transcripcion.text;   
                fs.unlinkSync(audioFile.path);

                addData(audioCost(audioFile.originalname, durationFormat, durationInSeconds));

                procesarAudio(audioFile.originalname, texto, durationFormat, durationInSeconds)

            } catch (error) {
                console.error('Error:', error);
            }

        }

        return {
            "text": texto,
            "duracion": durationFormat
        };
    }
    else{  
        return {
            "text": "Buenas. Muy buenas tardes Alicia, ¿cómo estás? Bien. Qué bueno, me da mucho gusto saludar que te llegó la orden. Sí. Excelente. ¿Cuántos días tiene tomándose el tratamiento? Dos, tres, como cuatro días, cinco días, como media semana. ¿Media semana? Ajá. Ok mi amor, ¿ha visto algún cambio ya positivo? No, ahorita no. Ya me duelen mis dedos. ¿Te duelen los dedos? Ajá. Ok, ¿tú tienes artritis, Alicia? No sé, no me han dicho, pero creo que sí. Ok, salvo FLEX, tú sabes que contiene colágeno que te va a ayudar a desinflamar y poco a poco, como es un tratamiento natural, va a ir sacando la inflamación y va a ir quitando el dolor. ¿Tienes algún dedito chueco? No, nada más así como con bolas. ¿Bolas? Eso es la inflamación de la membrana sinovial del líquido, el líquido se sale. Esa inflamación es la que te tiene así, con dolor y los dedos rígidos. Te sientes rígido, ¿es solamente en los dedos o hay alguna otra coyuntura que te ha afectado? No, nada más los dedos. Los dedos, ¿cuántos libros estás pesando, Alicia? Peso 142. ¿Y la estatura tuya, mi amor, cuánto es? Cinco. Cinco, vamos a ver. Tienes un poquito de sobrepeso, ¿verdad? ¿Cuánto debería ser el peso normal, sabes? ¿Te ha dicho tu médico? No, no me ha dicho que estoy sobrepeso. Si me está dando bien tus medidas, sí. ¿Peso normal para tu tamaño deberían ser 130 libras? ¿Cuántos años tienes? 50. Pero tú tienes una voz muy engañosa, Alicia. Se escucha como una muchachita, se escucha muy joven. Siempre se lo dice la gente, ¿verdad? Sí. Aparte del tratamiento para la inflamación de las articulaciones, ¿estás tomando algo más? ¿Indicado por el médico? ¿Cómo? ¿Estás tomando algún tratamiento recetado por el doctor? No, nada más para la diabetes. ¿Nada más para la diabetes? ¿Y qué tiempo tiene con diabetes? Hace como dos años. ¿Estás usando insulina o metformina? Metformina. ¿De 500? Ajá. ¿De 500 una vez o dos veces? ¿Cómo? ¿Una vez o dos veces al día tomas la metformina? Dos veces al día. Ok, entonces todavía tienes diabetes tipo 2, Alicia. Es la menos mala. La diabetes puede avanzar o puede retroceder. Así como puede bajarte a que esté normal, puede avanzar a degenerarse a tipo 1. Todavía estás a tiempo de estimular el páncreas para detener el avance de la diabetes. Sabes que la diabetes es degenerativa, progresiva. Y lamentablemente el uso prolongado de esa medicina puede dañar el hígado y los riñones. ¿Algún deterioro en algún órgano del cuerpo? No. Hasta ahora, gracias a Dios. Todo bien, gracias a Dios. Hay que mantenerse así. ¿El nivel de azúcar en la mañana en cuánto te aparece? ¿Tú te la checas? En 30. ¿En 30? A veces en 111. Ok, entonces usted está... Usted está regulada, Alicia. O sea que todavía estimulando el páncreas se normaliza. La única diabetes que no tiene solución y no tiene vuelta atrás es la diabetes mellitus. Tú sabes que hay diferentes tipos de diabetes, ¿verdad? Sí. La diabetes mellitus, que es la mala, que es la tipo 1 o la tipo 2 la que tiene, la diabetes estacional que da en el embarazo. Y hay pacientes que están prediabéticos que a veces nunca se les desarrolla la diabetes tipo 2. Entonces, el tratamiento para la páncreas se llama REVENSI para pacientes tipo 2 y prediabéticos. Esto lo que hace es estimular la célula beta del páncreas para ayudar con la producción de insulina de manera natural. Entonces, esto te ayuda a que el páncreas, o sea tu órgano, que ahora mismo no está produciendo insulina 100%, empiece a funcionar de una mejor manera. Entonces, eso te ayuda a que te regules sin necesidad de medicina. O sea que poco a poco tu propio médico te va a ir quitando el medicamento. Lo primero es bajar a prediabetes. Ya después que estés en prediabetes estamos a un paso a que estés normal. Y puedes lograr porque tú estás regulada, mi amor. Si usted tuviera mal, sí no, pero usted tiene diabetes tipo 2. Anota el nombre del tratamiento, Alicia. Se llama REVENSI. Le toma una sola de ese. Y apenas tiene 2 años, mi amor. Eso no se te ha desarrollado todavía. A veces tú vas al médico y se te sube el azúcar un día y el médico te manda pastillas de por vida. En vez de decirte, haga una dieta, cuídate, tómate esto, tómate lo otro, y ya. Pero te manda medicina y el cuerpo se va acostumbrando al químico. Hay muchas personas que se han tomado el tratamiento y que a los 3 meses ya están normales. Y como tú sabes que si tú estás bien, la medicina química te puede bajar mucho el azúcar y eso también es peligroso. El azúcar es muy bajita. Entonces tengo personas que el médico automáticamente le quitó la medicina. Ya no la pueden beber porque no la necesitan. Eso es muy fuerte. Entonces ya que el páncreas trabaja, si se toman esa medicina le bajaría demasiado y eso es peligroso. Tengo pacientes que ya no. El mismo médico se la quitó porque entonces se la baja mucho ya. O sea que ya no la necesitan y tú puedes entrar ahí porque tú estás controlada. Anota el nombre del tratamiento, Alisa, para que te lo empieces a tomar en ayunas. Dime, amor. ¿Cuál es la diferencia del azúcar? Ese es nuestro laboratorio. Nosotros, aparte de los tratamientos para los dolores y la inflamación, tenemos más de 30 productos para el cuidado de la salud. Esa es para la diabetes tipo 2 o prediabética. Se llama Revense. ¿Y eso cuánto sale? Ese tratamiento del azúcar sale en $299,95. Es un tratamiento, sí, claro que es caro, mi amor. No es un tratamiento paliativo. Los tratamientos paliativos son los que te alivian el momento y al finalizar el tratamiento vuelve usted con lo mismo y tiene que estar tomando medicina de por vida. Eso es un tratamiento, un solo tratamiento. Viene por seis meses porque se toma una sola cápsula diario y eso no es simplemente para regular el azúcar en la sangre. Eso es para que tu páncreas, si tú has buscado o has leído un poquito, sabes, que el órgano que produce insulina naturalmente en el cuerpo se llama páncreas y que eso es lo que no te está funcionando bien. Este tratamiento es para ese órgano. Entonces ya funcionando tu órgano en mayor capacidad, controla solo el azúcar en la sangre sin necesidad de pastillas. Es un tratamiento para la páncreas, no simplemente para limpiarle la sangre. La pastilla de metformina, ¿qué hace? Regula el azúcar en la sangre. Regula. O sea, no es un tratamiento para tu páncreas, sino para regular lo que ya hay en la sangre. Este tratamiento es para evitar que el azúcar se suba. ¿Y yo si no lo puedo encontrar aquí como en los naturistas? Ah, no, no, mi vida, ese tratamiento es de nosotros, del laboratorio de Svense. Y en este caso sale 299.95 porque era un paciente con dos años de diabetes. Tú todavía, gracias a papá Dios, está controlada, no tiene daños severos de hígado, riñón y eso. Porque un paciente ya más avanzado con daños severos de órgano, tú sabes que lleva un medicamento más agresivo, más medicamento, más tiempo. En el caso tuyo, no. Yo te voy a poner un descuento para personas de bajos recursos. Pero vas a ver el cambio, porque te lo digo, porque teníamos un paciente que vino con diabetes tipo 2 y el señor tenía 30 años con la enfermedad, tomando pastillas. Y siempre estaba el señor como controlado. Él se veía, se picaba el azúcar 110, 112, 90 en la mañana y se tomó el tratamiento. En el 2017, el señor tiene todos esos años que no usa medicina. Realmente, usted se le subió una vez el azúcar y el médico automáticamente lo diagnosticó con la enfermedad. Porque si ya tenía diabetes desarrollada, ¿tú crees que ese señor con dos meses de tratamiento ya le estaba bien y ya no se podía tomar la pastilla porque se ponía muy bajita su azúcar? El médico se la quitó rotundamente y el señor a la fecha se mantiene controlado. Estaba sobrepeso, bajó. Bajó también de peso, tenía como 40 libras de más. Que también eso le ayudó muchísimo en su proceso. Yo sé que tú no bajaste de peso. ¿Usted quiere decir que estoy subida de peso? No, no, no. Tú no estás subida de peso. Tú nada más tienes unas libritas de más, mi vida. No, te digo el señor que estaba subido de peso. No, pero yo digo, ¿cuánto es lo que tendría que pesar? Tú, para 5, para el tamaño de 5 serían 130. Pero eso sí es también la medida que tú me estás dando porque yo no sé realmente. Yo voy de acuerdo a lo que tú me dices. Pero si tú entiendes que tienes una pancita por ahí, abdomen, que lo tienes un poquito crecido, ¿sí tienes quien te varíe? Pues no, no tengo, así nunca he tomado uno. Entonces tú no tienes sobrepeso, hay algo mal con la medida entonces. A lo mejor es 5 o 2, no me acuerdo la medida. A lo mejor es 5 o 2. Pero de qué 5, pasa casi todos 5, pero no es. Sí, pero que tú sabes que hay que tener lo correcto porque yo lo meto en un aparatico aquí que me da si es sobrepeso, cuánta libra tiene demás y todo eso. Pero para eso necesito la medida exacta, si sea 5 o 2, 5 o 2 o 5 o 3. Es la única manera de uno saber si estás bien o si yo te estoy diciendo lo correcto. La última vez que me me dio la doctora hace meses que fueron 5 o 2. 5 o 2. Entonces si tú tienes 5 o 2, tú dijiste que eran 145. Sí, a pesos 142, pero yo creo que como depende también porque los zapatos, me peso y peso 143 y me quito los zapatos y peso 141, así. Ah, no, eso es por la ropa. Tú mides, tú pesas como 140, no, si tienes 5 o 2, mi amor, está bien, depende del peso, estás en el peso. Pero eso el doctor no te ha dicho nada, estás en el peso. Tienes que tener, como con ropa y sin ropa es diferente, tienes que tener como 140 libras o 141, estás bien. Si es 5 o 2, estás perfecta y eso te ayuda muchísimo a que se mejore muchísimo más rápido cuando tú tienes sobrepeso. Mira, cuando hay un bebé, si tú has tenido niños, para darle medicamento lo pesan porque la cantidad de medicamento va de acuerdo al peso. Entonces, si te mandan un medicamento, como se lo mandan a todo el mundo, y tú tienes, por ejemplo, sobrepeso, no te va a trabajar igual porque hay más volumen del cuerpo, ¿tú ves? Aunque sea el que no tiene enfermedad. Oí un doctor que estaba hablando, un doctor de aquí del BIDOBIDO, pero hay de Tijuana, que estaba diciendo que esas pastillas que le dan a uno para la diabetes, no le tienen que dar los doctores simplemente la misma pastilla a todo el paciente que tiene diabetes. Exacto. Porque la pastilla, el paciente tiene que ser pesado, medido. Exacto. Y aquí no, aquí nomás le dicen nomás que le sale el aceite de araita y luego le dan a uno la pastilla. Y créeme que nosotros con tantos pacientes que tenemos, latinos, que tienen sus soluciones naturales con nosotros, es lo mismo. Y todos los días tratamos los mismos casos sin saber cuánto mide, cuánto pesa el paciente. Le mandan la misma medicina, los mismos miligramos. Hay gente que no me está haciendo nada la pastilla. Y el médico le cambia para insulina. A mí ya me la quería dar, a mí ya me la quería dar la insulina al doctor. Pero le dije no, le dije yo no quiero eso. Porque si yo quiero, yo no puedo controlar el azúcar. Simplemente nomás que hay veces que uno come cosas. Desarreglo. Pues no le digo de comer. Pero bueno, ya con la del pancrea evitamos que se siga deteriorando, porque el doctor manda insulina cuando la azúcar ya la pastilla no la puede controlar en la sangre. ¿Entiendes? Entonces con este tratamiento tú vas a ayudar a tu páncreas para que se estimule. Porque a veces tú haces desarreglo o no puedes hacer la dieta por X o por Y y se puede subir. Pero si ya el páncreas está produciendo más insulina, el azúcar no se va a disparar. Porque eso es como el metabolismo. Es como el metabolismo. Por ejemplo, yo tengo metabolismo rápido, yo puedo comer lo que sea. Yo puedo comer puerco, puedo comer vaca, lo que sea. Yo no aumento de peso. Coma una loma, mi metabolismo está acelerado. Así estoy yo, así como comidas pues, mis tres comidas y no he aumentado de peso. Mi peso que antes tenía, antes como más joven, pesaba 160, 170 así. Pero ya de repente fui bajando de peso, sí, pero nunca he estado gorda yo. Porque se te aceleró el metabolismo. Entonces, mi reina, esta medicina de Red Veins, como acelera el proceso de la producción de insulina natural del cuerpo, aunque comas lo que comas, no te eleva el nivel de azúcar en la sangre. Porque es tu páncreas que va a trabajar. Te lo pongo así de ejemplo de metabolismo para que veas. Porque es así, yo soy delgada, a veces quiero aumentar 10 libras, 15 libras y no puedo. Porque mi metabolismo es muy rápido, ¿tú ves? Entonces mira, con ese cuento, en vez que lo pagues en 300, te queda en 249,95. ¿Ok? Es una sola, Alicia, que te vas a tomar. Vas a ver que no sé cuándo tienes cita, me imagino que cada tres meses. Cada lunes, ¿verdad? ¿A los tres? Sí. Y ya la tengo para el mes, en ese mes el 21 la tengo en el doctor. Sí, al final del mes. Entonces, vamos a ir avanzado con el tratamiento. ¿Tú conoces la prueba A1C? No. Es una prueba donde se determina la diabetes que tienes. Yo sé que la doctora te la hace. ¿Ok? Porque yo cuando te chequean, pueden ver también una curva de cómo se ha comportado el azúcar en los últimos días. Entonces, este tratamiento está próximo para llegar el martes, que tendría tú alrededor de una o dos semanas con el producto. Entonces, la doctora ve la estabilidad, pero ella tiene después, al finalizar el tratamiento, que hacerte esa prueba. A1C es la prueba que determina la diabetes. Si estás en tipo 2, es una prueba de por ciento. Te voy a decir más o menos, a ver si te la he hecho yo alguna vez. Una persona normal tiene 5.7. Una persona con pre-diabetes está por encima de 5.7 a 6.4. Una con tipo 2 está por encima de 6.4. Una persona que pasa del por ciento A1C de 14 está tipo 1. Ese es la prueba de la insulina glicosilada. Se llama A1C. A1C. Ellos te hacen esa prueba. Al finalizar el tratamiento, debes hacerla. ¿Ok? Ahí es para que te deje trabajar la medicina. ¿Ok? ¿Qué le parece si le habla dentro de una semana? Porque ahorita no tengo para pagarlo. Ay, mi vida. El problema es que el descuento en el momento de la promoción y fuera de la promoción se cae. Ahí lo tendrías que pagar y si está chiquita de dinero, entonces hasta 10 dólares, como está la situación, es una ayuda de descuento. ¿Con qué tarjeta es que tú haces los pagos? No, yo no tengo tarjeta. Yo lo pago ahí directamente en el... ¿Tú puedes tomar una de predébito? ¿Tú puedes tomar una de predébito? Mi vida, la que tiene todo el mundo también te sirve. Si quiere, luego me habla porque el tratamiento no ha comido nada. Bueno, vamos a ayudarte entonces en ese caso. Si tú lo puedes pagar para la próxima semana, hacemos una infección para que lo puedas recibir entonces. Alicia. Sí, pues ahí habla en otra semana. Mi vida, o sea, el descuento que te consigo es para recibirlo para la próxima semana, que sería... Sí, pero ahorita no puedo porque acabo de pagar mi renta. Ahorita no tengo. Apenas voy a contar con el cheque y te voy a agarrar para la semana que entra. Sí, pero es para la semana que entra, que te va a llegar. No es ahora, para el miércoles o el jueves. Te lo voy a autorizar con mi código de especialista. Es lo más que puedo hacer para que te quede en el costo mínimo, para ver si puedes hacerle esfuerzo. Mira, ahí te quedaría con mi código de empleada en 169,95. Te queda todo el tratamiento. Estaría llegando para la fecha de martes o miércoles, 13 o 14. Para esa fecha, ¿tú crees que puedes sacarlo en el correo cuando te llegue? ¿Para cuándo? Miércoles o jueves de la próxima semana. Miércoles o jueves. De la próxima semana. ¿Y en cuánto dices? No, no, espérate, miércoles o jueves no. Martes 12, miércoles 13, 170 te llegaría. Son 3 francos de resbenz de 60 cápsulas cada uno. ¿En 170? Sí, en 170. Ahí te lo estoy poniendo con mi código de especialista, mi reina, ya para la recomendación sí te pido que me sea discreta con empresa. Conozco bien el resultado del producto. ¿Crees que contaría con el tiempo y el dinero para hacer el esfuerzo, para buscarlo para el 12 o el 13, cuando le llegue al correo? ¿En 170 dices? Sí, en 170 cerrarlo, mi reina. En 170. ¿No es eso que puedo pagarlo? Sí, mira, yo te lo estoy poniendo con mi código de especialista, ya tú sabes. Entonces, el departamento de confirmación y envío te llama en un rato, es una llamada de dos minutos para validar ese descuento. Ellos son los que validan que es en 170. Lo más que sabes es que ahorita después de que te acuerde contigo, no puedo agarrar llamadas aquí en el trabajo. ¿Y a qué hora es que tú, o sea, tú estás de break ahora? Ahorita estoy en break, ya he comido. ¿Y cuándo entras? Ahorita entro a las 12. ¿En cuánto tiempo? Entro como en, ya, yo creo, ya va a picar la raya, vamos, ya va a ir. Porque yo le digo que te llamen y es un minuto que duran contigo evaluándote para que te llamen rápido, nada más para confirmar el envío. ¿Oíste? Ve comiendo entonces. ¿Es breve? Ali, es breve. Dios te bendiga, mi reina.",
            "duracion": "00:15:00"

        };
    }
}
    
function getPrompt(text,part1, part2){
    const pemp_prompt =  part1 + text + part2;
    return pemp_prompt;        
}

let totalTokensUsedTurbo = 0;
let totalTokensUsedTurbo16k = 0;
let requestCount = 0;
let startTime = new Date().getTime();

//let useGpt35 = true;

const countTokens = (text) => {
    text = text.toLowerCase();
    let syllableCount = 0;
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    let vowelFound = false;
    
    for (const element of text) {
      if (vowels.includes(element)) {
        if (!vowelFound) {
          syllableCount++;
        }
        vowelFound = true;
      } else {
        vowelFound = false;
      }
    }
    return syllableCount;
};

const selectModel = (numTokens) => {
    if (numTokens < 4000) {
      return "gpt-3.5-turbo";
    } else if (numTokens >= 4000 && numTokens < 16000) {
      return "gpt-3.5-turbo-16k";
    } else {
      throw new Error("Número de tokens excede el límite permitido.");
    }
};

const callOpenAI = async (model, role, text ,part1, part2, audioFileName, operation, duracion) => {

    console.log("callOpenAI");

    const url = `https://api.openai.com/v1/chat/completions`;
    const headers = {
      'Authorization': `Bearer ${process.env.openTokn}`,
      'Content-Type': 'application/json',
    };
    
    console.log(model);
    
    const payload = {
        "model": model,
        "messages": [
            { role: 'system', content: role },
            { role: 'user', content: getPrompt(text, part1, part2) }
        ],
        "temperature": 0.2
    };
  
    try {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
  
        if (response.ok) {
          const jsonData = await response.json();
          addData(textCost(model, jsonData, audioFileName, operation, duracion));
          console.log(jsonData.choices[0].message.content);
          return extractJSON(jsonData.choices[0].message.content);
        } else {
          const errorData = await response.json();
          console.error(`Error ${response.status}`);
          console.log(errorData);
          return errorData;
        }
      } catch (error) {
        console.error(`Error en la llamada API: ${error}`);
        return { error: true, message: error.message };
      }
};

async function processPrompt (role, text ,part1, part2, audioFileName, operation, duracion){
    try {
      const numTokens = countTokens(text);
      const model = selectModel(numTokens);
  
      const currentTime = new Date().getTime();
      const timeElapsed = (currentTime - startTime) / 1000; // Tiempo transcurrido en segundos
  
      console.log(numTokens);
      console.log(model);
      console.log(currentTime);
      console.log(timeElapsed);

      if (requestCount >= 5000 && timeElapsed < 60) {
        await new Promise(resolve => setTimeout(resolve, (60 - timeElapsed) * 1000));
        requestCount = 0;
        startTime = new Date().getTime();
        console.log("primera condicion");
      }

      if (model === "gpt-3.5-turbo") {
        if (totalTokensUsedTurbo + numTokens > 90000 && timeElapsed < 60) {
          await new Promise(resolve => setTimeout(resolve, (60 - timeElapsed) * 1000));
          totalTokensUsedTurbo = 0;
          requestCount = 0;
          startTime = new Date().getTime();
          console.log("segunda condicion");
        }
      } else if (model === "gpt-3.5-turbo-16k") {
        if (totalTokensUsedTurbo16k + numTokens > 180000 && timeElapsed < 60) {
          await new Promise(resolve => setTimeout(resolve, (60 - timeElapsed) * 1000));
          totalTokensUsedTurbo16k = 0;
          requestCount = 0;
          startTime = new Date().getTime();
          console.log("tercera condicion");
        }
      }
  
      const response = await callOpenAI(model, role, text ,part1, part2, audioFileName, operation, duracion);
      if(response.error){
        console.log("error in process Prompt");
        return response;
      }
      if (response.usage) {
        if (model === "gpt-3.5-turbo") {
          totalTokensUsedTurbo += response.usage.total_tokens;
        } else {
          totalTokensUsedTurbo16k += response.usage.total_tokens;
        }
      }

      requestCount++;
      return response;

    } catch (error) {
      console.error(error);
    };
};
/*
async function processPrompt2(role, text, part1, part2, audioFileName, operation) {
    
    let data;
    let model;
    
    try {
        let payload = {
            model: useGpt35 ? 'gpt-3.5-turbo-16k' : 'gpt-4',
            messages: [
                { role: 'system', content: role },
                { role: 'user', content: getPrompt(text, part1, part2) }
            ],
            temperature: 0.2
        };
        
        let response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.openTokn}`
            },
            body: JSON.stringify(payload)
        });

        model = useGpt35 ? "GPT35" : "GPT4";
        
        if (!response.ok) {
            const errorData = await response.json();
            
            if (response.status === 429 && errorData.error && errorData.error.code === 'rate_limit_exceeded') {
                await sleep(60000); // Espera 1 minuto
                return await processPrompt(role, text, part1, part2, audioFileName, operation); // Intenta nuevamente
            }
            
            if (errorData.error) {
                if (errorData.error.code === "context_length_exceeded" || errorData.error.code === 'usage_limit_exceeded') {
                    if (model === 'GPT4') {
                        await sleep(60000); // Sleep for 1 minute
                        return await processPrompt(role, text, part1, part2, audioFileName, operation); // Retry
                    }
                    
                    // Cambia el modelo y reintenta
                    useGpt35 = !useGpt35;
                    return await processPrompt(role, text, part1, part2, audioFileName, operation);
                }
                
                throw new Error('Error en la respuesta de la API');
            }
        }

        data = await response.json();
        
        console.log("Procesando " + operation);
        console.log(data);

    } catch (error) {
        console.log('Error al analizar el texto: ' + error.message);
        return null;
    }
    
    addData(textCost(model, data, audioFileName, operation));
    
    // Cambia el modelo para el próximo intento
    useGpt35 = !useGpt35;

    console.log(data.choices[0].message.content);

    return extractJSON(data.choices[0].message.content);
}*/

function extractJSON(text) {
    const regex = /{[\s\S]*?}/; // Esta regex busca el contenido entre llaves { ... }
    const match = text.match(regex);
    if (match) {
        return match[0]; // Devuelve el primer resultado
    } else {
        return null; // Devuelve null si no encuentra ningún JSON
    }
}

function addData(jsonObject) {
    
    const audioName = jsonObject.audioName;
    
    if (audioName in gvars.invoice) {
        gvars.invoice[audioName].push(jsonObject);
    } else {
      gvars.invoice[audioName] = [jsonObject];
    }

    console.log(gvars.invoice);
}

function textCost(model, data, audioFileName, operation, duracion){

    let input, output, context, inputTokens, outputTokens;

    if (model == "gpt-3.5-turbo"){
            context = "4K";
            inputTokens = data.usage.prompt_tokens;
            input = inputTokens/1000 * gvars.cost35I4;
            outputTokens = data.usage.completion_tokens;
            output = outputTokens/1000 * gvars.cost35O4;
    }
    
    if (model == "gpt-3.5-turbo-16k"){
            context = "16K";
            inputTokens = data.usage.prompt_tokens;
            input = inputTokens/1000 * gvars.cost35I16;
            outputTokens = data.usage.completion_tokens;
            output = outputTokens/1000 * gvars.cost35O16;
    }

    if (model == "gpt-4"){
            context = "8K";
            inputTokens = data.usage.prompt_tokens;
            input = inputTokens/1000 * gvars.cost4I8;
            outputTokens = data.usage.completion_tokens;
            output = outputTokens/1000 * gvars.cost4O8;
    }
    
    if (model == "gpt-4-32k"){
        context = "32K";
        inputTokens = data.usage.prompt_tokens;
        input = inputTokens/1000 * gvars.cost4I32;
        outputTokens = data.usage.completion_tokens;
        output = outputTokens/1000 * gvars.cost4O32;
    }
    
    let costUSD = (input + output);

    console.log({
        "operation": operation,
        "duracion": duracion,
        "audioName": audioFileName,
        "model": model,
        "context": context,
        "inputTokens": inputTokens,
        "outputTokens": outputTokens,
        "inputCost": input,
        "outputCost": output,
        "totalTokens": inputTokens + outputTokens,
        "totalCost_USD": costUSD.toFixed(gvars.decimals),
        "totalCost_PEN": (costUSD.toFixed(gvars.decimals) * gvars.TC).toFixed(gvars.decimals)
    });

    return {
        "operation": operation,
        "duracion": duracion,
        "audioName": audioFileName,
        "model":model,
        "context": context,
        "inputTokens": inputTokens,
        "outputTokens": outputTokens,
        "inputCost": input,
        "outputCost": output,
        "totalTokens": inputTokens + outputTokens,
        "totalCost_USD": costUSD.toFixed(gvars.decimals),
        "totalCost_PEN": (costUSD.toFixed(gvars.decimals) * gvars.TC).toFixed(gvars.decimals)
    }
}

function audioCost(fileName, duration ,seconds){
    const roundedSeconds = Math.ceil(seconds);
    let costUSD = roundedSeconds/60 * gvars.whisperCost;

    console.log({
        "operation": "Audio a texto",
        "audioName": fileName,
        "duration": duration,
        "totalTokens": "-",
        "totalCost_USD": costUSD.toFixed(gvars.decimals),
        "totalCost_PEN": (costUSD.toFixed(gvars.decimals) * gvars.TC).toFixed(gvars.decimals)
    });
    return {
        "operation": "Audio a texto",
        "audioName": fileName,
        "duration": duration,
        "totalTokens": "-",
        "totalCost_USD": costUSD.toFixed(gvars.decimals),
        "totalCost_PEN": (costUSD.toFixed(gvars.decimals) * gvars.TC).toFixed(gvars.decimals)
    }
}

function randomValueFromArray() {
    arr = ["3","5","7","10"];
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

async function saludoInstitucional(text, audioFileName, duracion){

    if(gvars.prodEnv){

        let valor, comentario, parsedData;

        let detalles = obtenerDetallesTexto(audioFileName, "saludo_institucional");

        if (detalles) {
            valor = detalles.valor;
            comentario = detalles.comentario;
        } else {
            
            const result = await Promise.all([processPrompt(gvars.pemp_role, text, gvars.pemp_part1, gvars.pemp_part2, audioFileName, "Saludo Institucional", duracion)]);
            console.log("result");
            console.log(result);

            try{
                parsedData = JSON.parse(result);
            }
            catch(e){
                return result;
            }

            ({valor, comentario} = parsedData);
            valor = valor ? parseInt(valor) : "0";
            
            guardarAnalisisTexto(audioFileName, "saludo_institucional", valor, comentario);
        }

        return{
            "valor": valor,
            "comentario": comentario,
            "audioName": audioFileName
        };
    }
    else{
        return{
            "valor": randomValueFromArray(),
            "comentario": "El vendedor se presenta de manera formal e institucional al decir 'Hola, muy buenas tardes. Bienvenido a Productos Naturales Cariola. Mi nombre es Judith. ¿En qué puedo ayudarte hoy?'. Además, utiliza las palabras clave 'productos naturales' y 'medicamentos' al mencionar los paquetes disponibles."
        };
    }
}

async function empatiaSimpatia(text, audioFileName, duracion){
    
    if(gvars.prodEnv){
        let valor, comentario, parsedData;

        let detalles = obtenerDetallesTexto(audioFileName, "empatia_simpatia");

        if (detalles) {
            valor = detalles.valor;
            comentario = detalles.comentario;
        } else {
                
            const result = await Promise.all([processPrompt(gvars.emsi_role, text, gvars.emsi_part1, gvars.emsi_part2, audioFileName, "Empatia/Simpatia", duracion)]);
            console.log("result");
            console.log(result);

            try{
                parsedData = JSON.parse(result);
            }
            catch(e){
                return result;
            }
            
            ({valor, comentario} = parsedData);
            valor = valor ? parseInt(valor) : "0";

            guardarAnalisisTexto(audioFileName, "empatia_simpatia", valor, comentario);

        }

        return {
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return {
            "valor": randomValueFromArray(),
            "comentario": "El vendedor mostró empatía y simpatía de forma excepcional en su introducción. Demostró preocupación por el cliente y ofreció diferentes opciones para adaptarse a su presupuesto."
        };
    }
}

async function precalificacion(text, audioFileName, duracion){

    if(gvars.prodEnv){
    
        let valor, comentario, parsedData, edad, peso, estatura, tipoTrabajo, otrasEnfermedades, tratamientosQueConsume, productosTomaActualmente;

        let detalles = obtenerDetallesTexto(audioFileName, "precalificacion");

        if (detalles) {
            valor = detalles.valor;
            comentario = detalles.comentario;
            edad = detalles.edad;
            if(detalles.peso) { peso = detalles.peso;}
            if(detalles.estatura) { estatura = detalles.estatura;}
            if(detalles.tipoTrabajo) { tipoTrabajo = detalles.tipoTrabajo;}
            if(detalles.otrasEnfermedades) { otrasEnfermedades = detalles.otrasEnfermedades;}
            if(detalles.tratamientosQueConsume) { tratamientosQueConsume = detalles.tratamientosQueConsume;}
            if(detalles.productosTomaActualmente) { productosTomaActualmente = detalles.productosTomaActualmente;}
        } 
            
        else {
                
            const result = await Promise.all([processPrompt(gvars.prec_role, text, gvars.prec_part1, gvars.prec_part2, audioFileName, "Precalificación", duracion)]);
            
            try{
                console.log("result");
                console.log(result);

                try{
                    parsedData = JSON.parse(result);
                }
                catch(e){
                    return result;
                }
            
                ({valor, edad, peso, estatura, tipoTrabajo, otrasEnfermedades, tratamientosQueConsume, productosTomaActualmente, comentario} = parsedData);
                valor = valor ? parseInt(valor) : "0";

                guardarAnalisisTexto(audioFileName, "precalificacion", valor, comentario, {
                    "edad": edad,
                    "peso": peso,
                    "estatura": estatura,
                    "tipoTrabajo": tipoTrabajo,
                    "otrasEnfermedades": otrasEnfermedades,
                    "tratamientosQueConsume": tratamientosQueConsume,
                    "productosTomaActualmente": productosTomaActualmente
                });
            }
            catch(e){
                console.error(e)
            }    
        }

        return{
            "valor": valor,
            "comentario": comentario,
            "edad": edad,
            "peso": peso,
            "estatura": estatura,
            "tipoTrabajo": tipoTrabajo,
            "otrasEnfermedades": otrasEnfermedades,
            "tratamientosQueConsume": tratamientosQueConsume,
            "productosTomaActualmente": productosTomaActualmente
        };

    }
    else{    
        return{
            "valor": randomValueFromArray(),
            "comentario": "El vendedor no realizó ninguna de las preguntas mencionadas y se enfocó en ofrecer diferentes paquetes de productos.",
            "edad": "edad",
            "peso": "peso",
            "estatura": "estatura",
            "tipoTrabajo": "tipoTrabajo",
            "otrasEnfermedades": "otrasEnfermedades",
            "tratamientosQueConsume": "tratamientosQueConsume",
            "productosTomaActualmente": "productosTomaActualmente"
         };
    }
}

async function preguntasSubjetivas(text, audioFileName, duracion){
        
    if(gvars.prodEnv){
        
        let valor, comentario, parsedData;
        
        let detalles = obtenerDetallesTexto(audioFileName, "preguntas_subjetivas");

        if (detalles) {
            valor = detalles.valor;
            comentario = detalles.comentario;
        } else {

            const result = await Promise.all([processPrompt(gvars.preSub_role, text, gvars.preSub_part1, gvars.preSub_part2, audioFileName, "Preguntas subjetivas", duracion)]);
            
            console.log("result");
            console.log(result);

            try{
                parsedData = JSON.parse(result);
            }
            catch(e){
                return result;
            }
                
            ({valor, comentario} = parsedData);
            valor = valor ? parseInt(valor) : "0";
            
            guardarAnalisisTexto(audioFileName, "preguntas_subjetivas", valor, comentario);

        }
        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": randomValueFromArray(),
            "comentario": "El vendedor realizó al menos 4 preguntas subjetivas, como preguntar sobre los síntomas y ofrecer opciones de tratamiento, pero no mencionó ejemplos específicos."
        };
    }
}

async function etiquetaEnf(text, audioFileName, duracion){
    
    if(gvars.prodEnv){
        
        let valor, comentario, parsedData;
        
        let detalles = obtenerDetallesTexto(audioFileName, "etiqueta_enfermedad");

        if (detalles) {
            valor = detalles.valor;
            comentario = detalles.comentario;
        } else {

            const result = await Promise.all([processPrompt(gvars.etenf_role, text, gvars.etenf_part1, gvars.etenf_part2, audioFileName, "Etiqueta enfermedad", duracion)]);
            console.log("result");
            console.log(result);

            try{
                parsedData = JSON.parse(result);
            }
            catch(e){
                return result;
            }
                
            ({valor, comentario} = parsedData);
            valor = valor ? parseInt(valor) : "0";

            guardarAnalisisTexto(audioFileName, "etiqueta_enfermedad", valor, comentario);
        }

        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": randomValueFromArray(),
            "comentario": "El vendedor no etiqueta al cliente con ninguna enfermedad durante la conversación."
        };
    }
}

async function enfocEnf(text, audioFileName, duracion){

    if(gvars.prodEnv){

        let valor, comentario, parsedData;
        
        let detalles = obtenerDetallesTexto(audioFileName, "enfoque_enfermedad");

        if (detalles) {
            valor = detalles.valor;
            comentario = detalles.comentario;
        } else {
                
            const result = await Promise.all([processPrompt(gvars.enfenf_role, text, gvars.enfenf_part1, gvars.enfenf_part2, audioFileName, "Enfoque enfermedad", duracion)]);
            console.log("result");
            console.log(result);

            try{
                parsedData = JSON.parse(result);
            }
            catch(e){
                return result;
            }
                
            ({valor, comentario} = parsedData);
            valor = valor ? parseInt(valor) : "0";
            
            guardarAnalisisTexto(audioFileName, "enfoque_enfermedad", valor, comentario);
        }

        return {
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": randomValueFromArray(),
            "comentario": "El vendedor se enfoca en la enfermedad del cliente desde el principio de la conversación y ofrece diferentes opciones de paquetes que podrían ayudar a tratar los síntomas mencionados. Además, menciona que los productos naturales están diseñados para mejorar la calidad de vida de los pacientes."
        };
    }
}

async function tonoVoz(text, audioFileName, duracion){
        
    if(gvars.prodEnv){
        
        let valor, comentario, parsedData;
        
        let detalles = obtenerDetallesTexto(audioFileName, "tono_voz");

        if (detalles) {
            valor = detalles.valor;
            comentario = detalles.comentario;
        } else {

            const result = await Promise.all([processPrompt(gvars.tonoVoz_role, text, gvars.tonoVoz_part1, gvars.tonoVoz_part2, audioFileName, "Tono de voz", duracion)]);
            console.log("result");
            console.log(result);

            try{
                parsedData = JSON.parse(result);
            }
            catch(e){
                return result;
            } 
                
            ({valor, comentario} = parsedData);
            valor = valor ? parseInt(valor) : "0";
            
            guardarAnalisisTexto(audioFileName, "tono_voz", valor, comentario);
        }   

        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": randomValueFromArray(),
            "comentario": "El vendedor muestra preocupación por la enfermedad del cliente y utiliza un tono de voz claro y directo al ofrecerle diferentes opciones de paquetes que podrían ayudarlo."
        };
    }
}

async function conocimientoPatol(text, audioFileName, duracion){
        
    if(gvars.prodEnv){
        
        let valor, comentario, parsedData;
        
        let detalles = obtenerDetallesTexto(audioFileName, "conocimiento_patologia");

        if (detalles) {
            valor = detalles.valor;
            comentario = detalles.comentario;
        } else {

            const result = await Promise.all([processPrompt(gvars.conPatol_role, text, gvars.conPatol_part1, gvars.conPatol_part2, audioFileName, "Conoc. patología", duracion)]);
            console.log("result");
            console.log(result);

            try{
                parsedData = JSON.parse(result);
            }
            catch(e){
                return result;
            }
                
            ({valor, comentario} = parsedData);
            valor = valor ? parseInt(valor) : "0";
            
            guardarAnalisisTexto(audioFileName, "conocimiento_patologia", valor, comentario);
        }

        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": randomValueFromArray(),
            "comentario": "El vendedor demuestra conocimiento sobre la patología asociada a los síntomas del cliente al ofrecer diferentes opciones de paquetes que podrían ayudar en su situación."
        };
    }
}

async function datoDuro(text, audioFileName, duracion){
        
    if(gvars.prodEnv){
        
        let valor, comentario, parsedData;
        
        let detalles = obtenerDetallesTexto(audioFileName, "dato_duro");

        if (detalles) {
            valor = detalles.valor;
            comentario = detalles.comentario;
        } else {
                
            const result = await Promise.all([processPrompt(gvars.datoDuro_role, text, gvars.datoDuro_part1, gvars.datoDuro_part2, audioFileName, "Dato duro", duracion)]);
            console.log("result");
            console.log(result);

            try{
                parsedData = JSON.parse(result);
            }
            catch(e){
                return result;
            }
                
            ({valor, comentario} = parsedData);
            valor = valor ? parseInt(valor) : "0";
            
            guardarAnalisisTexto(audioFileName, "dato_duro", valor, comentario);
        }

        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": randomValueFromArray(),
            "comentario": "El vendedor no da a conocer información sobre la patología o dolencia del cliente"
        };
    }
}

async function testimonio(text, audioFileName, duracion){

    if(gvars.prodEnv){
        
        let valor, comentario, parsedData;
        
        let detalles = obtenerDetallesTexto(audioFileName, "testimonio");

        if (detalles) {
            valor = detalles.valor;
            comentario = detalles.comentario;
        } else {
                    
            const result = await Promise.all([processPrompt(gvars.testi_role, text, gvars.testi_part1, gvars.testi_part2, audioFileName, "Testimonio", duracion)]);
            console.log("result");
            console.log(result);

            try{
                parsedData = JSON.parse(result);
            }
            catch(e){
                return result;
            }
                
            ({valor, comentario} = parsedData);
            valor = valor ? parseInt(valor) : "0";

            guardarAnalisisTexto(audioFileName, "testimonio", valor, comentario);
        }

        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": randomValueFromArray(),
            "comentario": "El vendedor no menciona ningún testimonio al cliente."
        };
    }
}

async function solucionBeneficios(text, audioFileName, duracion){
        
    if(gvars.prodEnv){
        
        let valor, comentario, parsedData;
        
        let detalles = obtenerDetallesTexto(audioFileName, "solucion_beneficios");

        if (detalles) {
            valor = detalles.valor;
            comentario = detalles.comentario;
        } else {
                        
            const result = await Promise.all([processPrompt(gvars.solBen_role, text, gvars.solBen_part1, gvars.solBen_part2, audioFileName, "Solución beneficios", duracion)]);
            console.log("result");
            console.log(result);

            try{
                parsedData = JSON.parse(result);
            }
            catch(e){
                return result;
            }
                
            ({valor, comentario} = parsedData);
            valor = valor ? parseInt(valor) : "0";

            guardarAnalisisTexto(audioFileName, "solucion_beneficios", valor, comentario);
        }

        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": randomValueFromArray(),
            "comentario": "El vendedor da a conocer los beneficios del tratamiento que le proporciona al cliente y el contexto tiene mucha coherencia con la dolencia del cliente y sus síntomas."
        };
    }
}

async function respaldo(text, audioFileName, duracion){
    
    if(gvars.prodEnv){
        
        let valor, comentario, parsedData;
        
        let detalles = obtenerDetallesTexto(audioFileName, "respaldo");

        if (detalles) {
            valor = detalles.valor;
            comentario = detalles.comentario;
        } else {
                
            const result = await Promise.all([processPrompt(gvars.resp_role, text, gvars.resp_part1, gvars.resp_part2, audioFileName, "Respaldo", duracion)]);
            console.log("result");
            console.log(result);

            try{
                parsedData = JSON.parse(result);
            }
            catch(e){
                return result;
            }

            ({valor, comentario} = parsedData);
            valor = valor ? parseInt(valor) : "0";
            
            guardarAnalisisTexto(audioFileName, "respaldo", valor, comentario);
        }

        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": randomValueFromArray(),
            "comentario": "El vendedor no habla sobre la Trayectoria, Servicio, Calidad ni Profesionalismo de la empresa durante la conversación."
        };
    }
}

async function cierreVenta(text, audioFileName, duracion){

    if(gvars.prodEnv){

        let valor, comentario, parsedData;
        
        let detalles = obtenerDetallesTexto(audioFileName, "cierre_venta");

        if (detalles) {
            valor = detalles.valor;
            comentario = detalles.comentario;
        } else {
                
            const result = await Promise.all([processPrompt(gvars.cierre_role, text, gvars.cierre_part1, gvars.cierre_part2, audioFileName, "Cierre de venta", duracion)]);
            console.log("result");
            console.log(result);

            try{
                parsedData = JSON.parse(result);
            }
            catch(e){
                return result;
            }
                
            ({valor, comentario} = parsedData);
            valor = valor ? parseInt(valor) : "0";

            guardarAnalisisTexto(audioFileName, "cierre_venta", valor, comentario);
        }

        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": randomValueFromArray(),
            "comentario": "El vendedor encontró el momento adecuado para finalizar la venta y realizó el cobro al cliente, además utilizó el tipo de cierre 'Amarre invertido'."
        };
    }
}

async function comunicacionEfectiva(text, audioFileName, duracion){

    return{
        "valor": randomValueFromArray(),
        "comentario": "comentario Comunicación efectiva"
    };
}

async function conocimientoTratamiento(text, audioFileName, duracion){

    return{
        "valor": randomValueFromArray(),
        "comentario": "comentario Conocimiento del tratamiento"
    };
}

async function rebateObjeciones(text, audioFileName, duracion){

    return{
        "valor": randomValueFromArray(),
        "comentario": "comentario Rebaje de objeciones"
    };
}

async function analizarTextos(reqBody) {

    ({ audioFileName, auditor, grupo_vendedor, motivo, nombre_vendedor, tipo_campana, transcripcion, duracion } = reqBody);

    if (transcripcion == ""){
        console.error(`No existe transcripción del audio: ${audioFileName}`);
        return {"error": true, "message": "No existe transcripción del audio "+ audioFileName};
    } 
    
/*
    const resultados = await Promise.all([
        saludoInstitucional(transcripcion, audioFileName),
        empatiaSimpatia(transcripcion, audioFileName),
        precalificacion(transcripcion, audioFileName),
        preguntasSubjetivas(transcripcion, audioFileName),
        etiquetaEnf(transcripcion, audioFileName),
        enfocEnf(transcripcion, audioFileName),
        tonoVoz(transcripcion, audioFileName),
        conocimientoPatol(transcripcion, audioFileName),
        datoDuro(transcripcion, audioFileName),
        testimonio(transcripcion, audioFileName),
        solucionBeneficios(transcripcion, audioFileName),
        respaldo(transcripcion, audioFileName),
        cierreVenta(transcripcion, audioFileName),
        comunicacionEfectiva(transcripcion, audioFileName),
        conocimientoTratamiento(transcripcion, audioFileName),
        rebateObjeciones(transcripcion, audioFileName)
    ]);*/

    const funciones = [
        saludoInstitucional,
        empatiaSimpatia,
        precalificacion,
        preguntasSubjetivas,
        etiquetaEnf,
        enfocEnf,
        tonoVoz,
        conocimientoPatol,
        datoDuro,
        testimonio,
        solucionBeneficios,
        respaldo,
        cierreVenta,
        comunicacionEfectiva,
        conocimientoTratamiento,
        rebateObjeciones
    ];

    let promesas = [];
    let resultados1 = {}, resultados2 = {}, resultados3 = {}, resultados4 = {}, resultados5 = {}, resultados6 = {}, resultados7 = {}, resultados8 = {}, resultados9 = {}, resultados10 = {}, resultados11 = {}, resultados12 = {}, resultados13 = {}, resultados14 = {}, resultados15 = {}, resultados16 = {};

    for (let num of gvars.selectedProcesses) {
        switch(num) {
            case "1":
                resultados1 = await saludoInstitucional(transcripcion, audioFileName, duracion);
                resultados2 = await empatiaSimpatia(transcripcion, audioFileName, duracion);
                //promesas.push(...[funciones[0](transcripcion, audioFileName), funciones[1](transcripcion, audioFileName)]);
                break;
            case "2":
                resultados3 =  await precalificacion(transcripcion, audioFileName, duracion);
                resultados4 = await preguntasSubjetivas(transcripcion, audioFileName, duracion);
                //promesas.push(...[funciones[2](transcripcion, audioFileName), funciones[3](transcripcion, audioFileName)]);
                break;
            case "3":
                resultados5 = await etiquetaEnf(transcripcion, audioFileName, duracion);
                resultados6 = await enfocEnf(transcripcion, audioFileName, duracion);
                resultados7 = await tonoVoz(transcripcion, audioFileName, duracion);
                resultados8 = await conocimientoPatol(transcripcion, audioFileName, duracion);
                resultados9 = await datoDuro(transcripcion, audioFileName, duracion);
                //promesas.push(...[funciones[4](transcripcion, audioFileName), funciones[5](transcripcion, audioFileName), funciones[6](transcripcion, audioFileName), funciones[7](transcripcion, audioFileName), funciones[8](transcripcion, audioFileName)]);
                break;
            case "4":
                resultados10 = await testimonio(transcripcion, audioFileName, duracion);
                //promesas.push(...[funciones[9](transcripcion, audioFileName)]);
                break;
            case "5":
                resultados11 = await solucionBeneficios(transcripcion, audioFileName, duracion);
                //promesas.push(...[funciones[10](transcripcion, audioFileName)]);
                break;
            case "6":
                resultados12 = await respaldo(transcripcion, audioFileName, duracion);
                //promesas.push(...[funciones[11](transcripcion, audioFileName)]);
                break;
            case "7":
                resultados13 = await cierreVenta(transcripcion, audioFileName, duracion);
                //promesas.push(...[funciones[12](transcripcion, audioFileName)]);
                break;
            case "8":
                resultados14 = await comunicacionEfectiva(transcripcion, audioFileName, duracion);
                //promesas.push(...[funciones[13](transcripcion, audioFileName)]);
                break;
            case "9":
                resultados15 = await conocimientoTratamiento(transcripcion, audioFileName, duracion);
                //promesas.push(...[funciones[14](transcripcion, audioFileName)]);
                break;
            case "10":
                resultados16 = await rebateObjeciones(transcripcion, audioFileName, duracion);
                //promesas.push(...[funciones[15](transcripcion, audioFileName)]);
                break;
        }
    };

    //const resultados = await Promise.all(promesas);
    //console.log("resultados");
    //console.log(resultados);
/*
    if (!Array.isArray(resultados)) {
        console.error(`Error: resultados is not an array`);
        return {"error": true, "message": "Error: resultados is not an array", "response": resultados};
    }
      
    const hasError = resultados.some(subArray => {
        if (typeof subArray !== 'object' || subArray === null) {
            console.error(`Error: subArray is not an object`);
            return true;
        }
    
        if ('error' in subArray) {
            return true;
        }
      
        return false;
    });
    
    if (hasError) {
    console.error(`Error al Analizar Texto ${audioFileName}`);
    return {"error": true, "message": "Error al Analizar Texto "+ audioFileName, "response": resultados};
    }
    else {*/

        let mainData = {
            "Auditor": auditor,
            "Grupo": grupo_vendedor,
            "Motivo": motivo,
            "Asesor": nombre_vendedor,
            "Tipo_de_Campana": tipo_campana,
            "Fecha_Audio": currentDate(),
            "Nombre_Audio": audioFileName,
            "Duracion": duracion,
            "Transcripcion": transcripcion,
        };

        let result1=0, result2=0, result3=0, result4=0, result5=0, result6=0, result7=0, result8=0, result9=0, result10=0;

        if(gvars.selectedProcesses.includes("1")){ 
            result1 = puntuacion(resultados1.valor,resultados2.valor);
            
            mainData.Saludo_institucional = resultados1.valor,
            mainData.Simpatia_empatia = resultados2.valor;
            mainData.Res_Pres_Empatica = gvars.peso1+"%";
            mainData.ResFinal_Pres_Empatica = result1.toString()+"%";
            mainData.Saludo_institucional_comentario = resultados1.comentario;
            mainData.Simpatia_empatia_comentario = resultados2.comentario;
        };
        if(gvars.selectedProcesses.includes("2")){ 
            result2 = puntuacion(resultados3.valor,resultados4.valor);

            mainData.Precalificacion = resultados3.valor;
            mainData.Preguntas_subjetivas = resultados4.valor;
            mainData.Res_Calificacion = gvars.peso2.toString()+"%";
            mainData.ResFinal_Calificacion = result2.toString()+"%";
            mainData.Precalificacion_comentario = resultados3.comentario;
            mainData.Preguntas_subjetivas_comentario = resultados4.comentario;
        };
        if(gvars.selectedProcesses.includes("3")){ 
            result3 = puntuacion(resultados5.valor, resultados6.valor, resultados7.valor, resultados8.valor, resultados9.valor);

            mainData.Etiqueta_Enfermedad = resultados5.valor;
            mainData.Enfocarse_enfermedad = resultados6.valor;
            mainData.Tono_voz = resultados7.valor;
            mainData.Conocimiento_patologia = resultados8.valor;
            mainData.Dato_duro = resultados9.valor;
            mainData.Res_PanOscuro =  gvars.peso3.toString()+"%";
            mainData.ResFinal_PanOscuro = result3.toString()+"%";
            mainData.Etiqueta_Enfermedad_comentario = resultados5.comentario;
            mainData.Enfocarse_enfermedad_comentario = resultados6.comentario;
            mainData.Tono_voz_comentario = resultados7.comentario;
            mainData.Conocimiento_patologia_comentario = resultados8.comentario;
            mainData.Dato_duro_comentario = resultados9.comentario;
        };
        if(gvars.selectedProcesses.includes("4")){ 
            result4 = puntuacion(resultados10.valor);

            mainData.Testimonio = resultados10.valor;
            mainData.Res_Testimonio = gvars.peso4.toString()+"%";
            mainData.ResFinal_Testimonio = result4.toString()+"%";
            mainData.Testimonio_comentario = resultados10.comentario;
        };
        if(gvars.selectedProcesses.includes("5")){ 
            result5 = puntuacion(resultados11.valor);

            mainData.Solucion_beneficios = resultados11.valor;
            mainData.Res_SolBeneficios = gvars.peso5.toString()+"%";
            mainData.ResFinal_SolBeneficios = result5.toString()+"%";
            mainData.Solucion_beneficios_comentario = resultados11.comentario;
        };
        if(gvars.selectedProcesses.includes("6")){ 
            result6 = puntuacion(resultados12.valor);

            mainData.Respaldo = resultados12.valor,
            mainData.Res_Respaldo = gvars.peso6.toString()+"%";
            mainData.ResFinal_Respaldo = result6.toString()+"%";
            mainData.Respaldo_comentario = resultados12.comentario;

        };
        if(gvars.selectedProcesses.includes("7")){ 
            result7 = puntuacion(resultados13.valor);

            mainData.Cierre_venta = resultados13.valor;
            mainData.Res_CierreVenta = gvars.peso7.toString()+"%";
            mainData.ResFinal_CierreVenta = result7.toString()+"%";
            mainData.Cierre_venta_comentario = resultados13.comentario;

        };
        if(gvars.selectedProcesses.includes("8")){ 
            result8 = resultados14.valor;

            mainData.Comunicacion_efectiva = resultados14.valor;
            mainData.Comunicacion_efectiva_comentario = resultados14.comentario;
            

        };
        if(gvars.selectedProcesses.includes("9")){ 
            result9 = resultados15.valor;

            mainData.Concimiento_tratamiento = resultados15.valor;
            mainData.Concimiento_tratamiento_comentario = resultados15.comentario;
            

        };
        if(gvars.selectedProcesses.includes("10")){ 
            result10 = resultados16.valor;

            mainData.Rebate_objeciones = resultados16.valor;
            mainData.Rebate_objeciones_comentario = resultados16.comentario;


        };

        /*
        const result1 = puntuacion(resultados[0].valor,resultados[1].valor);
        const result2 = puntuacion(resultados[2].valor,resultados[3].valor);
        const result3 = puntuacion(resultados[4].valor, resultados[5].valor, resultados[6].valor, resultados[7].valor, resultados[8].valor);
        const result4 = puntuacion(resultados[9].valor);
        const result5 = puntuacion(resultados[10].valor);
        const result6 = puntuacion(resultados[11].valor);
        const result7 = puntuacion(resultados[12].valor);
        const result8 = resultados[13].valor;
        const result9 = resultados[14].valor;
        const result10 = resultados[15].valor;
        */

        const etapasVenta = (gvars.peso1 * result1/100) + (gvars.peso2*result2/100) + (gvars.peso3*result3/100) + (gvars.peso4*result4/100) + (gvars.peso5*result5/100) + (gvars.peso6*result6/100) + (gvars.peso7*result7/100)
        const habComerciales = puntuacion(result8, result9, result10);

        let resCal = (etapasVenta+habComerciales)/2;

        const formattedString = `AUD POR ${auditor} // PEMP-${gvars.peso1*result1 / 100}% CAL-${gvars.peso2*result2 / 100}% P.OSC-${gvars.peso3*result3 / 100}% 
                TEST-${gvars.peso4*result4 / 100}% S.BEN-${gvars.peso5*result5 / 100}% RESP-0${gvars.peso6*result6 / 100}% C.VENT-0${gvars.peso7*result7 / 100}% C.EFE-${result8}% 
                C.TRA-${result9}% R.OBJ-${result10}%`;

        
        mainData.Resumen = formattedString;
        mainData.Etapas_Venta = etapasVenta.toFixed(2).toString()+"%";
        mainData.Habil_comerciales = habComerciales.toFixed(2).toString()+"%";
        mainData.Resultado_Calibracion = resCal.toFixed(2).toString()+"%";

        return mainData;
        /*
        return {
            "Auditor": auditor,
            "Grupo": grupo_vendedor,
            "Motivo": motivo,
            "Asesor": nombre_vendedor,
            "Tipo_de_Campana": tipo_campana,
            "Fecha_Audio": currentDate(),
            "Nombre_Audio": audioFileName,
            "Duracion": duracion,
            "Resumen": formattedString,
            "Transcripcion": transcripcion,

            "Saludo_institucional": resultados[0].valor,
            "Simpatia_empatia": resultados[1].valor,
            "Res_Pres_Empatica": gvars.peso1+"%",
            "ResFinal_Pres_Empatica": result1.toString()+"%",
            "Saludo_institucional_comentario": resultados[0].comentario,    
            "Simpatia_empatia_comentario": resultados[1].comentario, 

            "Precalificacion": resultados[2].valor,
            "Preguntas_subjetivas": resultados[3].valor,
            "Res_Calificacion": gvars.peso2.toString()+"%",
            "ResFinal_Calificacion": result2.toString()+"%",
            "Precalificacion_comentario": resultados[2].comentario, 
            "Preguntas_subjetivas_comentario": resultados[3].comentario, 
            
            "Etiqueta_Enfermedad": resultados[4].valor,
            "Enfocarse_enfermedad": resultados[5].valor,
            "Tono_voz": resultados[6].valor,
            "Conocimiento_patologia": resultados[7].valor,
            "Dato_duro": resultados[8].valor,
            "Res_PanOscuro":  gvars.peso3.toString()+"%",
            "ResFinal_PanOscuro": result3.toString()+"%",
            "Etiqueta_Enfermedad_comentario": resultados[4].comentario, 
            "Enfocarse_enfermedad_comentario": resultados[5].comentario, 
            "Tono_voz_comentario": resultados[6].comentario, 
            "Conocimiento_patologia_comentario": resultados[7].comentario, 
            "Dato_duro_comentario": resultados[8].comentario, 
            
            "Testimonio": resultados[9].valor,
            "Res_Testimonio": gvars.peso4.toString()+"%",
            "ResFinal_Testimonio": result4.toString()+"%",
            "Testimonio_comentario": resultados[9].comentario, 
            
            "Solucion_beneficios": resultados[10].valor,
            "Res_SolBeneficios": gvars.peso5.toString()+"%",
            "ResFinal_SolBeneficios": result5.toString()+"%",
            "Solucion_beneficios_comentario": resultados[10].comentario, 
            
            "Respaldo": resultados[11].valor,
            "Res_Respaldo": gvars.peso6.toString()+"%",
            "ResFinal_Respaldo": result6.toString()+"%",
            "Respaldo_comentario": resultados[11].comentario, 
            
            "Cierre_venta": resultados[12].valor,
            "Res_CierreVenta": gvars.peso7.toString()+"%",
            "ResFinal_CierreVenta": result7.toString()+"%",
            "Cierre_venta_comentario": resultados[12].comentario, 
            
            "Comunicacion_efectiva": resultados[13].valor,
            "Comunicacion_efectiva_comentario": resultados[13].comentario, 
            
            "Concimiento_tratamiento": resultados[14].valor,
            "Concimiento_tratamiento_comentario": resultados[14].comentario, 
            
            "Rebate_objeciones": resultados[15].valor,
            "Rebate_objeciones_comentario": resultados[15].comentario, 

            "Etapas_Venta": etapasVenta.toString()+"%",
            "Habil_comerciales": habComerciales.toString()+"%",
            "Resultado_Calibracion": resCal.toString()+"%"
        };*/
    //}
}

function calcularPromedio(datos, clave) {
    
    if (datos.length === 0) return "0";
    
    let suma = datos.reduce((acumulador, item) => {
        let valorNumerico = parseFloat(item[clave]);
        return !isNaN(valorNumerico) ? acumulador + valorNumerico : acumulador;
    }, 0);

    let promedio = suma / datos.length;

    return (suma === 0 || datos.length === 0) ? "0" : Math.round(promedio);
}

function promedioSimple(numerosEnString) {
    // Verificar si el array está vacío
    if (numerosEnString.length === 0) return "0.00";

    // Convertir cada string a número y sumarlos
    let suma = numerosEnString.reduce((acumulador, numeroStr) => {
        let numero = parseFloat(numeroStr);
        return acumulador + numero;
    }, 0);

    // Calcular el promedio
    let promedio = suma / numerosEnString.length;

    // Retornar el resultado con dos decimales en formato string
    return promedio.toFixed(2);
}


module.exports = {
    analizarTextos,
    puntuacion,
    currentDate,
    convertDateFormat,
    calcularPromedio,
    getColumnLetter,
    transformDateFormat,
    audioToText,
    promedioSimple
};