const qrcode = require('qrcode-terminal');
const fs = require('fs');
const fetch = require("node-fetch");
const instagramDl = require("@sasmeee/igdl");
const googleTTS = require('google-tts-api');
const youtube = require('youtube-sr').default;
const ytdl = require('ytdl-core');
const { obtenerPais } = require('./utils/prefix.js');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const { constrainedMemory } = require('process');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const Jimp = require('jimp');
const esp = require('languagetool-api')
const { jsonread, update_info_player, getAllInfoPlayer, update_dias, topPlayersWithMostMoney, moneyTopPlayers, topPlayersWithMostLevel, levelTopPlayers, topUsersMessages, messageUsers } = require('./utils/playerUtils.js');
const { error } = require('console');
const quest = require('preguntas');
const { addAnimal, modifyAnimalsParameters, getAnimalParameters, getAnimals, animalExist } = require('./utils/animals.js');
dayjs.extend(utc);
dayjs.extend(timezone);

let client;
ffmpeg.setFfmpegPath(ffmpegPath);

// Alastor Bot
// Version 1.0.0

function activateClientBot(browserPath){
    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            args: ['-no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            executablePath: browserPath
        },       
        ffmpegPath: ffmpegPath
    });
}

if ((process.arch === 'arm' || process.arch === "arm64") && process.execPath === '/usr/bin/node') {
    activateClientBot('/usr/bin/chromium-browser');
}else if(process.platform === 'win32'){
    activateClientBot('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
}
else{
    activateClientBot('/usr/bin/google-chrome-stable');
}

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('loading_screen', (percent, message) => {
    console.log('Pantalla de Carga', percent, message);
});

client.on('ready', () => {
    console.log('Todo esta listo!');
});
function RandomTwoIndex(array) {
    let randomIndex = Math.floor(Math.random() * array.length);
    let randomIndex2 = Math.floor(Math.random() * array.length);
    while (randomIndex === randomIndex2) {
        randomIndex2 = Math.floor(Math.random() * array.length);
    }
    return [randomIndex, randomIndex2];
}
/**
 * 
 * @param {string} group recibe el id del grupo en formato string
 * @returns retorna true si el grupo ya esta en la lista de grupos y si no esta lo crea y retorna true
 */
function addgroup(group) {
    let jsonfile = fs.readFileSync('data.json', 'utf-8');
    let data = JSON.parse(jsonfile);
    let datagroup =
    {
        id: group,
        bot_admin: false,
        bot_activado: true,
        index_p: 0,
        title_quest: "",
        activate_quest: false,
        correctAnswer: 0,
        baba: false,
        juegos: [{ "todos": false, baneados: ["admins", "menciones"] }]
    }
    // Comprueba si grouplist existe antes de intentar acceder a su longitud
    if (data.grouplist) {
        for (let i = 0; i < data.grouplist.length; i++) {
            if (data.grouplist[i].id === group) {
                return true;
            }
        }
    } else {
        // Si grouplist no existe, inicialízalo como un array vacío
        data.grouplist = [];
    }
    data.grouplist.push(datagroup);
    fs.writeFileSync('data.json', JSON.stringify(data, null, 4), 'utf-8');
    return true;
}
/**
 * 
 * @param {string} id_group recibe el id del grupo en formato string 
 * @param {string} game recibe el nombre del juego a banear en formato string 
 */
function Bangame(id_group, game) {
    let jsonfile = fs.readFileSync('data.json', 'utf-8');
    let data = JSON.parse(jsonfile);
    let i;
    for (i = 0; i < data.grouplist.length; i++) {
        if (data.grouplist[i].id === id_group) {
            data.grouplist[i].juegos[0].todos = false;
            fs.writeFileSync('data.json', JSON.stringify(data, null, 4), 'utf-8');
            break;
        }
    }
    for (let games of game) {
        if (data.grouplist[i].juegos[0].todos == false && !data.grouplist[i].juegos[0].baneados.includes(games)) {
            data.grouplist[i].juegos[0].baneados.push(games);
            fs.writeFileSync('data.json', JSON.stringify(data, null, 4), 'utf-8');
        }
    }
}
/**
 * 
 * @param {string} id_group id del grupo 
 * @param {string} game nombre del juego
 * @returns retorna true si el juego no esta baneado y false si esta baneado
 */
function watchBan(id_group, game) {
    let jsonfile = fs.readFileSync('data.json', 'utf-8');
    let data = JSON.parse(jsonfile);
    let i;
    for (i = 0; i < data.grouplist.length; i++) {
        if (data.grouplist[i].id === id_group) {
            if (data.grouplist[i].juegos[0].todos == true) {
                return true
            } else {
                if (data.grouplist[i].juegos[0].baneados.includes(game)) {
                    return false
                } else {
                    return true
                }
            }
        }
    }
}
/**
 * 
 * @param {string} id_group el id del grupo 
 * @param {string} game el juego que se quiere quitar de la lista de baneados
 * @returns retorna true si se pudo quitar el juego de la lista de baneados, false si no se pudo
 */
function QuitBan(id_group, game) {
    let jsonfile = fs.readFileSync('data.json', 'utf-8');
    let data = JSON.parse(jsonfile);
    for (i = 0; i < data.grouplist.length; i++) {
        if (data.grouplist[i].id === id_group) {
            if (data.grouplist[i].juegos[0].todos == false) {
                if (data.grouplist[i].juegos[0].baneados.includes(game)) {
                    let index = data.grouplist[i].juegos[0].baneados.indexOf(game);
                    data.grouplist[i].juegos[0].baneados.splice(index, 1);
                    fs.writeFileSync('data.json', JSON.stringify(data, null, 4), 'utf-8');
                    return true
                } else {
                    return false
                }
            } else {
                return false
            }
        }
    }
}
function watchBot(id_group) {
    let jsonfile = fs.readFileSync('data.json', 'utf-8');
    let data = JSON.parse(jsonfile);
    for (i = 0; i < data.grouplist.length; i++) {
        if (data.grouplist[i].id === id_group) {
            return data.grouplist[i].bot_activado
        }
    }
}
/**
 * @param {number} option si es 1 retorna el estado de la pregunta si es 2 activa o desactiva la pregunta si es 3 pone el indice de respuesta correcta, si es 4 retorna el indice de la respuesta correcta si es 5 retorna el indice de la pregunta si es 6 pone el indice de la pregunta si es 7 retorna el titulo de la pregunta si es 8 pone el titulo de la pregunta
 * @param {*} boolean si es true activa la pregunta si es false la desactiva, tambien se puede usar para poner el indice de la respuesta correcta
 * @param {string} id_group el id del grupo
 * @returns retorna true si la pregunta esta activa y false si no lo esta 
*/
function groupActiveQuestions(option, id_group, boolean) {  
    let jsonfile = fs.readFileSync('data.json', 'utf-8');
    let data = JSON.parse(jsonfile);
    if(option === 1){
        for (i = 0; i < data.grouplist.length; i++) {
            if (data.grouplist[i].id === id_group) {
                return data.grouplist[i].activate_quest
            }
        }
    }else if(option === 2){
        for (i = 0; i < data.grouplist.length; i++) {
            if (data.grouplist[i].id === id_group) {
                data.grouplist[i].activate_quest = boolean;
                fs.writeFileSync('data.json', JSON.stringify(data, null, 4), 'utf-8');
                break;
            }
        }
    }else if(option === 3){
        for (i = 0; i < data.grouplist.length; i++) {
            if (data.grouplist[i].id === id_group) {
                data.grouplist[i].correctAnswer = boolean;
                fs.writeFileSync('data.json', JSON.stringify(data, null, 4), 'utf-8');
                break;
            }
        }
    }else if(option === 4){
        for (i = 0; i < data.grouplist.length; i++) {
            if (data.grouplist[i].id === id_group) {
                return data.grouplist[i].correctAnswer;
            }
        }
    }else if(option === 5){
        for (i = 0; i < data.grouplist.length; i++) {
            if (data.grouplist[i].id === id_group) {
                return data.grouplist[i].index_p;
            }
        }
    }else if(option === 6){
        for (i = 0; i < data.grouplist.length; i++) {
            if (data.grouplist[i].id === id_group) {
                data.grouplist[i].index_p = boolean;
                fs.writeFileSync('data.json', JSON.stringify(data, null, 4), 'utf-8');
                break;
            }
        }
    }else if(option === 7){
        for (i = 0; i < data.grouplist.length; i++) {
            if (data.grouplist[i].id === id_group) {
                return data.grouplist[i].title_quest;
            }
        }
    }else if(option === 8){
        for (i = 0; i < data.grouplist.length; i++) {
            if (data.grouplist[i].id === id_group) {
                data.grouplist[i].title_quest = boolean;
                fs.writeFileSync('data.json', JSON.stringify(data, null, 4), 'utf-8');
                break;
            }
        }
    }
}
function activeBot(id_group, boolean) {
    let jsonfile = fs.readFileSync('data.json', 'utf-8');
    let data = JSON.parse(jsonfile);
    for (i = 0; i < data.grouplist.length; i++) {
        if (data.grouplist[i].id === id_group) {
            data.grouplist[i].bot_activado = boolean;
            fs.writeFileSync('data.json', JSON.stringify(data, null, 4), 'utf-8');
            break;
        }
    }
}
let option = {
    juego: 0,
    ajustes: 0
};
client.on('group_join', (notification) => {
    notification.getChat().then((chat) => {
        addgroup(chat.id._serialized);
        if(watchBot(chat.id._serialized)){
            notification.reply(`Bienvenido a ${chat.name}, @${notification.recipientIds[0].replace('@c.us', '')}`, {
                mentions: [notification.recipientIds[0]]
            });
        }
    })
});

let menu = `
~*MENU*~

📋🧾📄| Menu

👨‍👩‍👧‍👦🏡💞 | !todos (Only Admins).

📊📈📉 | IO (Stats)

🧟 🚿🛁| rnu (Recomendar anime).

🎮 👾🎧| Jugar.

👰‍♀️❤️‍🔥🤵‍♂ | Cr (@persona_con_que_te_casas)

🚪🫠 😦| Divorcio(1 punto y 20 mensajes)

🃏🎞️🤳| St (crea sticker de la imagen que respondas)

🔈🔉🔊 | Tv (Crea un audio)

🎸🎼🎵 | m (nombre de la cancion) 

📸 🕺🕴️| Sf (Foto o video de imagen temporal) 

❌🚫 📛| Br (Borrar mensaje del bot)

🏪🏬💸 | Tienda

🛒🛍️🏷️ | Comprar (nombre del articulo)

🏦💰💱 | Banco (opcion, monto)

🧊⛏️🕹️ | MS (servidor de Minecraft)

📝⚙️🪛 | As (Ajustes)

🎁 🎉— donar

👨🏻‍💻👀 🛐— creador.

¡Por ahora estas son todas las opciones que puedes disfrutar! Sigue apoyando.
`
const option_game = "*Opciones*\n\n" + "1. Quitar la opción Juego\n" + "2. Quitar los Juegos con menciones\n" + "3. Todos pueden utilizar los juegos con menciones";
const menu_game = "estos son los juegos disponibles por el momento:\n\n" + "> Piedra 🪨, papel 🧻 o tiejeras ✂️(ppt)\n\n> formar pareja (fp) 👩🏻‍❤️‍💋‍👨🏻\n\n> Dado 🎲 (pon un numero del 1 al 6)\n\n> BlackJack(bj)\n\n> !q crea una pregunta" + "\n\n> cz (cara o cruz)" + "\n\n*Los Roles tienen sus juegos propios*"
const links_baneados = ["is.gd", "chat.whatsapp.com", "5ne.co", "t.me", "in.ru", "ln.ru", "https://xxnx", "https://pornhub", "https://xvideos", "https://xnxx", "xnxx", "xhamster", "redtube", "youporn", "te odio baba", "odio baba", "odio a baba"]
let golpear;
let counterListRequestMusic = 0;
let counterListRequestVideo = 0;
let cuentos = []
let groupTimes = {};
let contadordia = {};
let cartas_jugador = {};
let dealer = {};
let dinero_bj = {};
const Alastor_Number = ["32466905630", "18098972404", "573170633386"]
const insultos = ['bot de mierda', 'mierda de bot', 'alastor de mierda']

client.on('message_create', async (message) => {
    const chat = await message.getChat();
    let contact = await message.getContact();
    const group = await message.getChat();

    if(message.body.toLocaleLowerCase() === ''){
        return;
    }
    function quitar_acentos(palabra){
        const palabras_raras = ["á", "é", "í", "ó", "ú", "ñ", "ü"];
        const letras_normales = ["a", "e", "i", "o", "u", "n", "u"];
        for (let i = 0; i < palabras_raras.length; i++) {
            palabra = palabra.replace(new RegExp(palabras_raras[i], 'g'), letras_normales[i]);
        }
        return palabra;
    }
    if(insultos.includes(message.body.toLocaleLowerCase())){
        message.reply('Tu madre me dijo otra cosa');
    }
    if (jsonread(contact.id.user)) {
        update_info_player(contact.id.user, "mensajes", getAllInfoPlayer(contact.id.user).mensajes + 1, true);
    }
    const infoPlayer = getAllInfoPlayer(contact.id.user);
    const currentLevel = infoPlayer.nivel;
    let winsNeeded = (currentLevel + 1) * 10;

    if(infoPlayer.ganadas == winsNeeded){
        update_info_player(contact.id.user, "nivel", currentLevel + 1, true);
        update_info_player(contact.id.user, "ganadas", 0, true);
        message.reply('Felicidades has subido de nivel');
    }
    /**
    * Verifica si el usuario es admin o no, no necesita parametros
    * @param {string} author  id del usuario que envio el mensaje
    * @returns {boolean}  si el usuario es admin devuelve true si no false
    */
    function participantes(author) {

        let participantes = [];
        chat.participants.forEach((participant) => {
            participantes.push(participant);
        });
        const sender = participantes.find(participant => participant.id._serialized === author);
        return sender.isAdmin;
    }
    if (chat.isGroup) {
        addgroup(chat.id._serialized);


        if (message.body.toLocaleLowerCase() === 'ab') {
            if ((participantes(message.author) || Alastor_Number.includes(contact.id.user)) && watchBot(chat.id._serialized) === false) {
                activeBot(chat.id._serialized, true);
                message.reply('El bot ha sido activado');
            }
        }
        if (watchBot(chat.id._serialized) == false) {
            return;
        }
        if (message.body.toLocaleLowerCase() === 'desactivar bot' || message.body.toLocaleLowerCase() === 'db') {
            if (participantes(message.author) || Alastor_Number.includes(contact.id.user)) {
                activeBot(chat.id._serialized, false);
                message.reply('El bot ha sido desactivado');
            }
        }
    }
    if(chat.isGroup){
        group.iAmadmin().then(resp => {
            if(resp){
                let mmsg = message.body.toLocaleLowerCase();
                addgroup(chat.id._serialized);
                chat.getInviteCode().then((linkg) => {
                    if(linkg){
                        for (let i = 0; i < links_baneados.length; i++) {
                            if (!(mmsg.includes(linkg.toLocaleLowerCase())) && mmsg.includes(links_baneados[i])) {
                                message.delete(true);
                                group.removeParticipants([contact.id._serialized])
                                break
                            }
                        }
                    }
                })
            }
        });
    }
    if (message.body.toLocaleLowerCase() === 'io' || message.body.toLocaleLowerCase() === 'ls') {
        let info;
        let casadoContact;
        try {
            jsonread(contact.id.user);
            if (message.hasQuotedMsg) {
                if (chat.isGroup) {
                    const quotedMsg = await message.getQuotedMessage();
                    let contact = await quotedMsg.getContact();
                    info = getAllInfoPlayer(contact.id.user);
                    const casado = info.casado && info.casado !== 'nadie :(' ? `@${info.casado}` : info.casado;
                    if (info.casado === 'nadie :(') {
                        client.sendMessage(message.from, `*Casad@ con:* ${casado}\n*nivel* ${info.nivel}\n*Puntuacion:* ${info.ganadas}\n*Rool:* ${info.roles}\n*Pais:* ${obtenerPais(contact.id.user)}\n*Dinero:* ${info.dinero}\n*Dinero en el banco:* ${info.banco}\n*total de mensajes enviados:* ${info.mensajes}`, {
                            quotedMessageId: quotedMsg.id._serialized
                        });
                    } else {
                        casadoContact = await client.getContactById(info.casado + '@c.us');
                        client.sendMessage(message.from, `*Casad@ con:* ${casado}\n*nivel* ${info.nivel}\n*Puntuacion:* ${info.ganadas}\n*Rool:* ${info.roles}\n*Pais:* ${obtenerPais(contact.id.user)}\n*Dinero:* ${info.dinero}\n*Dinero en el banco:* ${info.banco}\n*Total de mensajes enviados:* ${info.mensajes}`, {
                            mentions: [casadoContact],
                            quotedMessageId: quotedMsg.id._serialized
                        });
                    }
                }
            } else {
                if (chat.isGroup) {
                    info = getAllInfoPlayer(contact.id.user);
                    const casado = info.casado && info.casado !== 'nadie :(' ? `@${info.casado}` : info.casado;
                    if (info.casado === 'nadie :(') {
                        client.sendMessage(message.from, `*Casad@ con:* ${casado}\n*nivel* ${info.nivel}\n*Puntuacion:* ${info.ganadas}\n*Rool:* ${info.roles}\n*Pais:* ${obtenerPais(contact.id.user)}\n*Dinero:* ${info.dinero}\n*Dinero en el banco:* ${info.banco}\n*Total de mensajes enviados:* ${info.mensajes}`, {
                            quotedMessageId: message.id._serialized
                        });
                    } else {
                        casadoContact = await client.getContactById(info.casado + '@c.us');
                        client.sendMessage(message.from, `*Casad@ con:* ${casado}\n*nivel* ${info.nivel}\n*Puntuacion:* ${info.ganadas}\n*Rool:* ${info.roles}\n*Pais:* ${obtenerPais(contact.id.user)}\n*Dinero:* ${info.dinero}\n*Dinero en el banco:* ${info.banco}\n*Total de mensajes enviados:* ${info.mensajes}`, {
                            mentions: [casadoContact],
                            quotedMessageId: message.id._serialized
                        });
                    }
                }
            }
        } catch (err) {
            console.log(err);
            message.reply('La funcion aun esta en desarrollo');
        }
    }
    if (message.body.toLocaleLowerCase() === 'divorciarse' || message.body.toLocaleLowerCase() === 'divorcio') {
        if (getAllInfoPlayer(contact.id.user).casado === "nadie :(") {
            message.reply('No estas casad@');
        } else {
            if (getAllInfoPlayer(contact.id.user).ganadas > 0 && getAllInfoPlayer(contact.id.user).mensajes >= 20) {
                update_info_player(getAllInfoPlayer(contact.id.user).casado, "ganadas", getAllInfoPlayer(getAllInfoPlayer(contact.id.user).casado).ganadas + 1, true);
                update_info_player(getAllInfoPlayer(contact.id.user).casado, "casado", "nadie :(", true);
                update_info_player(contact.id.user, "casado", "nadie :(", true);
                update_info_player(contact.id.user, "mensajes", getAllInfoPlayer(contact.id.user).mensajes - 20, true);
                update_info_player(contact.id.user, "ganadas", getAllInfoPlayer(contact.id.user).ganadas - 1, true);
                message.reply('Ahora estas divorciad@');
            } else {
                message.reply('No tienes suficientes mensajes o puntuacion para divorciarte');
            }
        }
    }
    function casarse(prometido){
        const regex = /^\d+$/;
        if (regex.test(prometido)) {
            try {
                if (chat.isGroup) {
                    jsonread(prometido);
                    if (getAllInfoPlayer(prometido).casado === "nadie :(") {
                        update_info_player(contact.id.user, "casado", prometido, true);
                        update_info_player(prometido, "casado", contact.id.user, true);
                        message.reply("*🎉Felicidades ahora estas casad@!!*");
                    }
                }
            } catch (err) {
                message.reply('hubo un error y no te puedes casar');
            }
        } else {
            message.reply('menciona a alguien o Introduce un numero valido');
        }
    }
    if (message.body.toLocaleLowerCase().startsWith('casar ') || message.body.toLocaleLowerCase().startsWith('cr ')) {
        let parts = message.body.split(' ');
        let prometido = parts[1];
        prometido = prometido.replace('@', '');
        prometido = prometido + '@c.us';
        if(prometido.replace('@c.us', '') != contact.id.user){
            if(getAllInfoPlayer(contact.id.user).casado === "nadie :("){
                client.getContactById(prometido).then((c) => {
                    chat.sendMessage(`*¿hey @${prometido.replace('@c.us', '')} quieres casarte con ${contact.id.user}?*\n\n> Si tu respuesta es sí responde a este mensaje con un sí`, { mentions: prometido })
                }).catch(error => {
                    message.reply('Esta persona no existe en Whatsapp, deja de hacerme perder el tiempo');
                })
            }else{
                message.reply('*Ya estabas casad@ infiel 😠*');
            }
        }else{
            message.reply("Eres imbécil o que, no puedes casarte contigo mismo")
        }
    }
    if(message.body.toLocaleLowerCase() === 'si' || message.body.toLocaleLowerCase() === 'sí'){
        if(message.hasQuotedMsg){
            const quotedMsg = await message.getQuotedMessage();
            let contacto = await quotedMsg.getContact();
            if(quotedMsg.fromMe && contacto.id.user === client.info.me.user){
                const regex_prometido = /hey @(\d+)/;
                const match_prometido = quotedMsg.body.match(regex_prometido);
                const regex_propositor = /quieres casarte con (\d+)/;
                const match_propositor = quotedMsg.body.match(regex_propositor);
                if (match_prometido[1] == contact.id.user){
                    let phoneNumber = match_propositor[1]; 
                    casarse(phoneNumber);
                }
            }
        }
    }
    if (message.body.toLocaleLowerCase() === 'menu' || message.body.toLocaleLowerCase() === 'menú') {
        let tempMenu = menu;
        await chat.sendSeen();
        await chat.sendStateTyping();
        if (chat.isGroup) {
            if (watchBan(chat.id._serialized, 'todo') === false) {
                tempMenu = tempMenu.replace('🎮 — jugar.\n', '');
                message.reply(tempMenu);
            } else {
                message.reply(tempMenu);
            }
        } else {
            tempMenu = tempMenu.replace('📝 — ajustes(as).\n', '');
            tempMenu = tempMenu.replace('👨‍👨‍👧‍👦 — !todos (solo los admins lo pueden usar).\n', '');
            message.reply(tempMenu);
        }
    }
    if (message.body.toLocaleLowerCase() === 'recomienda un anime' || message.body.toLocaleLowerCase() === 'rnu') {
        file = fs.readFileSync('data.json', 'utf-8')
        data = JSON.parse(file)
        const randomIndex = Math.floor(Math.random() * data.animes.names.length);
        message.reply(data.animes.names[randomIndex]);
    }
    if (message.body.toLocaleLowerCase() === 'minecraft server' || message.body.toLocaleLowerCase() === 'ms') {
        await chat.sendSeen();
        await chat.sendStateTyping();
        message.reply('Aqui tienes el ip del servidor: AFSI.aternos.me\n' + "puerto: 55545\n" + "link del server: https://add.aternos.org/AFSI\n\n" + "Apk del juego: https://www.mediafire.com/file/g7tcnqaw53viyei/Minecraft-1.20.51.01-apktodo.io.apk/file");
    }
    if (message.body.toLocaleLowerCase().startsWith('dados ') || message.body.toLocaleLowerCase().startsWith('dado ')) {
        let parts = message.body.split(' ');
        let num = parts[1];
        let eleccionMaquina = Math.floor(Math.random() * 6) + 1;
        message.reply(`yo escojo el numero ${eleccionMaquina}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        let numeroObjetivo = Math.floor(Math.random() * 6) + 1;
        let diferenciaJugador = Math.abs(numeroObjetivo - parseInt(num));
        let diferenciaMaquina = Math.abs(numeroObjetivo - eleccionMaquina);

        let ganador;
        let dado;

        if (diferenciaJugador < diferenciaMaquina) {
            ganador = 'ganó el Jugador';
            update_info_player(contact.id.user, "ganadas", getAllInfoPlayer(contact.id.user).ganadas + 1, true);
        } else if (diferenciaMaquina < diferenciaJugador) {
            ganador = 'ganó la Máquina';
            update_info_player(contact.id.user, "ganadas", getAllInfoPlayer(contact.id.user).ganadas - 1, true);
        } else {
            ganador = 'quedo Empate';
        }

        if (numeroObjetivo === 1) {
            dado = "         ⚀\n";
        } else if (numeroObjetivo === 2) {
            dado = "         ⚁\n";
        } else if (numeroObjetivo === 3) {
            dado = "         ⚂\n";
        } else if (numeroObjetivo === 4) {
            dado = "         ⚃\n";
        } else if (numeroObjetivo === 5) {
            dado = "         ⚄\n";
        } else if (numeroObjetivo === 6) {
            dado = "         ⚅\n";
        } else {
            message.reply('Introduce un número del 1 al 6');
            return;
        }
        message.reply(`${dado} El resultado es: ${ganador}`);
    }
    if(message.body.toLocaleLowerCase().startsWith('pp ')){
        //pp es pelea de pollos por apuestas el jugador introduce una cantidad de dinero a apostar y el bot elige un numero de probabilidad de ganar basandose en las estadisticas del animal
        let parts = message.body.split(' ');
        let cantidad = parts[1];
        let tiene_pollo = getAnimals(contact.id.user)
        for(let i = 0; i < tiene_pollo.length; i++){
            if(tiene_pollo[i].tipo === "pollo"){
                tiene_pollo === true;
            }
        }
        if (cantidad === "all" && isNaN(cantidad)) {
            cantidad = getAllInfoPlayer(contact.id.user).dinero;
        }
        if (isNaN(cantidad)) {
            message.reply('Introduce una cantidad valida');
            return;
        }
        if (getAllInfoPlayer(contact.id.user).dinero >= cantidad && getAllInfoPlayer(contact.id.user).dinero > 0 && tiene_pollo) {
            
        }        
    }
    if (message.body.toLocaleLowerCase() === 'jugar piedra papel o tijera' || message.body.toLocaleLowerCase() === 'ppt') {
        await chat.sendSeen();
        await chat.sendStateTyping();
        ppt_menu =
            "Piedra 🪨, papel 🧻 o tiejeras ✂️\n\n" +
            "Usa los siguientes comandos para jugar:\n\n" +
            "ppt piedra\n" +
            "ppt papel\n" +
            "ppt tijera\n";
        if (chat.isGroup) {
            if (addgroup(chat.id._serialized) && watchBan(chat.id._serialized, 'ppt') && watchBan(chat.id._serialized, 'todos')) {
                jsonread(contact.id.user);
                message.reply(ppt_menu);
            }
        } else {
            jsonread(contact.id.user);
            message.reply(ppt_menu);
        }
    }
    // Skills de Roles
    if (message.body.toLocaleLowerCase().startsWith("robar ") || message.body.toLocaleLowerCase().startsWith("rb ")){
        if (getAllInfoPlayer(contact.id.user).roles === "ladron") {
            let futuro = ["lograste robar", "te atraparon"];
            let randomIndex = Math.floor(Math.random() * futuro.length);
            if(message.hasQuotedMsg){
                const quotedMsg = await message.getQuotedMessage();
                let contacto = await quotedMsg.getContact();
                if (futuro[randomIndex] === "lograste robar") {
                    if(getAllInfoPlayer(contacto.id.user).dinero > 0){
                        update_info_player(contact.id.user, "dinero", getAllInfoPlayer(contact.id.user).dinero + getAllInfoPlayer(contacto.id.user).dinero, true);
                        update_info_player(contacto.id.user, "dinero", getAllInfoPlayer(contacto.id.user).dinero - getAllInfoPlayer(contacto.id.user).dinero, true);
                        message.reply(futuro[randomIndex]);
                    }else{
                        message.reply("No hay nada que robar");
                    }              
                }else if(futuro[randomIndex] === "te atraparon"){
                    update_info_player(contact.id.user, "dinero", getAllInfoPlayer(contact.id.user).ganadas - 1,true);
                    message.reply(futuro[randomIndex]);
                }
            }else{
                let parte = message.body.split(" ")
                parte = parte[1]
                parte = parte.replace('@', '');
                jsonread(parte);
                if (futuro[randomIndex] === "lograste robar") {
                    if(getAllInfoPlayer(parte).dinero > 0){
                        update_info_player(contact.id.user, "dinero", getAllInfoPlayer(contact.id.user).dinero + getAllInfoPlayer(parte).dinero, true);
                        update_info_player(parte, "dinero", getAllInfoPlayer(parte).dinero - getAllInfoPlayer(parte).dinero, true);
                        message.reply(futuro[randomIndex]);
                    }else{
                        message.reply("No hay nada que robar");
                    }              
                }else if(futuro[randomIndex] === "te atraparon"){
                    update_info_player(contact.id.user, "ganadas", getAllInfoPlayer(contact.id.user).ganadas - 1, true);
                    message.reply(futuro[randomIndex]);
                }
            }
        }
    }
    if(getAllInfoPlayer(contact.id.user).roles === "ama"){
        let day = parseInt(dayjs().tz("America/Santo_Domingo").format('D'))
        if(update_dias(contact.id.user,day, 2) === false){
            update_info_player(contact.id.user, "dinero", getAllInfoPlayer(contact.id.user).dinero + 10, true);
            update_info_player(getAllInfoPlayer(contact.id.user).casado, "dinero", getAllInfoPlayer(getAllInfoPlayer(contact.id.user).casado).dinero - 10, true);
            update_dias(contact.id.user,day, 1);
            message.reply("Has recibido 10 monedas por ser ama de casa");
        }
    }
    if(message.body.toLocaleLowerCase() === 'arrestar'){
        console.log(golpear);
        if(getAllInfoPlayer(contact.id.user).roles === "policia" && golpear === true){
            console.log("es policia");
            if(message.hasQuotedMsg){
                console.log("tiene mensaje citado");
                const quotedMsg = await message.getQuotedMessage();
                let contacto = await quotedMsg.getContact();
                if(getAllInfoPlayer(contacto.id.user).roles === "ladron"){
                    update_info_player(contact.id.user, "dinero", getAllInfoPlayer(contact.id.user).dinero + 10, true);
                    if(getAllInfoPlayer(contacto.id.user).dinero > 0){
                        message.reply("este ladron no tenia dinero deberias golpearlo con un palo");
                    }
                    update_info_player(contacto.id.user, "roles", "vagabundo", true);
                    message.reply("Has arrestado al ladron el jefe te dio 10 monedas por tu buen trabajo");
                }else{
                    message.reply("No puedes arrestar a alguien que no es un ladron y que no lo hayas golpeado");
                }
            }else{
                message.reply("Solo puedes arrestar a un ladron al que le respondas");
            }
        }
    }
    if(message.body.toLocaleLowerCase().startsWith('golpear ')){
        try{
            if(getAllInfoPlayer(contact.id.user).roles === "policia"){
                let parte = message.body.split(" ")
                parte = parte[1]
                parte = parte.replace('@', '');
                if(getAllInfoPlayer(parte).roles === "policia"){
                    message.reply("No puedes golpear a un policia");
                }else if(getAllInfoPlayer(parte).roles === "ladron"){
                    update_info_player(parte, "dinero", getAllInfoPlayer(parte).dinero - 10, true);
                    let respuestas = [
                    "le diste en un riñon", 
                    "le diste en la cabeza", 
                    "le diste en el estomago", 
                    "le diste en la pierna", 
                    "El idiota necesitara un doctor", 
                    "se cago en los pantalones",
                    "se desmayo",
                    "se orino encima"
                    ];
                    let randomIndex = Math.floor(Math.random() * respuestas.length);
                    message.reply(`Has golpeado a ${parte} ${respuestas[randomIndex]}, ahora arrestalo`);
                    golpear = true;
                }
            }
        }catch(err){
            console.log(err);
        }
    }
    if(message.body.toLocaleLowerCase().startsWith('escribir')){
        if(getAllInfoPlayer(contact.id.user).roles === "escritor"){
            if(getAllInfoPlayer(contact.id.user).objetos.includes("papel") && getAllInfoPlayer(contact.id.user).objetos.includes("lapiz")){
                let texto = message.body.split(" ");
                texto = texto.slice(1).join(" ");
                if(cuentos.includes(texto)){
                    message.reply("*Ya has escrito esto antes, no puedes escribirlo de nuevo*");
                }else{
                    cuentos.push(texto);
                    if(texto.length < 20000){
                        params = {
                            language: 'auto',
                            text: texto,
                            preferredVariants: ['es-ES', 'es-AR']
                        }
                        esp.check(params, function (err, res) {
                            if (err) {
                                console.log(err)
                            } else {
                                if (res.matches.length > 0) {
                                    message.reply("*Tienes errores ortograficos en tu texto, por favor corrigelos*")
                                }else{
                                    if(texto.length > 200 && texto.length < 770){
                                        message.reply("*Eres bastante vag@ para escribir, te dare 0.2 monedas por tu esfuerzo*");
                                        update_info_player(contact.id.user, "dinero", getAllInfoPlayer(contact.id.user).dinero + 0.2, true);
                                    }else if(texto.length > 770){
                                        message.reply("*UFF eso está bastante bueno, te dare 4 monedas por tu esfuerzo*");
                                        update_info_player(contact.id.user, "dinero", getAllInfoPlayer(contact.id.user).dinero + 4, true);
                                    }else{
                                        message.reply("*Tu texto es una mierda no te dare nada por eso, es mas pagame te quitare dos monedas por hacerme perder el tiempo.*")
                                        update_info_player(contact.id.user, "dinero", getAllInfoPlayer(contact.id.user).dinero - 2, true);
                                    }
                                }
                            }
                        })
                    }else{
                        message.reply("Tu texto es demasiado largo, por favor acortalo");
                    }
                }
            }else{
                message.reply("No tienes los objetos necesarios para escribir compra un papel y un lapiz");
            }
        }
    }
    if(message.body.toLocaleLowerCase().startsWith('baile sexual')){
        console.log(contact.id.user)
        if(getAllInfoPlayer(contact.id.user).roles === "stripper"){
            let part = message.body.split(" ");
            part = part[2];
            if(part === undefined){
                let respuestas = [
                    "le paraste el pene y te dio 2 monedas",
                    "ese baile calento a todos y te lanzaron dos monedas",
                    "te quitaste el pantalon y te tiraron dos monedas"
                ]
                let randomIndex = Math.floor(Math.random() * respuestas.length);
                update_info_player(contact.id.user, "dinero", getAllInfoPlayer(contact.id.user).dinero + 2, true);
                message.reply(respuestas[randomIndex]);
            }else{
                part = part.replace('@', '');
                const usuario = contact.id.user + '@c.us';
                let obtenerusuario = await client.getContactById(usuario);
                let obtenerpart = await client.getContactById(part + '@c.us');
                await client.sendMessage(message.from,`${contact.id.user} te ha bailado sexualmente ${part}, deberias darle dos monedas por su servicio`, { mentions: [obtenerusuario, obtenerpart] });
            }
        }
    }
    //-----------------------------------------------------------------------------------------------------------------------

    if (message.body.toLocaleLowerCase().startsWith('cz')) {
        if (chat.isGroup) {
            if (message.body.toLocaleLowerCase() === 'cz') {
                message.reply('Usa los siguientes comandos para jugar:\ncz (cantidad) (cara o cruz)');
                return;
            }
            let parts = message.body.split(' ');
            let cantidad = parts[1];
            let opcion = parts[2];

            if(typeof opcion !== 'string'){
                message.reply('La opcion debe ser cara o cruz');
                return;
            }
            opcion = quitar_acentos(opcion);
            opcion = opcion.toLocaleLowerCase();
            if (isNaN(cantidad)) {
                message.reply('La cantidad debe ser un numero');
                return;
            }
            if(cantidad < 0){
                message.reply('No puedes apostar una cantidad negativa');
                return;
            }
            cantidad = parseInt(cantidad);
            if(getAllInfoPlayer(contact.id.user).dinero >= cantidad){
                let resultado = Math.floor(Math.random() * 2);
                let respuesta;
                let foto;
                if(resultado === 0){
                    respuesta = "cara";
                    foto = "./assets/cara.jpg";
                }
                if(resultado === 1){
                    respuesta = "cruz";
                    foto = "./assets/cruz.jpg";
                }
                if(opcion === respuesta){
                    update_info_player(contact.id.user, "dinero", getAllInfoPlayer(contact.id.user).dinero + cantidad, true);
                    message.reply(`Has ganado`);
                    const media = MessageMedia.fromFilePath(foto)
                    const medi = new MessageMedia('image/jpg', media.data, 'sticker');
                    chat.sendMessage(medi, { sendMediaAsSticker: true, stickerAuthor: 'Por Alastor', stickerName: 'Alastor Bot' });
                }
                if(opcion !== respuesta){
                    update_info_player(contact.id.user, "dinero", getAllInfoPlayer(contact.id.user).dinero - cantidad, true);
                    message.reply(`Has perdido`);
                    const media = MessageMedia.fromFilePath(foto)
                    const medi = new MessageMedia('image/jpg', media.data, 'sticker');
                    chat.sendMessage(medi, { sendMediaAsSticker: true, stickerAuthor: 'Por Alastor', stickerName: 'Alastor Bot' });
                }
            }
        }
    }
    // Creo el juego del blackjack debo terminarlo luego
    if (message.body.toLocaleLowerCase().startsWith('bj')){
        if(chat.isGroup){
            if(message.body.toLocaleLowerCase() === 'bj'){
                const mensaje = '*Bienvenido*\n\nUsa los siguientes comandos para jugar:\n\nbj apostar (cantidad)\nbj plantarse\nbj pedir\nbj rendirse';
                message.reply(mensaje);
            }
            //cartas tiene el valor de su numero
            const cartas =[2,3,4,5,6,7,8,9,10,11,12,13,14];
            // cartas_palos no tiene un valor numerico en el juego pero el as de corazones puede valer 1 u 11
            const cartas_palos = ['♠️', '♣️', '♥️', '♦️', '♥️', '♥️', '♥️'];
            // cartas especiales tiene un valor de 10
            const cartas_especiales = ['J', 'Q', 'K', 'A'];
            const cartas_completas = cartas.concat(cartas_especiales, cartas_palos);
            const opcion = message.body.toLocaleLowerCase().split(" ");
            const sumar_cartas_dealer = (jugador) => {
                let suma = 0;
                let as = 0;
                for(carta of dealer[jugador]){
                    if(cartas.includes(carta)){
                        suma += carta;
                    }else if(cartas_especiales.includes(carta)){
                        suma += 10;
                    }else if(carta === 'A'){
                        as += 1;
                    }
                }
                for(let i = 0; i < as; i++){
                    if(suma + 11 <= 21){
                        suma += 11;
                    }else{
                        suma += 1;
                    }
                }
                return suma;
            }
            const dealer_bot = (jugador) =>{
                let numero = Math.floor(Math.random() * cartas_completas.length);
                let carta = cartas_completas[numero];
                if (!dealer[jugador]) {
                    dealer[jugador] = [];
                }
                if(sumar_cartas_dealer(jugador) >= 17){
                    return;
                }
                if(dealer[jugador].includes(carta)){
                    return dealer_bot(jugador);
                }
                if(!cartas_jugador[jugador].includes(carta)){
                    dealer[jugador].push(carta);
                }
                return carta;
            }
            const repartir = (jugador) => {
                let numero = Math.floor(Math.random() * cartas_completas.length);
                let carta = cartas_completas[numero];
                if (!cartas_jugador[jugador]) {
                    cartas_jugador[jugador] = [];
                }
                if(cartas_jugador[jugador].includes(carta) && dealer[jugador].includes(carta)){
                    return repartir(jugador);
                }
                cartas_jugador[jugador].push(carta);
                dealer_bot(jugador);
                return carta;
            }
            const sumar_cartas_jugador = (jugador) => {
                let suma = 0;
                let as = 0;
                for(carta of cartas_jugador[jugador]){
                    if(cartas.includes(carta)){
                        suma += carta;
                    }else if(cartas_especiales.includes(carta)){
                        suma += 10;
                    }else if(carta === 'A'){
                        as += 1;
                    }
                }
                for(let i = 0; i < as; i++){
                    if(suma + 11 <= 21){
                        suma += 11;
                    }else{
                        suma += 1;
                    }
                }
                return suma;
            }
            const ganador = (jugador) => {
                const suma_jugador = sumar_cartas_jugador(jugador);
                const suma_dealer = sumar_cartas_dealer(jugador);
                if(suma_jugador > 21 && suma_dealer > 21){
                    return 'empate';
                }else if(suma_dealer > 21){
                    return 'jugador';
                }else if(suma_jugador > 21){
                    return 'dealer';
                }else if(suma_jugador > suma_dealer){
                    return 'jugador';
                }else if(suma_jugador < suma_dealer){
                    return 'dealer';
                }
                return 'empate';
            }
            if(opcion[1] === 'apostar'){
                if(!cartas_jugador[contact.id.user]){
                    const cantidad = opcion[2];
                    if(cantidad > 0){
                        if(getAllInfoPlayer(contact.id.user).dinero >= cantidad){
                            dinero_bj[contact.id.user] = cantidad;
                            update_info_player(contact.id.user, "dinero", getAllInfoPlayer(contact.id.user).dinero - cantidad, true);
                            message.reply("Tu carta es: " + repartir(contact.id.user));
                        }else{
                            message.reply('No tienes suficiente dinero para apostar esa cantidad');
                        }
                    }else{
                        message.reply('Introduce una cantidad valida');
                    }
                }else{
                    message.reply('Ya has apostado, no puedes apostar de nuevo');
                }
            }
            if(opcion[1] === 'pedir'){
                if(cartas_jugador[contact.id.user]){
                    let carta = repartir(contact.id.user);
                    message.reply("Tu carta es: " + carta);
                }else{
                    message.reply('Debes apostar primero');
                }
            }
            if(opcion[1] === 'plantarse'){
                if(cartas_jugador[contact.id.user]){
                    const ganador_juego = ganador(contact.id.user);
                    if(ganador_juego === 'jugador'){
                        update_info_player(contact.id.user, "dinero", getAllInfoPlayer(contact.id.user).dinero + dinero_bj[contact.id.user] * 2, true);
                        message.reply('Has ganado' + " las cartas del deler son: " + dealer[contact.id.user]);
                    }else if(ganador_juego === 'dealer'){
                        message.reply('Has perdido' + " las cartas del deler son: " + dealer[contact.id.user]);
                    }else{
                        message.reply('Empate');
                    }
                    delete cartas_jugador[contact.id.user];
                    delete dealer[contact.id.user];
                    delete dinero_bj[contact.id.user];
                }
            }
            if(opcion[1] === 'rendirse'){
                if(cartas_jugador[contact.id.user]){
                    delete cartas_jugador[contact.id.user];
                    delete dealer[contact.id.user];
                    delete dinero_bj[contact.id.user];
                    message.reply('Has perdido');
                }else{
                    message.reply('Debes apostar primero');
                }
            }
        }
    }
    if (message.body.toLocaleLowerCase() === 'ppt piedra') {
        await chat.sendSeen();
        await chat.sendStateTyping();
        const options = ['piedra', 'papel', 'tijera'];
        const randomIndex = Math.floor(Math.random() * options.length);
        if (options[randomIndex] === 'piedra') {
            message.reply('Empate el bot escogio piedra');
        } else if (options[randomIndex] === 'papel') {
            message.reply('Perdiste el bot escogio papel');
            update_info_player(contact.id.user, "ganadas", getAllInfoPlayer(contact.id.user).ganadas - 1, true);
        } else {
            message.reply('Ganaste el bot escogio tijera');
            update_info_player(contact.id.user, "ganadas", getAllInfoPlayer(contact.id.user).ganadas + 1, true);
        }
    }
    if (message.body.toLocaleLowerCase() === 'ppt papel') {
        await chat.sendSeen();
        await chat.sendStateTyping();
        const options = ['piedra', 'papel', 'tijera'];
        const randomIndex = Math.floor(Math.random() * options.length);
        if (options[randomIndex] === 'papel') {
            message.reply('Empate el bot escogio papel');
        } else if (options[randomIndex] === 'tijera') {
            message.reply('Perdiste el bot escogio tijera');
            update_info_player(contact.id.user, "ganadas", getAllInfoPlayer(contact.id.user).ganadas - 1, true);
        } else {
            message.reply('Ganaste el bot escogio piedra');
            update_info_player(contact.id.user, "ganadas", getAllInfoPlayer(contact.id.user).ganadas + 1, true);
        }
    }
    if (message.body.toLocaleLowerCase() === 'ppt tijera') {
        await chat.sendSeen();
        await chat.sendStateTyping();
        const options = ['piedra', 'papel', 'tijera'];
        const randomIndex = Math.floor(Math.random() * options.length);
        if (options[randomIndex] === 'tijera') {
            message.reply('Empate el bot escogio tijera');
        } else if (options[randomIndex] === 'piedra') {
            message.reply('Perdiste el bot escogio piedra');
            update_info_player(contact.id.user, "ganadas", getAllInfoPlayer(contact.id.user).ganadas - 1, true);
        } else {
            update_info_player(contact.id.user, "ganadas", getAllInfoPlayer(contact.id.user).ganadas + 1, true);
            message.reply('Ganaste el bot escogio papel');
        }
    }
    if(message.body.toLocaleLowerCase() === 'top ricos'){
        if(chat.isGroup){
            const los_ricos =  topPlayersWithMostMoney();
            const dinero_ricos = moneyTopPlayers();
            let menciones = []
            
            let messageToSend = "*Los Ricos*\n\n";

            for(mention of los_ricos){
                menciones.push(`${mention}@c.us`);
            }

            for (let i = 0; i < los_ricos.length; i++) {
                messageToSend += `${i + 1}. @${los_ricos[i]} con ${dinero_ricos[i]} monedas\n`;
            }
            chat.sendMessage(messageToSend, { mentions: menciones });
        }
    }
    if(message.body.toLocaleLowerCase() === 'top nivel'){
        if(chat.isGroup){
            const los_niveles = topPlayersWithMostLevel();
            const niveles = levelTopPlayers();
            let menciones = []
            let messageToSend = "*Los Mejores*\n\n";

            for(mention of los_niveles){
                menciones.push(`${mention}@c.us`);
            }

            for (let i = 0; i < los_niveles.length; i++) {
                messageToSend += `${i + 1}. @${los_niveles[i]} nivel ${niveles[i]}. \n`;
            }
            chat.sendMessage(messageToSend, { mentions: menciones });
        }
    }
    if(message.body.toLocaleLowerCase() === 'top mensajes'){
        if(chat.isGroup){
            const personas = topUsersMessages();
            const mensajes = messageUsers();
            let menciones = []
            let messageToSend = "*Los mas habladores*\n\n";
            for(mention of personas){
                menciones.push(`${mention}@c.us`);
            }
            for (let i = 0; i < personas.length; i++) {
                messageToSend += `${i + 1}. @${personas[i]} con ${mensajes[i]} mensajes\n`;
            }
            chat.sendMessage(messageToSend, { mentions: menciones });
        }
    }
    if(message.body.toLocaleLowerCase() === 'prueba'){
        const contactf = contact.name;
        const id = client.getNumberId(contact.id.user)
        const contactfr = await client.getContactById(id);
        message.reply(contactfr);
        message.reply(contactf);
        message.reply(id)
    }
    if (message.body.toLocaleLowerCase() === 'jugar' && watchBan(chat.id._serialized, 'todos') == true) {
        let tempmenu_game = menu_game;
        await chat.sendSeen();
        await chat.sendStateTyping();
        if (chat.isGroup) {
            jsonread(contact.id.user);
            addgroup(message.from);
            if (watchBan(chat.id._serialized, 'menciones') == false && watchBan(chat.id._serialized, 'todos') == true) {
                tempmenu_game = tempmenu_game.replace('formar pareja (fp) 👩🏻‍❤️‍💋‍👨🏻', '');
                message.reply(tempmenu_game);
            } else {
                message.reply(tempmenu_game);
            }
        } else {

            jsonread(contact.id.user);
            tempmenu_game = tempmenu_game.replace('formar pareja (fp) 👩🏻‍❤️‍💋‍👨🏻', '');
            message.reply(tempmenu_game);
        }
    }
    if (message.body.toLocaleLowerCase().startsWith('st')) {
        let part = message.body.split(' ');
        const partst = part.slice(0)[0];
        if(partst.length === 2){
            part = part.slice(1)
            await chat.sendSeen();
            await chat.sendStateTyping();
            let d;
            if (message.hasQuotedMsg) {
                const mensaje_citado = await message.getQuotedMessage();
                try {
                    d = await mensaje_citado.downloadMedia();
                } catch (err) {
                    message.reply('No pude descargar eso');
                }
                let media;
                if (mensaje_citado.hasMedia) {
                    try {
                        switch (mensaje_citado.type) {
                            case 'image':
                                media = new MessageMedia('image/png', d.data, 'sticker');
                                chat.sendMessage(media, { sendMediaAsSticker: true, stickerAuthor: 'Por Alastor', stickerName: 'Alastor Bot' });
                                break;
                            case 'video':
                                media = new MessageMedia('video/mp4', d.data, 'sticker');
                                chat.sendMessage(media, { sendMediaAsSticker: true, stickerAuthor: 'Por Alastor', stickerName: 'Alastor Bot' });
                                break;
                        }

                    } catch (err) {
                        message.reply('No se pudo crear el sticker');
                    }
                }
            } else if (message.hasMedia === true) {
                try {
                    d = await message.downloadMedia();
                } catch (err) {
                    message.reply('No pude descargar eso');
                }
                try {
                    switch (message.type) {
                        case 'image':
                            media = new MessageMedia('image/png', d.data, 'sticker');
                            chat.sendMessage(media, { sendMediaAsSticker: true, stickerAuthor: 'Por Alastor', stickerName: '' });
                            break;
                        case 'video':
                            media = new MessageMedia('video/mp4', d.data, 'sticker');
                            chat.sendMessage(media, { sendMediaAsSticker: true, stickerAuthor: 'Por Alastor', stickerName: 'Alastor Bot' });
                            break;
                    }
                } catch (err) {
                    message.reply('No se pudo crear el sticker');
                }
            } else if(part.length > 0){
                async function createStickerWithText(text) {
                    const image = new Jimp(512, 512, 0x00000000);
                    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK); 

                    const textImage = new Jimp(image.bitmap.width, image.bitmap.height);
                    textImage.print(font, 0, 0, {
                        text: text,
                        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
                    }, image.bitmap.width, image.bitmap.height);
                    textImage.color([{ apply: 'xor', params: ['#800000'] }]);
                    image.composite(textImage, 0, 0);

                    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
                    const sticker = new MessageMedia('image/png', buffer.toString('base64'), 'sticker');
                    return sticker;
                }
                
                async function sendSticker(to, text) {
                    const sticker = await createStickerWithText(text);
                    chat.sendMessage(sticker, { sendMediaAsSticker: true, stickerAuthor: 'Por Alastor', stickerName: 'Alastor Bot' });
                }
                sendSticker(message.from, part.join(' '));
            }
        }
    }

    const ContadorDeUnDia = (player) => {
        if(contadordia[player]){
            return;
        }
        let startTime = Date.now();
        contadordia[player] = {
            timeout: setTimeout(() => {
                delete contadordia[player];
            }, 60000),
            startTime: startTime,
            totalDuration: 60000
        };
    }
    const Tiempo_restante = (player) => {
        if(!contadordia[player]){
            return 0;
        }
        let elapsedTime = Date.now() - contadordia[player].startTime;
        return Math.floor((contadordia[player].totalDuration - elapsedTime) / 1000);
    }
    if(message.body.toLocaleLowerCase() === '!w'){
        if(contadordia[contact.id.user]){
            message.reply(`Ya trabajaste intentalo en ${Tiempo_restante(contact.id.user)} segundos`);
            return;
        }else if(chat.isGroup){
            message.reply('Uff trabajaste duro, alguien te pagó 1 moneda');
            update_info_player(contact.id.user, "dinero", getAllInfoPlayer(contact.id.user).dinero + 1, true);
            ContadorDeUnDia(contact.id.user);
        }
    }
    if (message.body.toLowerCase().startsWith("tv")) {
        let parts = message.body.split(' ');
        if(message.body.toLocaleLowerCase() === 'tv'){
            message.reply('Debes introducir un texto, y estos son los idiomas validos:\n\n en\n es\n fr\n de\n it\n ja\n ko\n nl\n pl\n pt\n ru\n zh\n pt');
            message.reply('Ejemplo:\n\n> tv en hola como estas');
            return;
        }
        let mensaje_citado;
        let text;
        valid_language_codes = ['in', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'nl', 'pl', 'pt', 'ru', 'zh', 'pt'];
        if (parts.length <= 2) {
            text = parts.slice(1).join(' ');
        } else {
            if (valid_language_codes.includes(parts[1])) {
                text = parts.slice(2).join(' ');
            } else {
                text = parts.slice(1).join(' ');
            }
        }
        let language;
        language = parts.length < 3 ? 'es' : parts[1];

        if (valid_language_codes.includes(language)) {
            // message.reply('el idioma no es valido los idiomas validos son:\n\n en\n es\n fr\n de\n it\n ja\n ko\n nl\n pl\n pt\n ru\n zh\n pt');
            if (language == 'in') {
                language = 'en';
            }
        } else {
            language = 'es';
        }


        async function processAudio() {
            if (message.hasQuotedMsg) {
                mensaje_citado = await message.getQuotedMessage();
            }
            googleTTS.getAudioBase64(text, { lang: language, slow: false })
                .then((base64) => {
                    const medi = new MessageMedia('audio/mp3', base64.toString('base64'), 'audio');
                    if (message.hasQuotedMsg) {
                        client.sendMessage(message.from, medi, { sendAudioAsVoice: true, quotedMessageId: mensaje_citado.id._serialized });
                    } else {
                        client.sendMessage(message.from, medi, { sendAudioAsVoice: true });
                    }
                }).catch((err) => {
                    message.reply('No pude crear el audio');
                });
        }

        processAudio();
    }

    const TempQuest = (id_group) => {
        if (groupTimes[id_group]) {
            return;
        }

        groupTimes[id_group] = setTimeout(() => {

            groupActiveQuestions(2, id_group, false);
            chat.sendMessage('La pregunta ha expirado');

            delete groupTimes[id_group];
        }, 10000);
    }
    if(message.body.toLocaleLowerCase() === '!q'){
        if(chat.isGroup){
            if(groupActiveQuestions(1 ,chat.id._serialized) === false && watchBan(chat.id._serialized, 'todos') === true){
                let indexp = quest.newIndexP();
                groupActiveQuestions(8, chat.id._serialized, quest.readTitle());
                groupActiveQuestions(6, chat.id._serialized, indexp);
                groupActiveQuestions(2, chat.id._serialized, true);
                groupActiveQuestions(3, chat.id._serialized ,quest.correctAnswerIndex());
                message.reply(quest.readTitle() + "\n\n" + quest.readResponse());
                TempQuest(chat.id._serialized);
            }else{
                message.reply('Ya hay una pregunta activa');
            }
        }else{
            message.reply('Este juego solo funciona en grupos');
        }
    }
    if (message.body.toLocaleLowerCase() === 'formar pareja' || message.body.toLocaleLowerCase() === 'fp') {
        if (chat.isGroup) {
            if (addgroup(chat.id._serialized) && watchBan(chat.id._serialized, 'fp') && watchBan(chat.id._serialized, 'todos') && watchBan(chat.id._serialized, 'menciones')) {
                if (watchBan(chat.id._serialized, 'admins') == false && participantes(message.author) && getAllInfoPlayer(contact.id.user).casado === "nadie :(") {
                    await chat.sendSeen();
                    await chat.sendStateTyping();
                    let participantes = [];
                    let pareja = [];
                    chat.participants.forEach((participant) => {
                        participantes.push(participant.id.user);
                    });
                    let random = RandomTwoIndex(participantes);
                    pareja.push(participantes[random[0]]);
                    pareja.push(participantes[random[1]]);
                    let mensaje =
                        `                *¡Felicidades a* 
                    *esta hermosa pareja!*
                        (ɔ ˘⌣˘)˘⌣˘ c)
                    @${pareja[0]} ❤️ @${pareja[1]}`;
                    chat.sendMessage(mensaje, { mentions: [`${pareja[0]}@c.us`, `${pareja[1]}@c.us`] });
                } else if (watchBan(chat.id._serialized, 'admins') == true) {
                    await chat.sendSeen();
                    await chat.sendStateTyping();

                    let participantes = [];
                    let pareja = [];
                    chat.participants.forEach((participant) => {
                        participantes.push(participant.id.user);
                    });
                    let random = RandomTwoIndex(participantes);
                    pareja.push(participantes[random[0]]);
                    pareja.push(participantes[random[1]]);
                    let mensaje =
                        `                *¡Felicidades a* 
                    *esta hermosa pareja!*
                        (ɔ ˘⌣˘)˘⌣˘ c)
                    @${pareja[0]} ❤️ @${pareja[1]}`;
                    chat.sendMessage(mensaje, { mentions: [`${pareja[0]}@c.us`, `${pareja[1]}@c.us`] });
                }
            }
        } else {
            message.reply('Este comando solo funciona en grupos');
        }
    }
    // Economia ----------------------------------------------------
    if (message.body.toLocaleLowerCase().startsWith('banco ')) {
        let parts = message.body.split(' ');
        let opcion = parts[1];
        
        if (opcion === 'depositar' || opcion === 'dp') {
            let cantidad = parts[2];
            if (cantidad > 0 && cantidad <= getAllInfoPlayer(contact.id.user).dinero) {
                update_info_player(contact.id.user, "dinero", getAllInfoPlayer(contact.id.user).dinero - parseInt(cantidad), true);
                update_info_player(contact.id.user, "banco", getAllInfoPlayer(contact.id.user).banco + parseInt(cantidad), true);
                message.reply(`Has depositado ${cantidad} a tu cuenta bancaria`);
            } else {
                message.reply('No tienes suficiente dinero');
            }
        } else if (opcion === 'retirar' || opcion === 'rt') {
            let cantidad = parts[2];
            if (cantidad > 0 && cantidad <= getAllInfoPlayer(contact.id.user).banco) {
                update_info_player(contact.id.user, "dinero", getAllInfoPlayer(contact.id.user).dinero + parseInt(cantidad), true);
                update_info_player(contact.id.user, "banco", getAllInfoPlayer(contact.id.user).banco - parseInt(cantidad), true);
                message.reply(`Has retirado ${cantidad} de tu cuenta bancaria`);
            } else {
                message.reply('No tienes suficiente dinero en el banco');

            }
        } else if (opcion === 'transferir' || opcion === "tr") {
            try {
                let cantidad = parts[2];
                let id = parts[3];
                id = id.replace('@', '');
                console.log(cantidad);
                if (!isNaN(cantidad)) {
                    if (cantidad > 0 && cantidad <= getAllInfoPlayer(contact.id.user).banco) {
                        update_info_player(contact.id.user, "banco", getAllInfoPlayer(contact.id.user).banco - parseInt(cantidad), true);
                        update_info_player(id, "banco", getAllInfoPlayer(id).banco + parseInt(cantidad), true);
                        message.reply(`Has transferido ${cantidad} a ${id}`);
                    } else {
                        message.reply('No tienes suficiente dinero en el banco');
                    }
                }
               
            } catch (error) {
                console.error(error);
            }
        }else if(opcion === 'cambiar puntos' || opcion === 'cp'){
            try{
                let cantidad = parts[2];
                cantidad = parseInt(cantidad);
                if(cantidad > 0 && cantidad <= getAllInfoPlayer(contact.id.user).ganadas){
                    update_info_player(contact.id.user, "ganadas", getAllInfoPlayer(contact.id.user).ganadas - parseInt(cantidad), true);
                    update_info_player(contact.id.user, "dinero", getAllInfoPlayer(contact.id.user).dinero + parseInt(cantidad), true);
                    message.reply(`Has cambiado ${cantidad} puntos por dinero`);
                }else{
                    message.reply('No tienes suficientes puntos');
                }
            }catch(err){
                console.error(err);
            }
        }else{
            message.reply('> Las opciones del banco son:\n\n> Depositar (dp)\n> Retirar (rt)\n> Transferir (tr)\n> Cambiar puntos por dinero(cp)');
        }
    }
    if (message.body.toLocaleLowerCase() === 'tienda') {
        let articulos = {
            "roles": {
                "panadero": 200,    
                "cocinero": 1000,
                "escritor":50,
                "abogado": 10000,
                "banquero": 10000,
                "ama": 0,
                "carpintero": 500,
                "tik toker": 100,
                "stripper": 60,
                "bailarin": 50,
                "ladron": 0,
                "sicario": 500,
                "narco": 1000,
                "policia": 3000,
                "detective": 5000,
                "doctor general": 5000,
                "cirujano": 100000,
                "cirujano plastico": 200000,
                "enfermera": 2000,
            },
            "Animales":{
                "baba": 5,
                "pollo": 10
            },
            "objetos":{
                "casa": "2,000,000",
                "carro": "500,000",
                "moto": "20,000",
                "avion": "10,000,000",
                "cuchillo": 10,
                "pistola": 100,
                "fusil": 500,
                "rifle": 1000,
                "lapiz": 5,
                "papel": 2,
            }
        }
        let mensaje1 = `*Bienvenido a la Tienda*\n\nEstos son los articulos disponibles por el momento:\n\nRoles:\n\n`;
        for (let rol in articulos.roles) {
            mensaje1 += `${rol}: ${articulos.roles[rol]} monedas\n`;
            if(rol === "bailarin"){
                mensaje1 += "\n\n*Delincuencia*\n\n";
            }else if(rol === "narco"){
                mensaje1 += "\n\n*Comisaria*\n\n";
            }else if(rol === "detective"){
                mensaje1 += "\n\n*Hospital*\n\n";
            }
        }
        mensaje1 += "\n\n*Pokemos*\n\n";
        for (let animal in articulos.Animales) {
            mensaje1 += `${animal}: ${articulos.Animales[animal]} monedas\n`;
        }
        mensaje1 += "\n\n*Objetos:*\n\n";
        for (let objeto in articulos.objetos) {
            mensaje1 += `${objeto}: ${articulos.objetos[objeto]} monedas\n`;
        }
        message.reply(mensaje1);
    }
    if (message.body.toLocaleLowerCase().startsWith('comprar ')) {
        let parts = message.body.split(' ');
        let articulo = parts[1];
        articulo = quitar_acentos(articulo.toLocaleLowerCase());
        let articulos = {
            "roles": {
                "panadero": 200,    
                "cocinero": 1000,
                "escritor":50,
                "abogado": 10000,
                "banquero": 10000,
                "ama": 0,
                "carpintero": 500,
                "tik toker": 100,
                "stripper": 60,
                "bailarin": 50,
                "ladron": 0,
                "sicario": 500,
                "narco": 1000,
                "policia": 3000,
                "detective": 5000,
                "doctor general": 5000,
                "cirujano": 100000,
                "cirujano plastico": 200000,
                "enfermera": 2000,
            },
            "Animales":{
                "baba": 5,
                "pollo": 10,
            },
            "objetos":{
                "casa": 2000000,
                "carro": 500000,
                "moto": 20000,
                "avion": 10000000,
                "cuchillo": 10,
                "pistola": 100,
                "fusil": 500,
                "rifle": 1000,
                "lapiz": 5,
                "papel": 2,

            }
        }
        if (getAllInfoPlayer(contact.id.user).dinero >= 0 && getAllInfoPlayer(contact.id.user).nivel > 1){
            if(articulo in articulos.roles){
                for (let rol in articulos.roles) {
                    if (articulo === rol) {
                        if (getAllInfoPlayer(contact.id.user).roles !== rol){
                            if(getAllInfoPlayer(contact.id.user).dinero >= articulos.roles[rol]){
                                if(rol === "ama" && !getAllInfoPlayer(getAllInfoPlayer(contact.id.user).casado).roles === "ama" && !getAllInfoPlayer(getAllInfoPlayer(contact.id.user).casado).roles === "vagabundo"){
                                    update_info_player(contact.id.user, "dinero", getAllInfoPlayer(contact.id.user).dinero - articulos.roles[rol], true);
                                    update_info_player(contact.id.user, "roles", rol, true);
                                    message.reply('Has comprado el articulo');
                                }else{
                                    update_info_player(contact.id.user, "dinero", getAllInfoPlayer(contact.id.user).dinero - articulos.roles[rol], true);
                                    update_info_player(contact.id.user, "roles", rol, true);
                                    message.reply('Has comprado el articulo');
                                }
                            }else{
                                message.reply('No tienes suficiente dinero');
                            }
                        } else {
                            message.reply('Ya tienes ese articulo');
                            break;
                        }
                    }
                }
            }else if(articulo in articulos.objetos){
                for (let objeto in articulos.objetos) {
                    if (articulo === objeto) {
                        if(getAllInfoPlayer(contact.id.user).dinero >= articulos.objetos[objeto]){
                            update_info_player(contact.id.user, "dinero", getAllInfoPlayer(contact.id.user).dinero - articulos.objetos[objeto], true);
                            update_info_player(contact.id.user, "objetos", objeto, false);
                            message.reply('Has comprado el articulo');
                        }else{
                            message.reply('No tienes suficiente dinero');
                        }
                    }
                }
            }else if(articulo in articulos.Animales){
                for (let animal in articulos.Animales) {
                    if (articulo === animal) {
                        if(getAllInfoPlayer(contact.id.user).dinero >= articulos.Animales[animal]){
                            if(addAnimal(contact.id.user, animal)){
                                message.reply('Ya tenias este animal');
                            }else{
                                update_info_player(contact.id.user, "dinero", getAllInfoPlayer(contact.id.user).dinero - articulos.Animales[animal], true);
                                message.reply('Has comprado el articulo');
                            }
                        }else{
                            message.reply('No tienes suficiente dinero');
                        }
                    }
                }
            }
        } else {
            message.reply('> No tienes suficiente dinero \n> O\n> Necesitas al menos el nivel 2');
        }
    }
    //-------------------------------------------------------------------------------------------------
    if(message.body.toLocaleLowerCase().startsWith('!sex') || message.body.toLocaleLowerCase().startsWith('!sexo')){
        let parts = message.body.split(' ');
        try{
            let pareja1 = parts[1];
            let pareja2 = parts[2];
            pareja1 = pareja1.replace('@', '');
            pareja2 = pareja2.replace('@', '');
            if(!isNaN(pareja1) && !isNaN(pareja2)){
                if(pareja1 === pareja2){
                    message.reply('No puedes tener sexo contigo mismo');
                }else{
                    if(getAllInfoPlayer(pareja1).casado === pareja2 && getAllInfoPlayer(pareja2).casado === pareja1){
                        chat.sendMessage(`@${pareja1} y @${pareja2} tuvieron sexo`, {mentions: [pareja1 + '@c.us', pareja2 + '@c.us']})
                    }else{
                        if(getAllInfoPlayer(pareja1).casado === "nadie :(" && getAllInfoPlayer(pareja2).casado !== "nadie :("){
                            chat.sendMessage(`@${pareja2} tuvo sexo y es infiel`, {mentions: [pareja2 + '@c.us']}) 
                        }else if(getAllInfoPlayer(pareja1).casado !== pareja2 && getAllInfoPlayer(pareja2).casado !== pareja1){
                            chat.sendMessage(`@${pareja1} y @${pareja2} tuvieron sexo par de infieles`, {mentions: [pareja1 + '@c.us', pareja2 + '@c.us']})               
                        }
                        else{
                            chat.sendMessage(`@${pareja1} tuvo sexo y fue infiel`, {mentions: [pareja1 + '@c.us']})
                        }
                    }
                }
            }else{
                message.reply('Introduce un numero valido');
            }
        }catch(err){
            message.reply('El comando es:\nsexo @numero1 @numero2');
        }

    }  
    if (message.body.toLocaleLowerCase() == 'sf') {
        await chat.sendSeen();
        await chat.sendStateTyping();
        if (message.hasQuotedMsg) {
            const mensaje_citado = await message.getQuotedMessage();
            if (mensaje_citado.hasMedia) {
                try {
                    const d = await mensaje_citado.downloadMedia();
                    let media;
                    switch (mensaje_citado.type) {
                        case 'image':
                            media = new MessageMedia('image/png', d.data, 'sticker');
                            break;
                        case 'video':
                            media = new MessageMedia('video/mp4', d.data, 'sticker');
                            break;
                        case 'ptt':
                            media = new MessageMedia('audio/mp3', d.data, 'sticker');
                            break;
                        case 'sticker':
                            media = new MessageMedia('image/webp', d.data, 'sticker');
                            break;
                    }
                    if (media) {
                        chat.sendMessage(media);
                    }
                } catch (err) {
                    message.reply('No pude enviar la foto, video o audio');
                }
            }
        } else if (message.hasMedia === true) {
            const f = await message.downloadMedia();
            try {
                switch (message.type) {
                    case 'image':
                        media = new MessageMedia('image/png', f.data, 'sticker');
                        chat.sendMessage(media);
                        break;
                    case 'video':
                        media = new MessageMedia('video/mp4', f.data, 'sticker');
                        chat.sendMessage(media);
                        break;
                    case 'ptt':
                        media = new MessageMedia('audio/mp3', f.data, 'sticker');
                        chat.sendMessage(media);
                        break;
                }

            } catch (err) {
                message.reply('No se pudo enviar la foto o video');
            }
        } else {
            message.reply('No pusiste una foto o video, nisiquiera citaste una');
        }
    }
    if (message.body.toLocaleLowerCase() == 'br') {
        if (message.hasQuotedMsg) {
            const quotedMsg = await message.getQuotedMessage();
            if (quotedMsg.fromMe) {
                quotedMsg.delete(true);
            } else {
                message.reply('Solo puedo borrar mensajes enviados por mi');
            }
        }
    }
    if(message.body.toLocaleLowerCase() === 'baba'){
        if(message.hasQuotedMsg){
            const quotedMsg = await message.getQuotedMessage();
            const contacto_baba = await quotedMsg.getContact();
            if(contacto_baba.id.user === '595973819264'){
                let random_number = Math.floor(Math.random() * 2) + 1;
                if(Alastor_Number.includes(contact.id.user)){
                    message.reply('Felicidades has atrapado a Baba ganaste una moneda');
                    update_info_player(contact.id.user, "dinero", getAllInfoPlayer(contact.id.user).dinero + 1, true);
                }else if(animalExist(contact.id.user, 'baba')){
                    switch (random_number) {
                        case 1:
                            message.reply('Felicidades has atrapado a Baba ganaste media moneda');
                            update_info_player(contact.id.user, "dinero", getAllInfoPlayer(contact.id.user).dinero + 0.5, true);
                            break;
                        case 2:
                            message.reply('*Baba escapó :(*')
                    }
                }else{
                    message.reply('No tienes a Baba');
                }
            }
        }
    }
    if(message.body.toLocaleLowerCase() === 'pokemons'){
        let pokemons = getAllAnimals(contact.id.user);
        let mensaje = "*Tus pokemons son:*\n\n";
        for(let pokemon of pokemons){
            mensaje += `${pokemon.nombre}\n`;
        }
        message.reply(mensaje);
    }
    if(message.body.toLocaleLowerCase().startsWith('stats ')){
        pokemon = message.body.split(' ');
        pokemon = pokemon.slice(1).join(' ');
        console.log(pokemon)
        if(animalExist(contact.id.user, pokemon)){
            let stats = await getAnimalParameters(contact.id.user, pokemon);
            let mensaje = `
            *Estadisticas de ${pokemon}*\n\n
            *Nombre:* ${stats.nombre}\n
            *Tipo:* ${stats.tipo}\n
            *Cansancio:* ${stats.cansancio}\n
            *Hambre:* ${stats.hambre}\n
            *Felicidad:* ${stats.felicidad}\n
            *Salud:* ${stats.salud}\n`;
            message.reply(mensaje);
        }
    }
    function descargarM(stream, mensaje_error){
        ffmpeg()
            .input(stream)
            .audioBitrate(128)
            .save('n.mp3')
            .on('end', () => {
                const file = fs.readFileSync('n.mp3');
                const media = new MessageMedia('audio/mp3', file.toString('base64'), 'audio');
                chat.sendMessage(media, { sendAudioAsVoice: true, quotedMessageId: message.id._serialized });
                counterListRequestMusic = 0;
            })
            .on('error', (err) => {
                console.error(err);
                counterListRequestMusic = 0;
                message.reply(mensaje_error);
            })
    }
    if (message.body.toLowerCase().startsWith("m ")) {
            counterListRequestMusic++;
            const mensaje_error = "*Lo siento, no pude descargar la canción 😞*";
            if(counterListRequestMusic <= 1){
                try {
                    const parts = message.body.split(' ');
                    const search = parts.slice(1).join(' ');
                    let stream;
                    await chat.sendSeen();
                    await chat.sendStateTyping();
                    if (search.includes('https://youtu.be/')){
                        stream = ytdl(search, { filter: 'audioonly' });
                        descargarM(stream, mensaje_error);
                        return
                    }
                    await youtube.search(search, { limit: 1 }).then(x => {
                    try {
                        if (x.length === 0) {
                            message.reply('No puede encontrar esa cosa que escribiste, toma un curso de ortografía');
                            counterListRequestMusic = 0;
                            return;
                        }
                        stream = ytdl(x[0].url, { filter: 'audioonly' });
                        descargarM(stream, mensaje_error);

                    } catch (error) {
                        counterListRequestMusic = 0;
                        console.error('Ocurrió un error:', error);
                        message.reply(mensaje_error);
                    }
                }).catch(err => {
                    counterListRequestMusic = 0;
                    console.error('Ocurrió un error en youtube.search:', err);
                    message.reply(mensaje_error);
                });
            } catch (error) {
                counterListRequestMusic = 0;
                console.error('Ocurrió un error:', error);
                message.reply(mensaje_error);
            }
        }else{
            message.reply('Espera un momento estoy ocupado enviando una canción');
        }
    }
    function descargarV(stream, mensaje_error){
        ffmpeg()
            .input(stream)
            .save('video.mp4')
            .on('end', () => {
                const file = fs.readFileSync('video.mp4');
                const media = new MessageMedia('video/mp4', file.toString('base64'), 'video');
                chat.sendMessage(media, { quotedMessageId: message.id._serialized });
                counterListRequestVideo = 0;
            })
            .on('error', (err) => {
                console.error(err);
                counterListRequestVideo = 0;
                message.reply(mensaje_error);
            })
    }
    async function descargarVideoIG(url, mensaje_error) {
        try {
            const dataList = await instagramDl(url);
            const response = await fetch(dataList[0].download_link);
            if (response.ok) {
                const buffer = await response.buffer();
                fs.writeFile("video.mp4", buffer, () => {
                    const file = fs.readFileSync('video.mp4');
                    const media = new MessageMedia('video/mp4', file.toString('base64'), 'video');
                    chat.sendMessage(media, { quotedMessageId: message.id._serialized });
                    counterListRequestVideo = 0;
                });
            } else {
                counterListRequestVideo = 0;
                message.reply(mensaje_error);
            }
        } catch (err) {
            console.error(err);
            counterListRequestVideo = 0;
            message.reply(mensaje_error);
        }
    }
    if (message.body.toLowerCase().startsWith("v ")) {
            counterListRequestVideo++;
            const mensaje_error = "*Lo siento, no pude descargar el video 😞*";
            if(counterListRequestVideo <= 1){
                try {
                    const parts = message.body.split(' ');
                    const search = parts.slice(1).join(' ');
                    let stream;
                    await chat.sendSeen();
                    await chat.sendStateTyping();
                    if (search.includes('https://youtu.be/')){
                        stream = ytdl(search, { filter: 'audioandvideo', quality: 'lowest'});
                        descargarV(stream, mensaje_error);
                        return
                    }else if(search.includes('https://www.instagram.com/')){
                        descargarVideoIG(search, mensaje_error);
                        return
                    }
                    await youtube.search(search, { limit: 1 }).then(x => {
                    try {
                        if (x.length === 0) {
                            message.reply('No puede encontrar esa cosa que escribiste, toma un curso de ortografía');
                            counterListRequestVideo = 0;
                            return;
                        }
                        stream = ytdl(x[0].url, { filter: 'audioandvideo', quality: 'lowest'});
                        descargarV(stream, mensaje_error);

                    } catch (error) {
                        counterListRequestVideo = 0;
                        console.error('Ocurrió un error:', error);
                        message.reply(mensaje_error);
                    }
                }).catch(err => {
                    counterListRequestVideo = 0;
                    console.error('Ocurrió un error en youtube.search:', err);
                    message.reply(mensaje_error);
                });
            } catch (error) {
                counterListRequestVideo = 0;
                console.error('Ocurrió un error:', error);
                message.reply(mensaje_error);
            }
        }else{
            message.reply('Espera un momento estoy ocupado enviando un video');
        }
    }

    async function mentionAll(text){
        if(chat.isGroup){
            try{
                if(participantes(message.author)){
                    let mention = [];

                    for(let participant of chat.participants) {
                        mention.push(`${participant.id.user}@c.us`);
                    }
                    await chat.sendMessage(text, { mentions: mention });
                }else{
                    message.reply('Solo los administradores pueden usar este comando');
                }
            }catch(err){
                message.reply('No pude mencionar a todos');
            }
        }
    }
    if(message.body.toLocaleLowerCase() === '!todos' || message.body.toLocaleLowerCase().startsWith('!todos')){
        const parts = message.body.split(' ');
        if(parts.length > 1 && !parts.slice(1).join(' ').toLocaleLowerCase().includes('!todos')){
            mentionAll(parts.slice(1).join(' '));
        }else{
            mentionAll('Hola a todos, activense!!');
        }
    }    
    if (message.body.toLocaleLowerCase() == 'ajustes' || message.body.toLocaleLowerCase() == 'as') {
        if (chat.isGroup) {
            addgroup(message.from);
            if (participantes(message.author)) {
                await chat.sendSeen();
                await chat.sendStateTyping();
                option.ajustes = 1;
                message.reply(
                    "*Opciones*\n\n" +
                    "Juego (j)\n" +
                    "Comandos (cd)\n" +
                    "Desactivar bot (db)\n" +
                    "Activar bot (ab)\n\n" +
                    "Este menu aun esta en desarrollo por lo que puede que no funcione correctamente")
            }
        }

    }

    else if (message.body.toLocaleLowerCase() == 'juego' || message.body.toLocaleLowerCase() == 'j') {
        if (chat.isGroup) {
            if (option.ajustes == 1) {
                await chat.sendSeen();
                await chat.sendStateTyping();
                if (participantes(message.author)) {
                    option.juego = 1;
                    option.ajustes = 0;
                    let menu_juego = option_game;
                    if (watchBan(chat.id._serialized, 'todos') == false) {
                        menu_juego = menu_juego.replace('1. Quitar la opción Juego\n', '1. Devolver la opción Juego\n');
                        menu_juego = menu_juego.replace('2. Quitar los Juegos con menciones\n', '');
                        menu_juego = menu_juego.replace('3. Todos pueden utilizar los juegos con menciones', '');
                    }
                    if (watchBan(chat.id._serialized, 'menciones') == false) {
                        menu_juego = menu_juego.replace('2. Quitar los Juegos con menciones\n', '2. Devolver los Juegos con menciones\n');
                        menu_juego = menu_juego.replace('3. Todos pueden utilizar los juegos con menciones', '');
                    }
                    if (watchBan(chat.id._serialized, 'admins') == false) {
                        menu_juego = menu_juego.replace('3. Todos pueden utilizar los juegos con menciones', '3. Solo los administradores pueden utilizar los juegos con menciones');
                    }
                    message.reply(menu_juego);
                }
            }
        }
    }
    async function comp(resp){ 
        const quotedMsg = await message.getQuotedMessage();
        if(quotedMsg.fromMe && quotedMsg.body.toLocaleLowerCase().includes(groupActiveQuestions(7, chat.id._serialized).toLocaleLowerCase())){
            groupActiveQuestions(2, chat.id._serialized, false);
            if (groupTimes[chat.id._serialized]) {
                clearTimeout(groupTimes[chat.id._serialized]);
                delete groupTimes[chat.id._serialized];
            }
            if(resp === groupActiveQuestions(4, chat.id._serialized)){
                message.reply("Respuesta correcta ganaste 1 punto 👍 ");
                update_info_player(contact.id.user, "ganadas", getAllInfoPlayer(contact.id.user).ganadas + 1, true);
            }else{
                message.reply(`Respuesta incorrecta, la respuesta correcta es: ${quest.correctAnswerselected(groupActiveQuestions(5, chat.id._serialized), groupActiveQuestions(4, chat.id._serialized))} perdiste dos puntos 👎👎`);
                update_info_player(contact.id.user, "ganadas", getAllInfoPlayer(contact.id.user).ganadas - 2, true);
            }
        }
    }
    if (message.body.toLocaleLowerCase() == '1') {
        if(message.hasQuotedMsg && groupActiveQuestions(1, chat.id._serialized)){      
            comp(1);     
        }
        if (option.juego == 1) {
            if (watchBan(chat.id._serialized, 'todos') == false) {
                QuitBan(chat.id._serialized, 'todos');
                option.juego = 0;
                message.reply("Se ha devuelto la opción Juego");
            } else {
                Bangame(message.from, ['todos']);
                option.juego = 0;
                message.reply("Se ha quitado la opción Juego");
            }
        }
    }
    if (message.body.toLocaleLowerCase() == '2') {
        if(message.hasQuotedMsg && groupActiveQuestions(1, chat.id._serialized)){
            comp(2);
        }
        if (option.juego == 1) {
            if (watchBan(chat.id._serialized, 'todos')) {
                if (watchBan(chat.id._serialized, 'menciones')) {
                    Bangame(message.from, ['menciones']);
                    option.juego = 0;
                    message.reply("Se han quitado los juegos con menciones");
                } else {
                    QuitBan(chat.id._serialized, 'menciones');
                    option.juego = 0;
                    message.reply("Se han devuelto los juegos con menciones");
                }
            }
        }
    }
    if (message.body.toLocaleLowerCase() == '3') {
        if(message.hasQuotedMsg && groupActiveQuestions(1, chat.id._serialized)){
            comp(3);
        }
        if (option.juego == 1) {
            if (watchBan(chat.id._serialized, 'todos')) {
                if (watchBan(chat.id._serialized, 'admins')) {
                    Bangame(message.from, ['admins']);
                    option.juego = 0;
                    message.reply("Ahora solo los administradores pueden utilizar los juegos con menciones");
                } else {
                    QuitBan(chat.id._serialized, 'admins');
                    option.juego = 0;
                    message.reply("Ahora todos pueden utilizar los juegos con menciones");
                }
            }
        }
    }
    if(message.body.toLocaleLowerCase() === 'sb' && Alastor_Number.includes(contact.id.user)){
        client.destroy();
        process.exit();
    }
    if(message.body.toLocaleLowerCase() == 'donacion' || message.body.toLocaleLowerCase() == 'donar'){
        message.reply(`
        🌟 *Apoya Mi Trabajo* 🌟

        Cada contribución es un gran apoyo para continuar desarrollando el bot que tanto disfrutas.
        
        *Opciones de Donación:*
        
        ☕ Café para el Creador - Con solo $1, puedes ofrecerme un café que me ayudará a mantenerme programando con energía.
        
        💻 Gastos del Servidor y Desarrollo - Con $10 al mes, apoyas directamente los costos del servidor y el desarrollo continuo del bot.
        ¿Quieres contribuir?
        
        *Si quieres que el Bot entre a tu grupo dona algo*

        Haz clic aquí y elige cómo quieres apoyar: 
        Donar Ahora 💖 https://www.patreon.com/alastor782/membership
        `);
    }
    if (message.body.toLocaleLowerCase() === 'creador' || message.body.toLocaleLowerCase() === 'como se crea un bot') {
        await chat.sendSeen();
        await chat.sendStateTyping();
        message.reply(`                 
            *INFORMACIÓN*
        *SOBRE EL CREADOR*
            *DEL BOT 𖠌*

    ¡Hola! ◡̈
    Puedes comunicarte con mi creador desde este link:
    
    wa.me/${Alastor_Number[0]}
    
    𖤣.𖥧.𖡼.⚘𖤣.𖥧.𖡼.⚘𖤣.𖥧.𖡼.⚘𖤣.𖥧.𖡼.⚘𖤣.
    Aquí puedes Contactar con el diseñador del menu:

    wa.me/5144637126`
    
        );
    }
});
client.initialize()