
const { Logger } = require('aws-amplify');
const gvars = require('../utils/const.js');
const FormData = require('form-data');
const { error } = require('console');
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
    // Extraer y retornar las letras de la clave de la celda (por ejemplo, "AB" de "AB42")
    const match = cellKey.match(/[A-Z]+/);
    return match ? match[0] : null;
}

function transformDateFormat(dateStr) {
    // Convertir "09/18/2023 22:08:15" a "_09182023_220815"
    return dateStr.replace(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/, '$2$1$3_$4$5$6');
}
function convertDateFormat(dateString) {
    // Divide la fecha y la hora
    const parts = dateString.split(' ');

    // Divide la fecha en día, mes y año
    const dateParts = parts[0].split('/');

    // Une el año, mes y día
    const formattedDate = dateParts[2] + dateParts[1] + dateParts[0];

    // Reemplaza el ":" en la hora para obtener el formato deseado
    const formattedTime = parts[1].replace(/:/g, '');

    // Devuelve el formato deseado
    return formattedDate + '_' + formattedTime;
}
function puntuacion(...numeros) {
    let sum = 0;
    let count = 0;

    for(let num of numeros) {
        if (num) {
            num = parseInt(num);
            if (!isNaN(num)) { // Aseguramos que no sea NaN después de convertirlo
                sum += num;
                count++;
            }
        }
    }
    if (count === 0) return 0;
    return (sum / count) * 10;
}

function showLoadingIcon() {
    document.getElementById('loading-icon').style.display = 'inline-block';
    document.getElementById('complete-icon').style.display = 'none';
}

function showCompleteIcon() {
    document.getElementById('loading-icon').style.display = 'none';
    document.getElementById('complete-icon').style.display = 'inline-block';
}

function getAudioDurationInSecs(blob) {
    return new Promise((resolve, reject) => {
        const audio = new Audio(URL.createObjectURL(blob));
        audio.onloadedmetadata = function() {
            resolve(audio.duration);
        };
        audio.onerror = function() {
            reject('Error al cargar el archivo de audio.');
        };
    });
}

async function audioToText(audioFile, duracion, durationInSeconds) {

    console.log("Transformando audio");
    console.log(audioFile);

    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioFile.path),{ 
        filename: 'cariola_audioprueba.mp3',
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
    let texto = "";

    if(gvars.prodEnv){

        try {
            const response = await fetch('https://api.openai.com/v1/audio/transcriptions', requestOptions);
            transcripcion = await response.json();
            texto = transcripcion.text;

            console.log("Response: ", response);
        
            fs.unlinkSync(audioFile.path);

        } catch (error) {
            console.error('Error:', error);
        }
        
        addData(audioCost(audioFile.originalname, duracion, durationInSeconds));
        
        return {
            text: texto
        };
    }
    else{  
        return {
            text: "Buenas. Muy buenas tardes Alicia, ¿cómo estás? Bien. Qué bueno, me da mucho gusto saludar que te llegó la orden. Sí. Excelente. ¿Cuántos días tiene tomándose el tratamiento? Dos, tres, como cuatro días, cinco días, como media semana. ¿Media semana? Ajá. Ok mi amor, ¿ha visto algún cambio ya positivo? No, ahorita no. Ya me duelen mis dedos. ¿Te duelen los dedos? Ajá. Ok, ¿tú tienes artritis, Alicia? No sé, no me han dicho, pero creo que sí. Ok, salvo FLEX, tú sabes que contiene colágeno que te va a ayudar a desinflamar y poco a poco, como es un tratamiento natural, va a ir sacando la inflamación y va a ir quitando el dolor. ¿Tienes algún dedito chueco? No, nada más así como con bolas. ¿Bolas? Eso es la inflamación de la membrana sinovial del líquido, el líquido se sale. Esa inflamación es la que te tiene así, con dolor y los dedos rígidos. Te sientes rígido, ¿es solamente en los dedos o hay alguna otra coyuntura que te ha afectado? No, nada más los dedos. Los dedos, ¿cuántos libros estás pesando, Alicia? Peso 142. ¿Y la estatura tuya, mi amor, cuánto es? Cinco. Cinco, vamos a ver. Tienes un poquito de sobrepeso, ¿verdad? ¿Cuánto debería ser el peso normal, sabes? ¿Te ha dicho tu médico? No, no me ha dicho que estoy sobrepeso. Si me está dando bien tus medidas, sí. ¿Peso normal para tu tamaño deberían ser 130 libras? ¿Cuántos años tienes? 50. Pero tú tienes una voz muy engañosa, Alicia. Se escucha como una muchachita, se escucha muy joven. Siempre se lo dice la gente, ¿verdad? Sí. Aparte del tratamiento para la inflamación de las articulaciones, ¿estás tomando algo más? ¿Indicado por el médico? ¿Cómo? ¿Estás tomando algún tratamiento recetado por el doctor? No, nada más para la diabetes. ¿Nada más para la diabetes? ¿Y qué tiempo tiene con diabetes? Hace como dos años. ¿Estás usando insulina o metformina? Metformina. ¿De 500? Ajá. ¿De 500 una vez o dos veces? ¿Cómo? ¿Una vez o dos veces al día tomas la metformina? Dos veces al día. Ok, entonces todavía tienes diabetes tipo 2, Alicia. Es la menos mala. La diabetes puede avanzar o puede retroceder. Así como puede bajarte a que esté normal, puede avanzar a degenerarse a tipo 1. Todavía estás a tiempo de estimular el páncreas para detener el avance de la diabetes. Sabes que la diabetes es degenerativa, progresiva. Y lamentablemente el uso prolongado de esa medicina puede dañar el hígado y los riñones. ¿Algún deterioro en algún órgano del cuerpo? No. Hasta ahora, gracias a Dios. Todo bien, gracias a Dios. Hay que mantenerse así. ¿El nivel de azúcar en la mañana en cuánto te aparece? ¿Tú te la checas? En 30. ¿En 30? A veces en 111. Ok, entonces usted está... Usted está regulada, Alicia. O sea que todavía estimulando el páncreas se normaliza. La única diabetes que no tiene solución y no tiene vuelta atrás es la diabetes mellitus. Tú sabes que hay diferentes tipos de diabetes, ¿verdad? Sí. La diabetes mellitus, que es la mala, que es la tipo 1 o la tipo 2 la que tiene, la diabetes estacional que da en el embarazo. Y hay pacientes que están prediabéticos que a veces nunca se les desarrolla la diabetes tipo 2. Entonces, el tratamiento para la páncreas se llama REVENSI para pacientes tipo 2 y prediabéticos. Esto lo que hace es estimular la célula beta del páncreas para ayudar con la producción de insulina de manera natural. Entonces, esto te ayuda a que el páncreas, o sea tu órgano, que ahora mismo no está produciendo insulina 100%, empiece a funcionar de una mejor manera. Entonces, eso te ayuda a que te regules sin necesidad de medicina. O sea que poco a poco tu propio médico te va a ir quitando el medicamento. Lo primero es bajar a prediabetes. Ya después que estés en prediabetes estamos a un paso a que estés normal. Y puedes lograr porque tú estás regulada, mi amor. Si usted tuviera mal, sí no, pero usted tiene diabetes tipo 2. Anota el nombre del tratamiento, Alicia. Se llama REVENSI. Le toma una sola de ese. Y apenas tiene 2 años, mi amor. Eso no se te ha desarrollado todavía. A veces tú vas al médico y se te sube el azúcar un día y el médico te manda pastillas de por vida. En vez de decirte, haga una dieta, cuídate, tómate esto, tómate lo otro, y ya. Pero te manda medicina y el cuerpo se va acostumbrando al químico. Hay muchas personas que se han tomado el tratamiento y que a los 3 meses ya están normales. Y como tú sabes que si tú estás bien, la medicina química te puede bajar mucho el azúcar y eso también es peligroso. El azúcar es muy bajita. Entonces tengo personas que el médico automáticamente le quitó la medicina. Ya no la pueden beber porque no la necesitan. Eso es muy fuerte. Entonces ya que el páncreas trabaja, si se toman esa medicina le bajaría demasiado y eso es peligroso. Tengo pacientes que ya no. El mismo médico se la quitó porque entonces se la baja mucho ya. O sea que ya no la necesitan y tú puedes entrar ahí porque tú estás controlada. Anota el nombre del tratamiento, Alisa, para que te lo empieces a tomar en ayunas. Dime, amor. ¿Cuál es la diferencia del azúcar? Ese es nuestro laboratorio. Nosotros, aparte de los tratamientos para los dolores y la inflamación, tenemos más de 30 productos para el cuidado de la salud. Esa es para la diabetes tipo 2 o prediabética. Se llama Revense. ¿Y eso cuánto sale? Ese tratamiento del azúcar sale en $299,95. Es un tratamiento, sí, claro que es caro, mi amor. No es un tratamiento paliativo. Los tratamientos paliativos son los que te alivian el momento y al finalizar el tratamiento vuelve usted con lo mismo y tiene que estar tomando medicina de por vida. Eso es un tratamiento, un solo tratamiento. Viene por seis meses porque se toma una sola cápsula diario y eso no es simplemente para regular el azúcar en la sangre. Eso es para que tu páncreas, si tú has buscado o has leído un poquito, sabes, que el órgano que produce insulina naturalmente en el cuerpo se llama páncreas y que eso es lo que no te está funcionando bien. Este tratamiento es para ese órgano. Entonces ya funcionando tu órgano en mayor capacidad, controla solo el azúcar en la sangre sin necesidad de pastillas. Es un tratamiento para la páncreas, no simplemente para limpiarle la sangre. La pastilla de metformina, ¿qué hace? Regula el azúcar en la sangre. Regula. O sea, no es un tratamiento para tu páncreas, sino para regular lo que ya hay en la sangre. Este tratamiento es para evitar que el azúcar se suba. ¿Y yo si no lo puedo encontrar aquí como en los naturistas? Ah, no, no, mi vida, ese tratamiento es de nosotros, del laboratorio de Svense. Y en este caso sale 299.95 porque era un paciente con dos años de diabetes. Tú todavía, gracias a papá Dios, está controlada, no tiene daños severos de hígado, riñón y eso. Porque un paciente ya más avanzado con daños severos de órgano, tú sabes que lleva un medicamento más agresivo, más medicamento, más tiempo. En el caso tuyo, no. Yo te voy a poner un descuento para personas de bajos recursos. Pero vas a ver el cambio, porque te lo digo, porque teníamos un paciente que vino con diabetes tipo 2 y el señor tenía 30 años con la enfermedad, tomando pastillas. Y siempre estaba el señor como controlado. Él se veía, se picaba el azúcar 110, 112, 90 en la mañana y se tomó el tratamiento. En el 2017, el señor tiene todos esos años que no usa medicina. Realmente, usted se le subió una vez el azúcar y el médico automáticamente lo diagnosticó con la enfermedad. Porque si ya tenía diabetes desarrollada, ¿tú crees que ese señor con dos meses de tratamiento ya le estaba bien y ya no se podía tomar la pastilla porque se ponía muy bajita su azúcar? El médico se la quitó rotundamente y el señor a la fecha se mantiene controlado. Estaba sobrepeso, bajó. Bajó también de peso, tenía como 40 libras de más. Que también eso le ayudó muchísimo en su proceso. Yo sé que tú no bajaste de peso. ¿Usted quiere decir que estoy subida de peso? No, no, no. Tú no estás subida de peso. Tú nada más tienes unas libritas de más, mi vida. No, te digo el señor que estaba subido de peso. No, pero yo digo, ¿cuánto es lo que tendría que pesar? Tú, para 5, para el tamaño de 5 serían 130. Pero eso sí es también la medida que tú me estás dando porque yo no sé realmente. Yo voy de acuerdo a lo que tú me dices. Pero si tú entiendes que tienes una pancita por ahí, abdomen, que lo tienes un poquito crecido, ¿sí tienes quien te varíe? Pues no, no tengo, así nunca he tomado uno. Entonces tú no tienes sobrepeso, hay algo mal con la medida entonces. A lo mejor es 5 o 2, no me acuerdo la medida. A lo mejor es 5 o 2. Pero de qué 5, pasa casi todos 5, pero no es. Sí, pero que tú sabes que hay que tener lo correcto porque yo lo meto en un aparatico aquí que me da si es sobrepeso, cuánta libra tiene demás y todo eso. Pero para eso necesito la medida exacta, si sea 5 o 2, 5 o 2 o 5 o 3. Es la única manera de uno saber si estás bien o si yo te estoy diciendo lo correcto. La última vez que me me dio la doctora hace meses que fueron 5 o 2. 5 o 2. Entonces si tú tienes 5 o 2, tú dijiste que eran 145. Sí, a pesos 142, pero yo creo que como depende también porque los zapatos, me peso y peso 143 y me quito los zapatos y peso 141, así. Ah, no, eso es por la ropa. Tú mides, tú pesas como 140, no, si tienes 5 o 2, mi amor, está bien, depende del peso, estás en el peso. Pero eso el doctor no te ha dicho nada, estás en el peso. Tienes que tener, como con ropa y sin ropa es diferente, tienes que tener como 140 libras o 141, estás bien. Si es 5 o 2, estás perfecta y eso te ayuda muchísimo a que se mejore muchísimo más rápido cuando tú tienes sobrepeso. Mira, cuando hay un bebé, si tú has tenido niños, para darle medicamento lo pesan porque la cantidad de medicamento va de acuerdo al peso. Entonces, si te mandan un medicamento, como se lo mandan a todo el mundo, y tú tienes, por ejemplo, sobrepeso, no te va a trabajar igual porque hay más volumen del cuerpo, ¿tú ves? Aunque sea el que no tiene enfermedad. Oí un doctor que estaba hablando, un doctor de aquí del BIDOBIDO, pero hay de Tijuana, que estaba diciendo que esas pastillas que le dan a uno para la diabetes, no le tienen que dar los doctores simplemente la misma pastilla a todo el paciente que tiene diabetes. Exacto. Porque la pastilla, el paciente tiene que ser pesado, medido. Exacto. Y aquí no, aquí nomás le dicen nomás que le sale el aceite de araita y luego le dan a uno la pastilla. Y créeme que nosotros con tantos pacientes que tenemos, latinos, que tienen sus soluciones naturales con nosotros, es lo mismo. Y todos los días tratamos los mismos casos sin saber cuánto mide, cuánto pesa el paciente. Le mandan la misma medicina, los mismos miligramos. Hay gente que no me está haciendo nada la pastilla. Y el médico le cambia para insulina. A mí ya me la quería dar, a mí ya me la quería dar la insulina al doctor. Pero le dije no, le dije yo no quiero eso. Porque si yo quiero, yo no puedo controlar el azúcar. Simplemente nomás que hay veces que uno come cosas. Desarreglo. Pues no le digo de comer. Pero bueno, ya con la del pancrea evitamos que se siga deteriorando, porque el doctor manda insulina cuando la azúcar ya la pastilla no la puede controlar en la sangre. ¿Entiendes? Entonces con este tratamiento tú vas a ayudar a tu páncreas para que se estimule. Porque a veces tú haces desarreglo o no puedes hacer la dieta por X o por Y y se puede subir. Pero si ya el páncreas está produciendo más insulina, el azúcar no se va a disparar. Porque eso es como el metabolismo. Es como el metabolismo. Por ejemplo, yo tengo metabolismo rápido, yo puedo comer lo que sea. Yo puedo comer puerco, puedo comer vaca, lo que sea. Yo no aumento de peso. Coma una loma, mi metabolismo está acelerado. Así estoy yo, así como comidas pues, mis tres comidas y no he aumentado de peso. Mi peso que antes tenía, antes como más joven, pesaba 160, 170 así. Pero ya de repente fui bajando de peso, sí, pero nunca he estado gorda yo. Porque se te aceleró el metabolismo. Entonces, mi reina, esta medicina de Red Veins, como acelera el proceso de la producción de insulina natural del cuerpo, aunque comas lo que comas, no te eleva el nivel de azúcar en la sangre. Porque es tu páncreas que va a trabajar. Te lo pongo así de ejemplo de metabolismo para que veas. Porque es así, yo soy delgada, a veces quiero aumentar 10 libras, 15 libras y no puedo. Porque mi metabolismo es muy rápido, ¿tú ves? Entonces mira, con ese cuento, en vez que lo pagues en 300, te queda en 249,95. ¿Ok? Es una sola, Alicia, que te vas a tomar. Vas a ver que no sé cuándo tienes cita, me imagino que cada tres meses. Cada lunes, ¿verdad? ¿A los tres? Sí. Y ya la tengo para el mes, en ese mes el 21 la tengo en el doctor. Sí, al final del mes. Entonces, vamos a ir avanzado con el tratamiento. ¿Tú conoces la prueba A1C? No. Es una prueba donde se determina la diabetes que tienes. Yo sé que la doctora te la hace. ¿Ok? Porque yo cuando te chequean, pueden ver también una curva de cómo se ha comportado el azúcar en los últimos días. Entonces, este tratamiento está próximo para llegar el martes, que tendría tú alrededor de una o dos semanas con el producto. Entonces, la doctora ve la estabilidad, pero ella tiene después, al finalizar el tratamiento, que hacerte esa prueba. A1C es la prueba que determina la diabetes. Si estás en tipo 2, es una prueba de por ciento. Te voy a decir más o menos, a ver si te la he hecho yo alguna vez. Una persona normal tiene 5.7. Una persona con pre-diabetes está por encima de 5.7 a 6.4. Una con tipo 2 está por encima de 6.4. Una persona que pasa del por ciento A1C de 14 está tipo 1. Ese es la prueba de la insulina glicosilada. Se llama A1C. A1C. Ellos te hacen esa prueba. Al finalizar el tratamiento, debes hacerla. ¿Ok? Ahí es para que te deje trabajar la medicina. ¿Ok? ¿Qué le parece si le habla dentro de una semana? Porque ahorita no tengo para pagarlo. Ay, mi vida. El problema es que el descuento en el momento de la promoción y fuera de la promoción se cae. Ahí lo tendrías que pagar y si está chiquita de dinero, entonces hasta 10 dólares, como está la situación, es una ayuda de descuento. ¿Con qué tarjeta es que tú haces los pagos? No, yo no tengo tarjeta. Yo lo pago ahí directamente en el... ¿Tú puedes tomar una de predébito? ¿Tú puedes tomar una de predébito? Mi vida, la que tiene todo el mundo también te sirve. Si quiere, luego me habla porque el tratamiento no ha comido nada. Bueno, vamos a ayudarte entonces en ese caso. Si tú lo puedes pagar para la próxima semana, hacemos una infección para que lo puedas recibir entonces. Alicia. Sí, pues ahí habla en otra semana. Mi vida, o sea, el descuento que te consigo es para recibirlo para la próxima semana, que sería... Sí, pero ahorita no puedo porque acabo de pagar mi renta. Ahorita no tengo. Apenas voy a contar con el cheque y te voy a agarrar para la semana que entra. Sí, pero es para la semana que entra, que te va a llegar. No es ahora, para el miércoles o el jueves. Te lo voy a autorizar con mi código de especialista. Es lo más que puedo hacer para que te quede en el costo mínimo, para ver si puedes hacerle esfuerzo. Mira, ahí te quedaría con mi código de empleada en 169,95. Te queda todo el tratamiento. Estaría llegando para la fecha de martes o miércoles, 13 o 14. Para esa fecha, ¿tú crees que puedes sacarlo en el correo cuando te llegue? ¿Para cuándo? Miércoles o jueves de la próxima semana. Miércoles o jueves. De la próxima semana. ¿Y en cuánto dices? No, no, espérate, miércoles o jueves no. Martes 12, miércoles 13, 170 te llegaría. Son 3 francos de resbenz de 60 cápsulas cada uno. ¿En 170? Sí, en 170. Ahí te lo estoy poniendo con mi código de especialista, mi reina, ya para la recomendación sí te pido que me sea discreta con empresa. Conozco bien el resultado del producto. ¿Crees que contaría con el tiempo y el dinero para hacer el esfuerzo, para buscarlo para el 12 o el 13, cuando le llegue al correo? ¿En 170 dices? Sí, en 170 cerrarlo, mi reina. En 170. ¿No es eso que puedo pagarlo? Sí, mira, yo te lo estoy poniendo con mi código de especialista, ya tú sabes. Entonces, el departamento de confirmación y envío te llama en un rato, es una llamada de dos minutos para validar ese descuento. Ellos son los que validan que es en 170. Lo más que sabes es que ahorita después de que te acuerde contigo, no puedo agarrar llamadas aquí en el trabajo. ¿Y a qué hora es que tú, o sea, tú estás de break ahora? Ahorita estoy en break, ya he comido. ¿Y cuándo entras? Ahorita entro a las 12. ¿En cuánto tiempo? Entro como en, ya, yo creo, ya va a picar la raya, vamos, ya va a ir. Porque yo le digo que te llamen y es un minuto que duran contigo evaluándote para que te llamen rápido, nada más para confirmar el envío. ¿Oíste? Ve comiendo entonces. ¿Es breve? Ali, es breve. Dios te bendiga, mi reina."
        };
    }
}
    
function getPrompt(text,part1, part2){
    const pemp_prompt =  part1 + text + part2;
    return pemp_prompt;        
}

let useGpt35 = true;

async function processPrompt(role, text, part1, part2, audioFileName, operation) {
    console.log("Procesando prompt")
    let data;
    let model;
    
    try {
        let payload = {
            model: useGpt35 ? 'gpt-3.5-turbo' : 'gpt-4',
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
    } catch (error) {
        console.log('Error al analizar el texto: ' + error.message);
        return null;
    }
    
    addData(textCost(model, data, audioFileName, operation));
    
    // Cambia el modelo para el próximo intento
    useGpt35 = !useGpt35;

    console.log(data.choices[0].message.content);

    return extractJSON(data.choices[0].message.content);
}

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
    console.log("Invoice")

    const audioName = jsonObject.audioName;
    
    // Si la llave ya existe en el diccionario, añade el objeto al array existente
    if (audioName in gvars.invoice) {
        gvars.invoice[audioName].push(jsonObject);
    } else {
      // Si la llave no existe, crea un nuevo array con el objeto JSON
      gvars.invoice[audioName] = [jsonObject];
    }

    console.log(gvars.invoice);
}

function textCost(model, data, audioFileName, operation){
    console.log("Analizando costo de procesar texto");

    let input, output, context, inputTokens, outputTokens;

    if (model == "GPT35"){
        if (data.usage.prompt_tokens<=4000){
            context = "4K";
            inputTokens = data.usage.prompt_tokens;
            input = inputTokens/1000 * gvars.cost35I4;
        }
        if (data.usage.completion_tokens<=4000){
            context = "4K";
            outputTokens = data.usage.completion_tokens;
            output = outputTokens/1000 * gvars.cost35O4;
        }
        if (data.usage.prompt_tokens>4000 && data.usage.prompt_tokens<=16000 ){
            context = "16K";
            inputTokens = data.usage.prompt_tokens;
            input = inputTokens/1000 * gvars.cost35I16;
        }
        if (data.usage.completion_tokens>4000 && data.usage.completion_tokens<=16000 ){
            context = "16K";
            outputTokens = data.usage.completion_tokens;
            output = outputTokens/1000 * gvars.cost35O16;
        }
    }
    if (model == "GPT4"){
        if (data.usage.prompt_tokens<=8000){
            context = "8K";
            inputTokens = data.usage.prompt_tokens;
            input = inputTokens/1000 * gvars.cost4I8;
        }
        if (data.usage.completion_tokens<=8000){
            context = "8K";
            outputTokens = data.usage.completion_tokens;
            output = outputTokens/1000 * gvars.cost4O8;
        }
        if (data.usage.prompt_tokens>8000 && data.usage.prompt_tokens<=32000 ){
            context = "32K";
            inputTokens = data.usage.prompt_tokens;
            input = inputTokens/1000 * gvars.cost4I32;
        }
        if (data.usage.completion_tokens>8000 && data.usage.completion_tokens<=32000 ){
            context = "32K";
            outputTokens = data.usage.completion_tokens;
            output = outputTokens/1000 * gvars.cost4O32;
        }
    }
    
    let costUSD = (input + output);
    

    console.log({
        "operation": operation,
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
    });

    return {
        "operation": operation,
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

async function saludoInstitucional(text, audioFileName){

    console.log("Procesando Saludo Institucional")

    if(gvars.prodEnv){

        let valor, comentario;
        const result = await Promise.all([processPrompt(gvars.pemp_role, text, gvars.pemp_part1, gvars.pemp_part2, audioFileName, "Saludo Institucional")]);
        parsedData = JSON.parse(result);

        ({valor, comentario} = parsedData);
        valor = valor ? parseInt(valor) : "0";
        
        return{
            "valor": valor,
            "comentario": comentario,
            "audioName": audioFileName
        };
    }
    else{
        return{
            "valor": "10",
            "comentario": "El vendedor se presenta de manera formal e institucional al decir 'Hola, muy buenas tardes. Bienvenido a Productos Naturales Cariola. Mi nombre es Judith. ¿En qué puedo ayudarte hoy?'. Además, utiliza las palabras clave 'productos naturales' y 'medicamentos' al mencionar los paquetes disponibles."
        };
    }
}

async function empatiaSimpatia(text, audioFileName){
    
    console.log("Procesando Empatia Simpatia");
    
    if(gvars.prodEnv){
        let valor, comentario;
        const result = await Promise.all([processPrompt(gvars.emsi_role, text, gvars.emsi_part1, gvars.emsi_part2, audioFileName, "Empatia/Simpatia")]);
        parsedData = JSON.parse(result);
        
        ({valor, comentario} = parsedData);
        valor = valor ? parseInt(valor) : "0";

        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": "10",
            "comentario": "El vendedor mostró empatía y simpatía de forma excepcional en su introducción. Demostró preocupación por el cliente y ofreció diferentes opciones para adaptarse a su presupuesto."
        };
    }
}

async function precalificacion(text, audioFileName){

    console.log("Procesando Precalificacion");

    if(gvars.prodEnv){
    
        let valor, comentario, parsedData;
        const result = await Promise.all([processPrompt(gvars.prec_role, text, gvars.prec_part1, gvars.prec_part2, audioFileName, "Precalificación")]);
        
        try{
            parsedData = JSON.parse(result);
        
            ({valor, edad, peso, estatura, tipoTrabajo, otrasEnfermedades, tratamientosQueConsume, productosTomaActualmente, comentario} = parsedData);
            valor = valor ? parseInt(valor) : "0";

            return{
                "valor": valor,
                "comentario": comentario,
                "edad": edad,
                "peso": gvars.peso,
                "estatura": estatura,
                "tipoTrabajo": tipoTrabajo,
                "otrasEnfermedades": otrasEnfermedades,
                "tratamientosQueConsume": tratamientosQueConsume,
                "gvars.prodEnvuctosTomaActualmente": gvars.prodEnvuctosTomaActualmente
            };
        }
        catch(e){
            console.error(e)
        }
    }
    else{    
        return{
            "valor": "0",
            "comentario": "El vendedor no realizó ninguna de las preguntas mencionadas y se enfocó en ofrecer diferentes paquetes de productos.",
            "edad": "edad",
            "peso": "peso",
            "estatura": "estatura",
            "tipoTrabajo": "tipoTrabajo",
            "otrasEnfermedades": "otrasEnfermedades",
            "tratamientosQueConsume": "tratamientosQueConsume",
            "gvars.prodEnvuctosTomaActualmente": "gvars.prodEnvuctosTomaActualmente"
         };
    }
}

async function preguntasSubjetivas(text, audioFileName){
    
    console.log("Procesando Preguntas Subjetivas");
    
    if(gvars.prodEnv){
        
        let valor, comentario;
        
        const result = await Promise.all([processPrompt(gvars.preSub_role, text, gvars.preSub_part1, gvars.preSub_part2, audioFileName, "Preguntas subjetivas")]);
        parsedData = JSON.parse(result);  
             
        ({valor, comentario} = parsedData);
        valor = valor ? parseInt(valor) : "0";
        
        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": "7",
            "comentario": "El vendedor realizó al menos 4 preguntas subjetivas, como preguntar sobre los síntomas y ofrecer opciones de tratamiento, pero no mencionó ejemplos específicos."
        };
    }
}

async function etiquetaEnf(text, audioFileName){
    
    console.log("Procesando Etiqueta Enfermedad");

    if(gvars.prodEnv){
        
        let valor, comentario;
        
        const result = await Promise.all([processPrompt(gvars.etenf_role, text, gvars.etenf_part1, gvars.etenf_part2, audioFileName, "Etiqueta enfermedad")]);
        parsedData = JSON.parse(result);  
             
        ({valor, comentario} = parsedData);
        valor = valor ? parseInt(valor) : "0";

        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": "0",
            "comentario": "El vendedor no etiqueta al cliente con ninguna enfermedad durante la conversación."
        };
    }
}

async function enfocEnf(text, audioFileName){

    console.log("Procesando Enfoque Enfermedad");

    if(gvars.prodEnv){

        let valor, comentario;
        
        const result = await Promise.all([processPrompt(gvars.enfenf_role, text, gvars.enfenf_part1, gvars.enfenf_part2, audioFileName, "Enfoque enfermedad")]);
        parsedData = JSON.parse(result);  
             
        ({valor, comentario} = parsedData);
        valor = valor ? parseInt(valor) : "0";
        
        return {
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": "10",
            "comentario": "El vendedor se enfoca en la enfermedad del cliente desde el principio de la conversación y ofrece diferentes opciones de paquetes que podrían ayudar a tratar los síntomas mencionados. Además, menciona que los productos naturales están diseñados para mejorar la calidad de vida de los pacientes."
        };
    }
}

async function tonoVoz(text, audioFileName){
    
    console.log("Procesando Tono de voz");
    
    if(gvars.prodEnv){
        
        let valor, comentario;
        
        const result = await Promise.all([processPrompt(gvars.tonoVoz_role, text, gvars.tonoVoz_part1, gvars.tonoVoz_part2, audioFileName, "Tono de voz")]);
        parsedData = JSON.parse(result);  
             
        ({valor, comentario} = parsedData);
        valor = valor ? parseInt(valor) : "0";
        
        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": "10",
            "comentario": "El vendedor muestra preocupación por la enfermedad del cliente y utiliza un tono de voz claro y directo al ofrecerle diferentes opciones de paquetes que podrían ayudarlo."
        };
    }
}

async function conocimientoPatol(text, audioFileName){
    
    console.log("Procesando Conocimiento Patología");
    
    if(gvars.prodEnv){
        
        let valor, comentario;
        
        const result = await Promise.all([processPrompt(gvars.conPatol_role, text, gvars.conPatol_part1, gvars.conPatol_part2, audioFileName, "Conoc. patología")]);
        parsedData = JSON.parse(result);  
             
        ({valor, comentario} = parsedData);
        valor = valor ? parseInt(valor) : "0";
        
        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": "7",
            "comentario": "El vendedor demuestra conocimiento sobre la patología asociada a los síntomas del cliente al ofrecer diferentes opciones de paquetes que podrían ayudar en su situación."
        };
    }
}

async function datoDuro(text, audioFileName){
    
    console.log("Procesando Dato Duro");
    
    if(gvars.prodEnv){
        
        let valor, comentario;
        
        const result = await Promise.all([processPrompt(gvars.datoDuro_role, text, gvars.datoDuro_part1, gvars.datoDuro_part2, audioFileName, "Dato duro")]);
        parsedData = JSON.parse(result);  
             
        ({valor, comentario} = parsedData);
        valor = valor ? parseInt(valor) : "0";
        
        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": "0",
            "comentario": "El vendedor no da a conocer información sobre la patología o dolencia del cliente"
        };
    }
}

async function testimonio(text, audioFileName){

    console.log("Procesando Testimonio");

    if(gvars.prodEnv){
        
        let valor, comentario;
        
        const result = await Promise.all([processPrompt(gvars.testi_role, text, gvars.testi_part1, gvars.testi_part2, audioFileName, "Testimonio")]);
        parsedData = JSON.parse(result);  
             
        ({valor, comentario} = parsedData);
        valor = valor ? parseInt(valor) : "0";

        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": "0",
            "comentario": "El vendedor no menciona ningún testimonio al cliente."
        };
    }
}

async function solucionBeneficios(text, audioFileName){
    
    console.log("Procesando Solución Beneficios");
    
    if(gvars.prodEnv){
        
        let valor, comentario;
        
        const result = await Promise.all([processPrompt(gvars.solBen_role, text, gvars.solBen_part1, gvars.solBen_part2, audioFileName, "Solución beneficios")]);
        parsedData = JSON.parse(result);  
             
        ({valor, comentario} = parsedData);
        valor = valor ? parseInt(valor) : "0";

        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": "10",
            "comentario": "El vendedor da a conocer los beneficios del tratamiento que le proporciona al cliente y el contexto tiene mucha coherencia con la dolencia del cliente y sus síntomas."
        };
    }
}

async function respaldo(text, audioFileName){
    
    console.log("Procesando Respaldo");

    if(gvars.prodEnv){
        
        let valor, comentario;
        
        const result = await Promise.all([processPrompt(gvars.resp_role, text, gvars.resp_part1, gvars.resp_part2, audioFileName, "Respaldo")]);
        parsedData = JSON.parse(result);

        ({valor, comentario} = parsedData);
        valor = valor ? parseInt(valor) : "0";
        
        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": "0",
            "comentario": "El vendedor no habla sobre la Trayectoria, Servicio, Calidad ni Profesionalismo de la empresa durante la conversación."
        };
    }
}

async function cierreVenta(text, audioFileName){

    console.log("Procesando Cierre de venta");

    if(gvars.prodEnv){

        let valor, comentario;
        
        const result = await Promise.all([processPrompt(gvars.cierre_role, text, gvars.cierre_part1, gvars.cierre_part2, audioFileName, "Cierre de venta")]);
        parsedData = JSON.parse(result);  
             
        ({valor, comentario} = parsedData);
        valor = valor ? parseInt(valor) : "0";

        return{
            "valor": valor,
            "comentario": comentario
        };
    }
    else{
        return{
            "valor": "10",
            "comentario": "El vendedor encontró el momento adecuado para finalizar la venta y realizó el cobro al cliente, además utilizó el tipo de cierre 'Amarre invertido'."
        };
    }
}

async function comunicacionEfectiva(text, audioFileName){

    console.log("Procesando Comunicación efectiva");

    return{
        "valor": "0",
        "comentario": "comentario Comunicación efectiva"
    };
}

async function conocimientoTratamiento(text, audioFileName){

    console.log("Procesando Conocimiento del tratamiento");

    return{
        "valor": "0",
        "comentario": "comentario Conocimiento del tratamiento"
    };
}

async function rebateObjeciones(text, audioFileName){

    console.log("Procesando Rebate de objeciones");

    return{
        "valor": "0",
        "comentario": "comentario Rebaje de objeciones"
    };
}

async function analizarTextos(reqBody) {

    console.log("Analizando textos");

    ({ audioFileName, auditor, grupo_vendedor, motivo, nombre_vendedor, tipo_campana, transcripcion, duracion } = reqBody);
    console.log(reqBody.body);

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
    ]);
    
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
    
    const etapasVenta = (gvars.peso1/100 * result1) + (gvars.peso2/100*result2) + (gvars.peso3/100*result3) + (gvars.peso4/100*result4) + (gvars.peso5/100*result5) + (gvars.peso6/100*result6) + (gvars.peso7/100*result7)
    const habComerciales = puntuacion(result8, result9, result10);

    let resCal = (etapasVenta+habComerciales)/2;

    const formattedString = `AUD POR ${auditor} // PEMP-${result1}% CAL-${result2}% P.OSC-${result3}% 
            TEST-${result4}% S.BEN-${result5}% RESP-0${result6}% C.VENT-0${result7}% C.EFE-${result8}% 
            C.TRA-${result9}% R.OBJ-${result10}% / MOTIVO: "PENDIENTE"`;

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
    };

}

function calcularPromedio(datos, clave) {

    console.log("Calculando promedio")
    
    if (datos.length === 0) return "0";
    
    let suma = datos.reduce((acumulador, item) => {
        let valorNumerico = parseFloat(item[clave]);
        return !isNaN(valorNumerico) ? acumulador + valorNumerico : acumulador;
    }, 0);

    return (suma === 0 || datos.length === 0) ? "0" : suma / datos.length;
}

module.exports = {
    analizarTextos,
    puntuacion,
    currentDate,
    convertDateFormat,
    calcularPromedio,
    getColumnLetter,
    transformDateFormat,
    audioToText
};