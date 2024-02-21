const qrcode = require('qrcode-terminal');
const fs = require('fs');
const googleTTS = require('google-tts-api');
const youtube = require('youtube-sr').default;
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

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
        perdidas: 0,
        entrada: 0,
        mensajes: 0
    }
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
 * actualiza la entrada del jugador
 * 
 * @param {string} player - id del jugador pasar como string el numero de telefono
 * @param {string} entrada  - la entrada que se le va a asignar al jugador si esta jugando o no
 */
function updateEntrada(player, entrada) {
    let jsonfile = fs.readFileSync('data.json', 'utf-8');
    let data = JSON.parse(jsonfile);
    for (let i = 0; i < data.players.length; i++) {
        if (data.players[i].id === player) {
            data.players[i].entrada = entrada;
            fs.writeFileSync('data.json', JSON.stringify(data, null, 4), 'utf-8');
            break;
        }
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
        bot_activado: true,
        juegos: [{ "todos": true, baneados: ["admins"] }]
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
function getAllInfoPlayer(player){
    let jsonfile = fs.readFileSync('data.json', 'utf-8');
    let data = JSON.parse(jsonfile);
    for (let i = 0; i < data.players.length; i++) {
        if (data.players[i].id === player) {
            return data.players[i];
        }
    }

}
function update_info_player(player, type, value){
    let jsonfile = fs.readFileSync('data.json', 'utf-8');
    let data = JSON.parse(jsonfile);
    for (let i = 0; i < data.players.length; i++) {
        if (data.players[i].id === player) {
            data.players[i][type] = value;
        }
    }
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
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
 * @param {string} player recibe el id del jugador(numero de telefono) en formato string 
 * @returns devuelve la entrada del jugador si esta jugando sino se encuentra devuelve null
 */
function getEntrada(player) {
    let jsonfile = fs.readFileSync('data.json', 'utf-8');
    let data = JSON.parse(jsonfile);
    for (let i = 0; i < data.players.length; i++) {
        if (data.players[i].id === player) {
            return data.players[i].entrada;
        }
    }
    return null;
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
    const { groupMetadata, participant, invite } = notification;
    console.log(`${participant.id.user} se ha unido al grupo ${groupMetadata.id._serialized}`);
    client.sendMessage(groupMetadata.id._serialized, `Bienvenido/a ${participant.pushname} al grupo ${groupMetadata.subject}!`);
});
const menu = "*Opciones*\n\n" + "📋  menu...\n" + "👨‍👨‍👧‍👦 — !todos (solo los admins lo pueden usar).\n" + "🧟 — recomienda un anime (rnu).\n" + "🎮 — jugar.\n" + "🃏 — sticker(st) (adjunta la imagen).\n" + "🔊 — crea un audio con el bot(tv)\n" + "📸 — foto o video de una sola vez(sf)\n" + "Borrar un mensaje enviado por el bot(br)\n" + "🧊 — Minecraft Server(MS)\n" + "📝 — ajustes(as).\n" + "👨🏻‍💻 — creador.\n\n" + "Estas son todas las opciones disponibles por el momento";
const option_game = "*Opciones*\n\n" + "1. Quitar la opción Juego\n" + "2. Quitar los Juegos con menciones\n" + "3. Todos pueden utilizar los juegos con menciones";
const menu_game = "estos son los juegos disponibles por el momento:\n\n" + "Piedra 🪨, papel 🧻 o tiejeras ✂️(ppt)\n" + "formar pareja (fp) 👩🏻‍❤️‍💋‍👨🏻"
const links_baneados = ["https://is.gd/LOVELY_WORLD", "https://is.gd/Sex_adult_girl", "https://is.gd/Sex_adult_girl"]
client.on('message', async (message) => {
    const chat = await message.getChat()
    contact = await message.getContact();
    if(jsonread(contact.id.user)){
        update_info_player(contact.id.user, "mensajes", getAllInfoPlayer(contact.id.user).mensajes + 1);
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
    /*     if(message.links.length > 0){
            if (participantes(client.info.wid._serialized)) {
                message.links.forEach((link) => {
                    console.log(link);
                    if (links_baneados.includes(link)) {
                        console.log('link baneado');
                        chat.removeParticipant(message.author);
                    }
                });
            }
        } */
    if(message.body.toLocaleLowerCase() === 'io'){
        try{
            console.log(contact.id.user);
            jsonread(contact.id.user);
            let info = getAllInfoPlayer(contact.id.user);
            let casadoContact = await client.getContactById(info.casado + '@c.us');
            const casado = info.casado ? `@${info.casado}` : 'nadie';
            client.sendMessage(message.from,`Casad@ con: ${casado}\nnivel ${info.nivel}\nganadas: ${info.ganadas}\nperdidas: ${info.perdidas}\ntotal de mensajes enviados: ${info.mensajes}`, { 
                mentions: [ casadoContact ],
                quotedMessageId: message.id._serialized 
            });
        }catch(err){
            message.reply('La funcion aun esta en desarrollo');
        }
    }
    if (message.body.toLocaleLowerCase() === 'menu' || message.body.toLocaleLowerCase() === 'menú') {
        let tempMenu = menu;
        await chat.sendSeen();
        await chat.sendStateTyping();
        if (chat.isGroup) {
            if (watchBan(chat.id._serialized, 'todos' === false)) {
                tempMenu = tempMenu.replace('🎮 — jugar.', '');
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
                updateEntrada(contact.id.user, 1);
                message.reply(ppt_menu);
            }
        } else {
            jsonread(contact.id.user);
            updateEntrada(contact.id.user, 1);
            message.reply(ppt_menu);
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
        } else {
            message.reply('Ganaste el bot escogio tijera');
        }
    }
    if (message.body.toLocaleLowerCase() === 'ppt papel') {
        await chat.sendSeen();
        await chat.sendStateTyping();
        if (getEntrada(contact.id.user) === 1) {
            const options = ['piedra', 'papel', 'tijera'];
            const randomIndex = Math.floor(Math.random() * options.length);
            if (options[randomIndex] === 'papel') {
                message.reply('Empate el bot escogio papel');
            } else if (options[randomIndex] === 'tijera') {
                message.reply('Perdiste el bot escogio tijera');
            } else {
                message.reply('Ganaste el bot escogio piedra');
            }
        }
        updateEntrada(contact.id.user, 0);
    }
    if (message.body.toLocaleLowerCase() === 'ppt tijera') {
        await chat.sendSeen();
        await chat.sendStateTyping();
        if (getEntrada(contact.id.user) === 1) {
            const options = ['piedra', 'papel', 'tijera'];
            const randomIndex = Math.floor(Math.random() * options.length);
            if (options[randomIndex] === 'tijera') {
                message.reply('Empate el bot escogio tijera');
            } else if (options[randomIndex] === 'piedra') {
                message.reply('Perdiste el bot escogio piedra');
            } else {
                message.reply('Ganaste el bot escogio papel');
            }
        }
        updateEntrada(contact.id.user, 0);
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
                            chat.sendMessage(media, { sendMediaAsSticker: true, stickerAuthor: 'Nasla bot', stickerName: '' });
                            break;
                        case 'video':
                            media = new MessageMedia('video/mp4', d.data, 'sticker');
                            chat.sendMessage(media, { sendMediaAsSticker: true, stickerAuthor: 'Nasla bot', stickerName: '' });
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
                        chat.sendMessage(media, { sendMediaAsSticker: true, stickerAuthor: 'Nasla bot', stickerName: '' });
                        break;
                    case 'video':
                        media = new MessageMedia('video/mp4', d.data, 'sticker');
                        chat.sendMessage(media, { sendMediaAsSticker: true, stickerAuthor: 'Nasla bot', stickerName: '' });
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
            if(message.hasQuotedMsg){
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
                if (watchBan(chat.id._serialized, 'admins') == false && participantes(message.author)) {
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
    if (message.body.toLowerCase().startsWith("musica ") || message.body.toLowerCase().startsWith("m ") || message.body.toLowerCase().startsWith("música ")) {
        try {
            const parts = message.body.split(' ');
            const search = parts.slice(1).join(' ');
            let stream;
            await chat.sendSeen();
            await chat.sendStateTyping();
            youtube.search(search, { limit: 1 }).then(x => {
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
            });
        } catch (err) {
            message.reply('No pude descargar la musica');
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
    
    𖤣.𖥧.𖡼.⚘𖤣.𖥧.𖡼.⚘𖤣.𖥧.𖡼.⚘𖤣.𖥧.𖡼.⚘𖤣.`
        );
    }
});


client.initialize();
