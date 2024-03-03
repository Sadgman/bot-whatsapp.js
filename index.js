const qrcode = require('qrcode-terminal');
const fs = require('fs');
const googleTTS = require('google-tts-api');
const youtube = require('youtube-sr').default;
const ytdl = require('ytdl-core');
const { obtenerPais } = require('./prefix.js');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const { get } = require('http');
const { constrainedMemory } = require('process');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

let client;
ffmpeg.setFfmpegPath(ffmpegPath);

if ((process.arch === 'arm' || process.arch === "arm64") && process.execPath === '/usr/bin/node') {
    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            args: ['-no-sandbox'],
            executablePath: '/usr/bin/chromium-browser'
        },
        ffmpegPath: '/usr/bin/ffmpeg'

    });
} else {
    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            executablePath: '/usr/bin/google-chrome-stable'
        },
        ffmpegPath: '/usr/bin/ffmpeg'

    });
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
function jsonread(player) {
    let jsonfile = fs.readFileSync('data.json', 'utf-8');
    let data = JSON.parse(jsonfile);
    dataplayer =
    {
        id: player,
        casado: "nadie :(",
        nivel: 0,
        ganadas: 0,
        dinero: 0,
        mensajes: 0,
        banco: 0,
        roles: "vagabundo",
        objetos: []
    };
    let encuentra = false;
    for (let i = 0; i < data.players.length; i++) {
        if (data.players[i].id === player) {
            encuentra = true;
            break;
        }
    }
    if (encuentra === false) {
        data.players.push(dataplayer);
        fs.writeFileSync('data.json', JSON.stringify(data, null, 4), 'utf-8');
    }
    return encuentra;
}
/**
 * 
 * @param {int} dias 
 * @param {int} opcion 
 * @returns retorna false si los dias no son iguales y true si son iguales
 */
function update_dias(dias, opcion) {
    try {
        let jsonfile = fs.readFileSync('data.json', 'utf-8');
        let data = JSON.parse(jsonfile);
        if(opcion === 1){    
            data.informacion.dias = dias;
            fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
        }else if(opcion === 2){
            if(data.informacion.dias !== dias){
                return false;
            }else{
                return true;
            }
        }
    } catch (err) {
        console.log(err);
        return null;
    }
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
function getAllInfoPlayer(player) {
    try {
        let jsonfile = fs.readFileSync('data.json', 'utf-8');
        let data = JSON.parse(jsonfile);
        for (let i = 0; i < data.players.length; i++) {
            if (data.players[i].id === player) {
                return data.players[i];
            }
        }
    } catch (err) {
        console.log(err);
        return null;
    }
}
function update_info_player(player, type, value, rem) {
    try {
        let jsonfile = fs.readFileSync('data.json', 'utf-8');
        let data = JSON.parse(jsonfile);
        if (rem === false) {
            
            for (let i = 0; i < data.players.length; i++) {
                if (data.players[i].id === player) {
                    data.players[i][type].push(value);
                }
            }
        }else{
            for (let i = 0; i < data.players.length; i++) {
                if (data.players[i].id === player) {
                    data.players[i][type] = value;
                }
            }
        }
        fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    } catch (err) {
        console.log(err);
        return null;
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
function botIsAdmin(id_group, option){
    let jsonfile = fs.readFileSync('data.json', 'utf-8');
    let data = JSON.parse(jsonfile);
    if(option === 1){
        for (i = 0; i < data.grouplist.length; i++) {
            if (data.grouplist[i].id === id_group) {
                return data.grouplist[i].bot_admin
            }
        }
    }else if(option === 2){
        for (i = 0; i < data.grouplist.length; i++) {
            if (data.grouplist[i].id === id_group) {
                data.grouplist[i].bot_admin = true;
                fs.writeFileSync('data.json', JSON.stringify(data, null, 4), 'utf-8');
                break;
            }
        }
    }else{
        for (i = 0; i < data.grouplist.length; i++) {
            if (data.grouplist[i].id === id_group) {
                data.grouplist[i].bot_admin = false;
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
    notification.reply(`Bienvenido al grupo, @${notification.recipientIds[0].replace('@c.us', '')}`, {
        mentions: [notification.recipientIds[0]]
    });
});
client.on('group_admin_changed', (notification) => {
    notification.getChat().then((chat) => {
        addgroup(chat.id._serialized);
        if (notification.type === 'promote') {
            if(notification.recipientIds[0] === client.info.wid._serialized){
                botIsAdmin(chat.id._serialized, 2);
            }
            console.log(`You were promoted by ${notification.author}`);
        } else if (notification.type === 'demote'){
            if(notification.recipientIds[0] === client.info.wid._serialized){
                botIsAdmin(chat.id._serialized, 3);
            }
            console.log(`You were demoted by ${notification.author}`);
        }
    });
});
let menu = `
~*MENU*~

📋🧾📄| Menu

👨‍👩‍👧‍👦🏡💞 | !todos (Only Admins).

📊📈📉 | IO (Stats)

🧟 🚿🛁| rnu (Recomendar anime).

🎮 👾🎧| Jugar.

👰‍♀️❤️‍🔥🤵‍♂ | Cr (Amor)

🚪🫠 😦| Divorcio(1 punto y 20 mensajes)

🃏🎞️🤳| St (crea sticker de la imagen que respondas).

🔈🔉🔊 | TV (Crea un audio)

📸 🕺🕴️| Sf (Foto o video de imagen temporal) 

❌🚫 📛| Br (Borrar mensaje del bot)

🏪🏬💸 | Tienda

🏦💰💱 | Banco(banco cp n°)

🧊⛏️🕹️ | MS (servidor de Minecraft)

📝⚙️🪛 | As (Ajustes).

👨🏻‍💻👀 🛐— creador.

¡Por ahora estas son todas las opciones que puedes disfrutar! Sigue apoyando.
`
const option_game = "*Opciones*\n\n" + "1. Quitar la opción Juego\n" + "2. Quitar los Juegos con menciones\n" + "3. Todos pueden utilizar los juegos con menciones";
const menu_game = "estos son los juegos disponibles por el momento:\n\n" + "Piedra 🪨, papel 🧻 o tiejeras ✂️(ppt)\n" + "formar pareja (fp) 👩🏻‍❤️‍💋‍👨🏻\n Dado 🎲"
const links_baneados = ["https://is.gd/LOVELY_WORLD", "https://is.gd/Sex_adult_girl", "https://is.gd/Sex_adult_girl"]
let golpear;
client.on('message_create', async (message) => {
    const chat = await message.getChat()
    let contact = await message.getContact();
    if (jsonread(contact.id.user)) {
        update_info_player(contact.id.user, "mensajes", getAllInfoPlayer(contact.id.user).mensajes + 1, true);
        if (getAllInfoPlayer(contact.id.user).mensajes == 10000) {
            update_info_player(contact.id.user, "nivel", getAllInfoPlayer(contact.id.user).nivel + 1, true);
            update_info_player(contact.id.user, "mensajes", 0, true);
            message.reply('Felicidades has subido de nivel');
        }
    }
    if (getAllInfoPlayer(contact.id.user).ganadas == 10 && getAllInfoPlayer(contact.id.user).nivel === 0) {
        update_info_player(contact.id.user, "nivel", getAllInfoPlayer(contact.id.user).nivel + 1, true);
        update_info_player(contact.id.user, "ganadas", 0, true);
        message.reply('Felicidades has subido de nivel');
    } else if (getAllInfoPlayer(contact.id.user).ganadas == 20 && getAllInfoPlayer(contact.id.user).nivel === 1) {
        update_info_player(contact.id.user, "nivel", getAllInfoPlayer(contact.id.user).nivel + 1, true);
        update_info_player(contact.id.user, "ganadas", 0,true);
        message.reply('Felicidades has subido de nivel');
    } else if (getAllInfoPlayer(contact.id.user).ganadas == 30 && getAllInfoPlayer(contact.id.user).nivel >= 2) {
        update_info_player(contact.id.user, "nivel", getAllInfoPlayer(contact.id.user).nivel + 1, true);
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


        if (message.body.toLocaleLowerCase() === 'activar bot' || message.body.toLocaleLowerCase() === 'ab') {
            if (participantes(message.author)) {
                activeBot(chat.id._serialized, true);
                message.reply('El bot ha sido activado');
            }
        }
        if (watchBot(chat.id._serialized) == false) {
            return;
        }
        if (message.body.toLocaleLowerCase() === 'desactivar bot' || message.body.toLocaleLowerCase() === 'db') {
            if (participantes(message.author)) {
                activeBot(chat.id._serialized, false);
                message.reply('El bot ha sido desactivado');
            }
        }
    }
    if (message.from === "120363123428242054@g.us") {

        if (message.body === 'hola') {
            message.reply('Bienvenid@ a Anime Fan Site');
        }
    }
    if (message.body.toLocaleLowerCase() === '!todos') {
        if (chat.isGroup) {
            if (participantes(message.author)) {
                const chat = await message.getChat();

                let text = "";
                let mentions = [];

                for (let participant of chat.participants) {
                    mentions.push(`${participant.id.user}@c.us`);
                    text += `@${participant.id.user} \n`;
                }
                await chat.sendMessage(text, { mentions });
            } else {
                message.reply('Solo los administradores pueden usar este comando');
            }
        } else {
            message.reply('Este comando solo funciona en grupos');
        }
    }
    if (botIsAdmin(chat.id._serialized, 1) === true) {
        let mmsg = message.body
        for (let i = 0; i < links_baneados.length; i++) {
            if (mmsg.includes(links_baneados[i])) {
                message.delete(true);
                message.reply('No puedes enviar ese tipo de links');
            }
        }
        if(mmsg.includes("https://chat.whatsapp.com/")){
            message.delete(true);
        }
    } 
    if (message.body.toLocaleLowerCase() === 'io') {
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
    if (message.body.toLocaleLowerCase().startsWith('casar ') || message.body.toLocaleLowerCase().startsWith('cr ')) {
        let parts = message.body.split(' ');
        let prometido = parts[1];
        prometido = prometido.replace('@', '');
        const regex = /^\d+$/;
        if (regex.test(prometido)) {
            try {
                if (chat.isGroup) {
                    if (getAllInfoPlayer(contact.id.user).casado === "nadie :(") {
                        jsonread(prometido);
                        if (getAllInfoPlayer(prometido).casado === "nadie :(") {
                            update_info_player(contact.id.user, "casado", prometido, true);
                            update_info_player(prometido, "casado", contact.id.user, true);
                            message.reply("Ahora estas casad@");
                        }

                    } else {
                        message.reply('Ya estabas casad@ infiel');
                    }
                }
            } catch (err) {
                message.reply('hubo un error y no te puedes casar');
            }
        } else {
            message.reply('menciona a alguien o Introduce un numero valido');
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
        let day = dayjs().tz("America/Santo_Domingo").format('D');
        if(update_dias(day, 2) === false){
            update_info_player(contact.id.user, "dinero", getAllInfoPlayer(contact.id.user).dinero + 10, true);
            update_info_player(getAllInfoPlayer(contact.id.user).casado, "dinero", getAllInfoPlayer(getAllInfoPlayer(contact.id.user).casado).dinero - 10, true);
            update_dias(day, 1);
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
    if(message.body.toLocaleLowerCase().startsWith('baile sexual')){
        console.log(contact.id.user)
        if(getAllInfoPlayer(contact.id.user).roles === "stripper"){
            let part = message.body.split(" ");
            part = part[2];
            console.log(part);
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
    if (message.body.toLocaleLowerCase() === 'sticker' || message.body.toLocaleLowerCase() === 'st') {
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
        } else {
            message.reply('No pusiste una foto o video, nisiquiera citaste uno');
        }
    }
    if (message.body.toLowerCase().startsWith("tv ")) {
        let parts = message.body.split(' ');
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
            "objetos":{
                "casa": "2,000,000",
                "carro": "500,000",
                "moto": "20,000",
                "avion": "10,000,000",
                "cuchillo": 10,
                "pistola": 100,
                "fusil": 500,
                "rifle": 1000
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
        mensaje1 += "\n\n*Objetos:*\n\n";
        for (let objeto in articulos.objetos) {
            mensaje1 += `${objeto}: ${articulos.objetos[objeto]} monedas\n`;
        }
        message.reply(mensaje1);
    }
    if (message.body.toLocaleLowerCase().startsWith('comprar ')) {
        let parts = message.body.split(' ');
        let articulo = parts[1];
        articulo = articulo.toLocaleLowerCase();
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
            "objetos":{
                "casa": 2000000,
                "carro": 500000,
                "moto": 20000,
                "avion": 10000000,
                "cuchillo": 10,
                "pistola": 100,
                "fusil": 500,
                "rifle": 1000
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
            }
        } else {
            message.reply('> No tienes suficiente dinero \n> O\n> Necesitas al menos el nivel 2');
        }
    }
    //-------------------------------------------------------------------------------------------------
    if(message.body.toLocaleLowerCase().startsWith('sex') || message.body.toLocaleLowerCase().startsWith('sexo')){
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
    if (message.body.toLocaleLowerCase() == 'foto de una sola vez' || message.body.toLocaleLowerCase() == 'sf') {
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
    if (message.body.toLocaleLowerCase() == 'b') {
        if (message.hasQuotedMsg) {
            const quotedMsg = await message.getQuotedMessage();
            quotedMsg.delete(true);
            message.reply('Solo puedo borrar mensajes enviados por mi');
            
        }
    }
    if (message.body.toLowerCase().startsWith("musica ") || message.body.toLowerCase().startsWith("m ") || message.body.toLowerCase().startsWith("música ")) {
            try {
                const parts = message.body.split(' ');
                const search = parts.slice(1).join(' ');
                let stream;
                await chat.sendSeen();
                await chat.sendStateTyping();
                youtube.search(search, { limit: 1 }).then(x => {
                try {
                    if (x.length === 0) {
                        message.reply('No puede encontrar esa cosa que escribiste, toma un curso de ortografía');
                        return;
                    } else {
                        if (!/^https?:\/\/(www\.)?youtube\.com\//.test(search)) {
                            stream = ytdl(x[0].url, { filter: 'audioonly' });
                        } else {
                            stream = ytdl(search, { filter: 'audioonly' });
                        }
                        ffmpeg()
                            .input(stream)
                            .audioBitrate(128)
                            .save('n.mp3')
                            .on('end', () => {
                                const file = fs.readFileSync('n.mp3');
                                const media = new MessageMedia('audio/mp3', file.toString('base64'), 'audio');
                                client.sendMessage(message.from, media, { quotedMessageId: message.id._serialized });
                            })
                            .on('error', console.error);
                    }
                } catch (error) {
                    console.error('Ocurrió un error:', error);
                    message.reply('No pude descargar la música');
                }
            }).catch(err => {
                console.error('Ocurrió un error en youtube.search:', err);
                message.reply('No pude buscar la música');
            });
        } catch (error) {
            console.error('Ocurrió un error:', error);
            message.reply('No pude descargar la música');
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
    if (message.body.toLocaleLowerCase() == '1') {
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
        if (option.juego == 1) {
            if (watchBan(chat.id._serialized, 'todos') == true) {
                if (watchBan(chat.id._serialized, 'menciones') == true) {
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
        if (option.juego == 1) {
            if (watchBan(chat.id._serialized, 'todos') == true) {
                if (watchBan(chat.id._serialized, 'admins') == true) {
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
    if (message.body.toLocaleLowerCase() === 'creador' || message.body.toLocaleLowerCase() === 'como se crea un bot') {
        await chat.sendSeen();
        await chat.sendStateTyping();
        message.reply(`                 
            *INFORMACIÓN*
        *SOBRE EL CREADOR*
            *DEL BOT 𖠌*

    ¡Hola! ◡̈
    Puedes comunicarte con mi creador desde este link:
    
    wa.me/18098972404
    
    𖤣.𖥧.𖡼.⚘𖤣.𖥧.𖡼.⚘𖤣.𖥧.𖡼.⚘𖤣.𖥧.𖡼.⚘𖤣.
    Aquí puedes Contactar con el diseñador del menu:

    wa.me/5144637126`
    
        );
    }
});

try {
    client.initialize();
} catch (err) {
    console.log(err);
}
