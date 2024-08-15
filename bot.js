const qrcode = require('qrcode-terminal');
const fs = require('fs');
const https = require('https');
const { TwitterDL } = require("twitter-downloader");
const fetch = require("node-fetch");
const YTDownloadMusic = require('ytdp')
const instagramDl = require("@sasmeee/igdl");
const tk = require('tiktok-downloaders');
const googleTTS = require('google-tts-api');
const youtube = require('youtube-sr').default;
const ytdl = require('@distube/ytdl-core');
const { obtenerPais } = require('./utils/prefix.js');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const { Client, LocalAuth, MessageMedia, RemoteAuth } = require('whatsapp-web.js');
const { constrainedMemory } = require('process');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const Jimp = require('jimp');
const quest = require('preguntas');
const { jsonread, update_info_player, getAllInfoPlayer, update_dias, topPlayersWithMostMoney, moneyTopPlayers, topPlayersWithMostLevel, levelTopPlayers, topUsersMessages, messageUsers} = require('./utils/playerUtils.js');
const { addgroup, bot_off_on, watchBot, watchBan, groupActiveQuestions, Bangame, QuitBan, asignarBot, removerAsignacionBot, esBotAsignado, verAsignadoBot} = require('./utils/groupTools.js');
const { addAnimal, modifyAnimalsParameters, getAnimals } = require('./utils/animals.js');
const { insertarBot, encontrarBot, cantidadBots, eliminarBot, searchPathbots, asignarCargoBot, vercargoBot } = require('./utils/bots.js');
const { cerrarBase } = require('./utils/base.js');
const { path } = require('@ffmpeg-installer/ffmpeg');

dayjs.extend(utc);
dayjs.extend(timezone); 

let numCodesSent = 0;
ffmpeg.setFfmpegPath(ffmpegPath);


// Alastor Bot
// Version 4.0.1


class AlastorBot {
    /**
     * 
     * @param {string} browserPath 
     */
    constructor(browserPath) {
        this.browserPath = browserPath;
    }
    /**
     * Activa el bot de Alastor
     */
    async activate() {
        const baseDir = './session';
        
        const paths = await searchPathbots();
        await this.activateClientBot(baseDir, true, null, null);
        if(paths.length > 0){
            paths.forEach(async (path) => {
                if(!(await vercargoBot(path) === 'principal')){
                    await this.activateClientBot(baseDir, true, path, null);
                }
            })
        }
    }
    async closeBot(){
        await client.destroy();
        await cerrarBase();
        process.exit();
    }
    async activateClientBot(data_session, qqr, num, message) {
        return new Promise((resolve, reject) => {
            const client = new Client({
                authStrategy: new LocalAuth({
                    clientId: num,
                    dataPath: data_session
                }),
                puppeteer: {
                    headless: true,
                    args: ['-no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
                    executablePath: this.browserPath
                },
                ffmpegPath: ffmpegPath
            });
            client.on('disconnected', async (reason) => {
                console.error('Cliente desconectado:');
                const paths = await searchPathbots();
                if(paths.length > 0){
                    await eliminarBot(num);
                }
                client.destroy();
                reject();
            });
            client.on('auth_failure', async () => {
                console.error('Error de autenticación');
                await eliminarBot(num);
            });
            //client.on('authenticated', async (session) => {})
            client.on('qr', async (qr) => {
                if (qqr) {
                    if(num !== null){
                        await eliminarBot(num);
                        if(fs.existsSync(`${data_session}/session-${num}`, { recursive: true })){
                            fs.rmSync(`${data_session}/session-${num}`, { recursive: true });
                        }
                        client.destroy()
                    }else{
                        qrcode.generate(qr, { small: true });
                    } 
                } else {
                    if (numCodesSent < 4) {
                        const pairingCode = await client.requestPairingCode(num);
                        console.log(pairingCode);
                        message.reply(`${pairingCode}`);
                        numCodesSent++; 
                    } else {
                        numCodesSent = 0;
                        message.reply('Límite de códigos de emparejamiento alcanzado.');
                        client.destroy();
                        reject();
                    }
                }
            });

            client.on('loading_screen', (percent, message) => {
                console.log('Pantalla de Carga', percent, message);
            });
            let directemp;
            client.on('ready', async () => {
                console.log('Todo esta listo!');
                if(await encontrarBot(client.info.wid.user)){
                    await insertarBot(client.info.wid.user, data_session);
                }
                if(num){
                    directemp = `${data_session}/session-${client.info.wid.user}/Default/temp`;
                    if(!fs.existsSync(directemp)){
                        fs.mkdirSync(directemp, { recursive: true });
                    }
                    await asignarCargoBot(client.info.wid.user, 'secundario');
                }else{
                    directemp = `${data_session}/session/Default/temp`;
                    if(!fs.existsSync(directemp)){
                        fs.mkdirSync(directemp, { recursive: true });
                    }
                    await asignarCargoBot(num, 'principal');           
                }
                client.on('message_create', mensaje)
                numCodesSent = 0;
                resolve();
            });
            
            client.on('group_join', (notification) => {
                notification.getChat().then(async (chat) => {
                    addgroup(chat.id._serialized);
                    if(await esBotAsignado(chat.id._serialized, client.info.wid.user ) === 'no asignado'){
                        await asignarBot(client.info.wid.user, chat.id._serialized);
                    }else if(await esBotAsignado(chat.id._serialized, client.info.wid.user)){
                        return;
                    } 
                    if(await watchBot(chat.id._serialized)){
                        const regex = /(?:https?:\/\/)?chat\.whatsapp\.com\/\S*/g;     
                        const descripcion = chat.description || '';
                        notification.reply(`Bienvenido a ${chat.name}, @${notification.recipientIds[0].replace('@c.us', '')}\n\n${descripcion.replace(regex, '')}`, {
                            mentions: [notification.recipientIds[0]]
                        });
                    }
                })
            });

            function RandomTwoIndex(array) {
                let randomIndex = Math.floor(Math.random() * array.length);
                let randomIndex2 = Math.floor(Math.random() * array.length);
                while (randomIndex === randomIndex2) {
                    randomIndex2 = Math.floor(Math.random() * array.length);
                }
                return [randomIndex, randomIndex2];
            }

            let option = {
                juego: 0,
                ajustes: 0
            };


            let menu = `
            ~*MENU*~

            📋🧾📄| Menu

            👨‍👩‍👧‍👦🏡💞 | !t (Solo Admins).

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

            🤖 👹 | !otro (Vuelvete un bot de Alastor solo funciona en priv)

            🎁 🎉— donar

            👨🏻‍💻👀 🛐— creador.

            ¡Por ahora estas son todas las opciones que puedes disfrutar! Sigue apoyando.
            `.replace(/^[ \t]+/gm, '');

            let menu_juego;
            const option_game = "*Opciones*\n\n" + "1. Quitar la opción Juego\n" + "2. Quitar los Juegos con menciones\n" + "3. Todos pueden utilizar los juegos con menciones";
            const menu_game = "estos son los juegos disponibles por el momento:\n\n" + "> Piedra 🪨, papel 🧻 o tiejeras ✂️(ppt)\n\n> formar pareja (fp) 👩🏻‍❤️‍💋‍👨🏻\n\n> Dado 🎲 (pon un numero del 1 al 6)\n\n> BlackJack(bj)\n\n> !q crea una pregunta" + "\n\n> cz (cara o cruz)" + "\n\n*Los Roles tienen sus juegos propios*"
            const links_baneados = ["is.gd", "chat.whatsapp.com", "5ne.co", "t.me", "in.ru", "ln.ru", "https://xxnx", "https://pornhub", "https://xvideos", "https://xnxx", "xnxx", "xhamster", "redtube", "youporn", "te odio baba", "odio baba", "odio a baba"]
            let golpear;
            let counterListRequestMusic = 1;
            let counterListRequestVideo = 0;
            let groupTimes = {};
            let contadordia = {};
            let cartas_jugador = {};
            let valorAS;
            let dealer = {};
            let dinero_bj = {};
            const Alastor_Number = ["32466905630", "18098972404", "573170633386", "22941159770", "595973819264"]
            const insultos = ['bot de mierda', 'mierda de bot', 'alastor de mierda']
            let requestM = []

            const mensaje =  async (message) => {
                
                const chat = await message.getChat();
                let contact = await message.getContact();
                let numero_cliente = client.info.wid.user
                if(message.body === ''){
                        return;
                }
                
                const group = await message.getChat();

                await jsonread(contact.id.user);
                const searchParticipante = (userId) => {
                    const groupParticipants = chat.participants;
                    const participant = groupParticipants.find(part => part.id.user === userId);
                    if (!participant) {
                        return false;
                    }
                    return true;
                }
                if(chat.isGroup){
                    await addgroup(chat.id._serialized);
                    if(await esBotAsignado(chat.id._serialized, numero_cliente) === 'no asignado' || !searchParticipante(await verAsignadoBot(chat.id._serialized))){
                        await asignarBot(numero_cliente, chat.id._serialized);
                    }else if(await esBotAsignado(chat.id._serialized, numero_cliente)){
                        return;
                    } 
                }
                const viewPlayer = await getAllInfoPlayer(contact.id.user);

                function quitar_acentos(palabra){
                    const palabras_raras = ["á", "é", "í", "ó", "ú", "ñ", "ü"];
                    const letras_normales = ["a", "e", "i", "o", "u", "n", "u"];
                    for (let i = 0; i < palabras_raras.length; i++) {
                        palabra = palabra.replace(new RegExp(palabras_raras[i], 'g'), letras_normales[i]);
                    }
                    return palabra;
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
                if(insultos.includes(message.body.toLocaleLowerCase())){
                    message.reply('Tu madre me dijo otra cosa');
                }
                if(encontrarBot(contact.id.user)){
                    await update_info_player(contact.id.user, "Mensajes", viewPlayer.Mensajes + 1, true);
                }
                const currentLevel = viewPlayer.Nivel;
                let winsNeeded = (currentLevel + 1) * 10;

                if(viewPlayer.Puntos >= winsNeeded){
                    update_info_player(contact.id.user, "Nivel", currentLevel + 1, true);
                    update_info_player(contact.id.user, "Puntos", 0, true);
                    message.reply('Felicidades has subido de nivel');
                }
                /**
                * Verifica si el usuario es admin o no, no necesita parametros
                * @param {string} author  id del usuario que envio el mensaje
                * @returns {boolean}  si el usuario es admin devuelve true si no false
                */
                function participantes(userId) {
                    const groupParticipants = chat.participants;
                    const participant = groupParticipants.find(part => part.id.user === userId);
                    if (!participant) {
                        return false;
                    }
                    return participant.isAdmin || Alastor_Number.includes(userId);
                }
                if (chat.isGroup && message.body.toLocaleLowerCase() === 'ab' && participantes(contact.id.user)) {
                    bot_off_on(chat.id._serialized, true);
                    const watch = await watchBot(chat.id._serialized);
                    message.reply(`El bot ha sido ${watch ? 'desactivado' : 'activado'}`);
                }
                if (chat.isGroup && !(await watchBot(chat.id._serialized))) {
                    return;
                }
                if(chat.isGroup && participantes(numero_cliente)){   
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
                //agregar otro cliente
                if (message.body.toLocaleLowerCase() === '!otro' && await encontrarBot(contact.id.user) && !chat.isGroup) {
                    try {
                        if(contadordia[contact.id.user + '!otro']){
                            message.reply(`Debes esperar ${Tiempo_restante(contact.id.user + '!otro')} segundos para volver a volverte bot`);
                            return;
                            
                        }else{
                            message.reply('Activando nuevo bot enviando codigo...');
                            const uniqueDir = './session'
                            await this.activateClientBot(uniqueDir, false, contact.id.user, message);
                            message.reply('Usted se convirtio en un bot');
                        }
                    } catch(err) {
                        message.reply('Lo siento no pude volverte bot');
                    }
                }
                // Añadir un miembro al grupo con solo su número
                if (message.body.toLocaleLowerCase().startsWith("aña")) {
                    // Verifico si el bot es admin y si el que añade es admin 
                    if ((chat.isGroup && participantes(contact.id.user) || Alastor_Number.includes(contact.id.user)) && participantes(numero_cliente)) {
                        let parte = message.body.split(" ");
                        if(parts.length > 2){
                            return
                        }
                        parte = parte[1];
                        if (parte && /^\d+$/.test(parte)) { // Verifica que parte sea un número
                            parte = parte + '@c.us';
                            chat.addParticipants([parte]).catch(err => {
                                console.error('Error al añadir participante:', err);
                                message.reply('Hubo un error al intentar añadir el participante. Asegúrate de que el número es correcto y está registrado en WhatsApp.');
                            });
                        } else {
                            message.reply('Por favor, proporciona un número de teléfono válido.');
                        }
                    }
                }
                //remover un miembro del grupo
                if(message.body.toLocaleLowerCase().startsWith("!re") || message.body.toLocaleLowerCase().startsWith("!re")){
                    if(message.hasQuotedMsg){
                        const quotedMsg = await message.getQuotedMessage();
                        let contacto = await quotedMsg.getContact();
                        if(chat.isGroup && participantes(numero_cliente) && participantes(contact.id.user)){
                            //verifico si el bot es admin y si el que añade es admin   
                            if(Alastor_Number.includes(contacto.id.user)){
                                return
                            }
                            chat.removeParticipants([contacto.id._serialized]);
                        }
                    }else{
                        if(chat.isGroup && participantes(numero_cliente) && participantes(contact.id.user)){
                            //verifico si el bot es admin y si el que añade es admin   
                            let parte = message.body.split(" ");
                            if(parte.length > 2){
                                return
                            }
                            parte = parte[1];
                            parte = parte.replace('@', '');
                            if(Alastor_Number.includes(parte)){
                                return
                            }
                            parte = parte + '@c.us';
                            chat.removeParticipants([parte]);
                        }
                    }
                }
                //remover a todos del grupo solo si es Alastor quien envia en comando
                if(message.body.toLocaleLowerCase() === '!re t'){
                    if(chat.isGroup){
                        if(Alastor_Number.includes(contact.id.user) && participantes(numero_cliente)){
                            chat.getParticipants().then((participants) => {
                                let participantsIds = participants.map((participant) => {
                                    return participant.id._serialized;
                                });
                                chat.removeParticipants(participantsIds);
                            });
                        }
                    }
                }
                if (message.body.toLocaleLowerCase() === 'io' || message.body.toLocaleLowerCase() === 'ls') {
                    let info;
                    try {
                        if (chat.isGroup) {
                            if (message.hasQuotedMsg) { 
                                const quotedMsg = await message.getQuotedMessage();
                                let contact = await quotedMsg.getContact();
                                info = await getAllInfoPlayer(contact.id.user);
                                const casado = info.Casado !== 'nadie :(' ? `@${info.Casado}` : info.Casado;
                                if (info.Casado === 'nadie :(') {
                                    chat.sendMessage(`*Casad@ con:* ${casado}\n*nivel* ${info.Nivel}\n*Puntuacion:* ${info.Puntos}\n*Rool:* ${info.Rool}\n*Pais:* ${obtenerPais(contact.id.user)}\n*Dinero:* ${info.Dinero}\n*Dinero en el banco:* ${info.Banco}\n*total de mensajes enviados:* ${info.Mensajes}\n*Con AlastorBot desde:*\n${info.create_at} `, {
                                        quotedMessageId: quotedMsg.id._serialized
                                    });
                                } else {
                                    const contacto_casado = await client.getNumberId(info.Casado);
                                    chat.sendMessage(`*Casad@ con:* ${casado}\n*nivel* ${info.Nivel}\n*Puntuacion:* ${info.Puntos}\n*Rool:* ${info.Rool}\n*Pais:* ${obtenerPais(contact.id.user)}\n*Dinero:* ${info.Dinero}\n*Dinero en el banco:* ${info.Banco}\n*Total de mensajes enviados:* ${info.Mensajes}\n*Con AlastorBot desde:*\n${info.create_at} `, {
                                        mentions: contacto_casado._serialized,
                                        quotedMessageId: quotedMsg.id._serialized
                                    });
                                }
                            }else {
                                info = await getAllInfoPlayer(contact.id.user);
                                const casado = info.Casado !== 'nadie :(' ? `@${info.Casado}` : info.Casado;
                                if (info.Casado === 'nadie :(') {
                                    chat.sendMessage(`*Casad@ con:* ${casado}\n*nivel* ${info.Nivel}\n*Puntuacion:* ${info.Puntos}\n*Rool:* ${info.Rool}\n*Pais:* ${obtenerPais(contact.id.user)}\n*Dinero:* ${info.Dinero}\n*Dinero en el banco:* ${info.Banco}\n*Total de mensajes enviados:* ${info.Mensajes}\n*Con AlastorBot desde:*\n${info.create_at}`, {
                                        quotedMessageId: message.id._serialized
                                    });
                                } else {
                                    const contacto_casado = await client.getNumberId(info.Casado);
                                    chat.sendMessage(`*Casad@ con:* ${casado}\n*nivel* ${info.Nivel}\n*Puntuacion:* ${info.Puntos}\n*Rool:* ${info.Rool}\n*Pais:* ${obtenerPais(contact.id.user)}\n*Dinero:* ${info.Dinero}\n*Dinero en el banco:* ${info.Banco}\n*Total de mensajes enviados:* ${info.Mensajes}\n*Con AlastorBot desde:*\n${info.create_at}`, {
                                        mentions: contacto_casado._serialized,
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
                    if (viewPlayer.Casado === "nadie :(") {
                        message.reply('No estas casad@');
                    } else {
                        if (viewPlayer.Puntos > 0 && viewPlayer.Mensajes >= 20) {
                            let casadoPlayer = await getAllInfoPlayer(viewPlayer.Casado);
                            update_info_player(viewPlayer.Casado, "Puntos", casadoPlayer.Puntos + 1, true);
                            update_info_player(viewPlayer.Casado, "Casado", "nadie :(", true);
                            update_info_player(contact.id.user, "Casado", "nadie :(", true);
                            update_info_player(contact.id.user, "Mensajes", viewPlayer.Mensajes - 20, true);
                            update_info_player(contact.id.user, "Puntos", viewPlayer.Puntos - 1, true);
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
                                if (viewPlayer.Casado === "nadie :(") {
                                    update_info_player(contact.id.user, "Casado", prometido, true);
                                    update_info_player(prometido, "Casado", contact.id.user, true);
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
                        if(viewPlayer.Casado === "nadie :("){
                            client.getContactById(prometido).then((c) => {
                                chat.sendMessage(`*¿hey @${prometido.replace('@c.us', '')} quieres casarte con ${contact.pushname}?*\n\n> Si tu respuesta es sí responde a este mensaje con un sí`, { mentions: prometido })
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
                        if(quotedMsg.fromMe && contacto.id.user === numero_cliente){
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
                        if (await watchBan(chat.id._serialized, 'todo') === false) {
                            tempMenu = tempMenu.replace('🎮 — jugar.\n', '');
                            message.reply(tempMenu);
                        } else {
                            message.reply(tempMenu);
                        }
                    } else {
                        tempMenu = tempMenu.replace('📝 — ajustes(as).\n', '');
                        tempMenu = tempMenu.replace('👨‍👩‍👧‍👦🏡💞 | !t (Only Admins).', '');
                        message.reply(tempMenu);
                    }
                }
                if (message.body.toLocaleLowerCase() === 'recomienda un anime' || message.body.toLocaleLowerCase() === 'rnu') {
                    file = fs.readFileSync('data.json', 'utf-8')
                    data = JSON.parse(file)
                    const randomIndex = Math.floor(Math.random() * data.animes.names.length);
                    message.reply(data.animes.names[randomIndex]);
                }
                if (message.body.toLocaleLowerCase() === 'ms') {
                    await chat.sendSeen();
                    await chat.sendStateTyping();
                    message.reply('esta opcion esta desactida por el momento');
                }
                if (message.body.toLocaleLowerCase().startsWith('dado ')) {
                    let parts = message.body.split(' ');
                    let num = parts[1];
                    const parsedNum = parseInt(num);

                    // verifico si hay mas texto despues del numero
                    if(parts.length > 2){
                        return
                    }
                    // condiciono que el numero este entre 1 y 6 y que sea un numero
                    else if(!isNaN(parsedNum) && parsedNum <= 6 && parsedNum > 0) {
                        const numeroObjetivo = Math.floor(Math.random() * 6) + 1;
                        const eleccionMaquina = (numeroObjetivo) => {
                            if(numeroObjetivo + 1 > 6){
                                return numeroObjetivo - 1;
                            }else{
                                return numeroObjetivo + 1;
                            }
                        }
                        message.reply(`yo escojo el numero ${eleccionMaquina(numeroObjetivo)}`);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        //verifico si la maquina o el jugador este mas cerca del numero objetivo
                        const diferenciaJugador = Math.abs(numeroObjetivo - parsedNum);
                        const diferenciaMaquina = Math.abs(numeroObjetivo - eleccionMaquina(numeroObjetivo));
                
                        let ganador;
                        let dado;
                
                        if (diferenciaJugador < diferenciaMaquina) {
                            ganador = 'ganó el Jugador';
                            update_info_player(contact.id.user, "Puntos", viewPlayer.Puntos + 1, true);
                        } else if (diferenciaMaquina < diferenciaJugador) {
                            ganador = 'ganó la Máquina';
                            update_info_player(contact.id.user, "Puntos", viewPlayer.Puntos - 1, true);
                        } else {
                            ganador = 'quedó Empate';
                        }
                
                        switch (numeroObjetivo) {
                            case 1:
                                dado = "         ⚀\n";
                                break;
                            case 2:
                                dado = "         ⚁\n";
                                break;
                            case 3:
                                dado = "         ⚂\n";
                                break;
                            case 4:
                                dado = "         ⚃\n";
                                break;
                            case 5:
                                dado = "         ⚄\n";
                                break;
                            case 6:
                                dado = "         ⚅\n";
                                break;
                            default:
                                message.reply('Introduce un número del 1 al 6');
                                return;
                        }
                        message.reply(`${dado} El resultado es: ${ganador}`);
                        ContadorDeUnDia(contact.id.user + 'dado');
                    }
                }
                if(message.body.toLocaleLowerCase().startsWith('pp ')){
                    //pp es pelea de pollos por apuestas el jugador introduce una cantidad de dinero a apostar y el bot elige un numero de probabilidad de ganar basandose en las estadisticas del animal
                    let parts = message.body.split(' ');
                    let cantidad = parts[1];
                    let tiene_pollo = getAnimals(contact.id.user)
                    tiene_pollo.forEach(element => {
                        tiene_pollo = element.pollo !== undefined
                    });
                    if (cantidad === "all" && isNaN(cantidad)) {
                        cantidad = viewPlayer.Dinero;
                    }
                    if (isNaN(cantidad)) {
                        message.reply('Introduce una cantidad valida');
                        return;
                    }
                    if (viewPlayer.Dinero >= cantidad && viewPlayer.Dinero > 0 && tiene_pollo) {
                        
                    }        
                }
                if (message.body.toLocaleLowerCase() === 'ppt') {
                    await chat.sendSeen();
                    await chat.sendStateTyping();
                    let ppt_menu =
                        "Piedra 🪨, papel 🧻 o tiejeras ✂️\n\n" +
                        "Usa los siguientes comandos para jugar:\n\n" +
                        "ppt piedra\n" +
                        "ppt papel\n" +
                        "ppt tijera\n";
                    if (chat.isGroup) {
                        if (addgroup(chat.id._serialized) && await watchBan(chat.id._serialized, 'ppt') && await watchBan(chat.id._serialized, 'todos')) {
                            ppt_menu = await watchBan(chat.id._serialized, 'ppt') ? ppt_menu : ppt_menu = 'Lo siento Banearon este juego del grupo';
                            message.reply(ppt_menu);
                        }
                    } else {
                        message.reply(ppt_menu);
                    }
                }
                // Skills de Roles
                if (message.body.toLocaleLowerCase().startsWith("robar ") && message.hasQuotedMsg && viewPlayer.Rool === "ladron"){
                    let futuro = ["lograste robar", "te atraparon"];
                    let randomIndex = Math.floor(Math.random() * futuro.length);
                    const quotedMsg = await message.getQuotedMessage();
                    let contacto = await quotedMsg.getContact();
                    let infoContacto = await getAllInfoPlayer(contacto.id.user);

                    if (futuro[randomIndex] === "lograste robar") {
                        if (infoContacto.dinero > 0) {
                            update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero + infoContacto.dinero, true);
                            update_info_player(contacto.id.user, "Dinero", 0, true); // El contacto se queda sin dinero
                            message.reply(futuro[randomIndex]);
                        } else {
                            message.reply("No hay nada que robar");
                        }
                    }else if (futuro[randomIndex] === "te atraparon") {
                        update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero - 1, true);
                        update_info_player(contact.id.user, "Puntos", viewPlayer.Puntos - 1, true);
                        
                        message.reply(futuro[randomIndex]);
                    }
                }
                if(viewPlayer.Rool === "ama"){
                    let day = parseInt(dayjs().tz("America/Santo_Domingo").format('D'))
                    if(update_dias(contact.id.user,day, 2) === false){
                        update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero + 10, true);
                        let casado = await getAllInfoPlayer(viewPlayer.Casado)
                        update_info_player(viewPlayer.Casado, "Dinero", casado.Dinero - 10, true);
                        update_dias(contact.id.user,day, 1);
                        message.reply("Has recibido 10 monedas por ser ama de casa");
                    }
                }
                if(message.body.toLocaleLowerCase() === 'arrestar'){
                    console.log(golpear);
                    if(viewPlayer.Rool === "policia" && golpear === true){
                        console.log("es policia");
                        if(message.hasQuotedMsg){
                            console.log("tiene mensaje citado");
                            const quotedMsg = await message.getQuotedMessage();
                            let contacto = await quotedMsg.getContact();
                            let contacto_info = await getAllInfoPlayer(contacto.id.user);
                            if(contacto_info.Rool === "ladron"){
                                update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero + 10, true);
                                if(contacto_info.Dinero > 0){
                                    message.reply("este ladron no tenia dinero deberias golpearlo con un palo");
                                }
                                update_info_player(contacto.id.user, "Rool", "vagabundo", true);
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
                            const persona_golpeada = await getAllInfoPlayer(parte);
                            if(persona_golpeada.Rool === "policia"){
                                message.reply("No puedes golpear a un policia");
                            }else if(persona_golpeada.Rool === "ladron"){
                                update_info_player(parte, "Dinero", persona_golpeada.Dinero - 10, true);
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
            /*  if(message.body.toLocaleLowerCase().startsWith('escribir')){
                    if(viewPlayer.Rool === "escritor"){
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
                } */
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
                        if(viewPlayer.Dinero >= cantidad){
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
                                update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero + cantidad, true);
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
                            for(let carta of dealer[jugador]){
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
                                    valorAS = 11;
                                }else{
                                    suma += 1;
                                    valorAS = 1;
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
                            for(let carta of cartas_jugador[jugador]){
                                if(cartas.includes(carta)){
                                    suma += carta;
                                }else if(cartas_especiales.includes(carta)){
                                    suma += 10;
                                }else if(carta === 'A'){
                                    as += 1;
                                }
                            }
                            for(let i = 0; i < as; i++){
                                suma += valorAS
                            }
                            return suma;
                        }
                        const ganador = (jugador) => {
                            const suma_jugador = sumar_cartas_jugador(jugador);
                            const suma_dealer = sumar_cartas_dealer(jugador);
                            if(suma_jugador > 21 && suma_dealer > 21){
                                return 'empate';
                            }else if(suma_jugador > 21 || suma_jugador < suma_dealer){
                                return 'dealer';
                            }else if(suma_dealer > 21 || suma_jugador > suma_dealer){
                                return 'jugador';
                            }
                            return 'empate';
                        }
                        if(opcion[1] === 'apostar'){
                            if(!cartas_jugador[contact.id.user]){
                                let cantidad = opcion[2];
                                cantidad = parseInt(cantidad);
                                if(cantidad > 0){
                                    if(viewPlayer.Dinero >= cantidad){
                                        dinero_bj[contact.id.user] = cantidad;
                                        await update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero - cantidad, true);
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
                                    await update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero + dinero_bj[contact.id.user] * 2, true);
                                    message.reply('Has ganado' + " las cartas del deler son: " + dealer[contact.id.user]);
                                }else if(ganador_juego === 'dealer'){
                                    message.reply('Has perdido' + " las cartas del deler son: " + dealer[contact.id.user]);
                                }else{
                                    await update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero + dinero_bj[contact.id.user]); 
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
                        update_info_player(contact.id.user, "Puntos", viewPlayer.Puntos - 1, true);
                    } else {
                        message.reply('Ganaste el bot escogio tijera');
                        update_info_player(contact.id.user, "Puntos", viewPlayer.Puntos + 1, true);
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
                        update_info_player(contact.id.user, "Puntos", viewPlayer.Puntos - 1, true);
                    } else {
                        message.reply('Ganaste el bot escogio piedra');
                        update_info_player(contact.id.user, "Puntos", viewPlayer.Puntos + 1, true);
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
                        update_info_player(contact.id.user, "Puntos", viewPlayer.Puntos - 1, true);
                    } else {
                        update_info_player(contact.id.user, "Puntos", viewPlayer.Puntos + 1, true);
                        message.reply('Ganaste el bot escogio papel');
                    }
                }
                if(message.body.toLocaleLowerCase() === 'top ricos'){
                    if(chat.isGroup){
                        const los_ricos = await topPlayersWithMostMoney();
                        const dinero_ricos = await moneyTopPlayers();
                        let menciones = []
                        
                        let messageToSend = "*Los Ricos*\n\n";

                        for(let mention of los_ricos){
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
                        const los_niveles = await topPlayersWithMostLevel();
                        const niveles = await levelTopPlayers();
                        let menciones = []
                        let messageToSend = "*Los Mejores*\n\n";

                        for(let mention of los_niveles){
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
                        const personas = await topUsersMessages();
                        const mensajes = await messageUsers();
                        let menciones = []
                        let messageToSend = "*Los mas habladores*\n\n";
                        for(let mention of personas){
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
                if (message.body.toLocaleLowerCase() === 'jugar' && await watchBan(chat.id._serialized, 'todos')) {
                    let tempmenu_game = menu_game;
                    await chat.sendSeen();
                    await chat.sendStateTyping();
                    if (chat.isGroup) {
                        if (!(await watchBan(chat.id._serialized, 'menciones'))) {
                            tempmenu_game = tempmenu_game.replace('formar pareja (fp) 👩🏻‍❤️‍💋‍👨🏻', '');
                            message.reply(tempmenu_game);
                        } else {
                            message.reply(tempmenu_game);
                        }
                    } else {
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
                if(message.body.toLocaleLowerCase() === '!w'){
                    if(contadordia[contact.id.user]){
                        message.reply(`Ya trabajaste intentalo en ${Tiempo_restante(contact.id.user)} segundos`);
                        return;
                    }else if(chat.isGroup){
                        message.reply('Uff trabajaste duro, alguien te pagó 1 moneda');
                        update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero + 1, true);
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
                    const valid_language_codes = ['in', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'nl', 'pl', 'pt', 'ru', 'zh', 'pt'];
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

                    groupTimes[id_group] = setTimeout(async() => {
                        await groupActiveQuestions(2, id_group, false);
                        chat.sendMessage('La pregunta ha expirado');

                        delete groupTimes[id_group];
                    }, 10000);
                }
                if(message.body.toLocaleLowerCase() === '!q'){
                    if(chat.isGroup){
                        if(!(await groupActiveQuestions(1 ,chat.id._serialized)) && await watchBan(chat.id._serialized, 'todos')){
                            let indexp = quest.newIndexP();
                            await groupActiveQuestions(8, chat.id._serialized, quest.readTitle());
                            await groupActiveQuestions(6, chat.id._serialized, indexp);
                            await groupActiveQuestions(2, chat.id._serialized, true);
                            await groupActiveQuestions(3, chat.id._serialized ,quest.correctAnswerIndex());
                            message.reply(quest.readTitle() + "\n\n" + quest.readResponse());
                            TempQuest(chat.id._serialized);
                        }else{
                            message.reply('Ya hay una pregunta activa');
                        }
                    }else{
                        message.reply('Este juego solo funciona en grupos');
                    }
                }
                const fp = async () => {
                    
                }
                if (message.body.toLocaleLowerCase() === 'fp') {
                    if (chat.isGroup && await watchBan(chat.id._serialized, 'fp') && await watchBan(chat.id._serialized, 'todos') && await watchBan(chat.id._serialized, 'menciones')){
                        if (!participantes(contact.id.user) && !(await watchBan(chat.id._serialized, 'admins'))) {
                            message.reply('*No puedes participar en este juego solo los administradores pueden*');
                        }else{
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
                }
                // Economia ----------------------------------------------------
                if (message.body.toLocaleLowerCase().startsWith('banco ')) {
                    let parts = message.body.split(' ');
                    let opcion = parts[1];
                    
                    if (opcion === 'depositar' || opcion === 'dp') {
                        let cantidad = parts[2];
                        if (cantidad > 0 && cantidad <= viewPlayer.Dinero) {
                            update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero - parseInt(cantidad), true);
                            update_info_player(contact.id.user, "Banco", viewPlayer.Banco + parseInt(cantidad), true);
                            message.reply(`Has depositado ${cantidad} a tu cuenta bancaria`);
                        } else {
                            message.reply('No tienes suficiente dinero');
                        }
                    } else if (opcion === 'retirar' || opcion === 'rt') {
                        let cantidad = parts[2];
                        if (cantidad > 0 && cantidad <= viewPlayer.Banco) {
                            update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero + parseInt(cantidad), true);
                            update_info_player(contact.id.user, "Banco", viewPlayer.Banco - parseInt(cantidad), true);
                            message.reply(`Has retirado ${cantidad} de tu cuenta bancaria`);
                        } else {
                            message.reply('No tienes suficiente dinero en el banco');

                        }
                    } else if (opcion === 'transferir' || opcion === "tr") {
                        try {
                            let cantidad = parts[2];
                            let id = parts[3];
                            id = id.replace('@', '');
                            let tres = await getAllInfoPlayer(id); 
                            const n = await client.getContactById(id + '@c.us');
                            if (!isNaN(cantidad)) {
                                if (cantidad > 0 && cantidad <= viewPlayer.Banco) {
                                    update_info_player(contact.id.user, "Banco", viewPlayer.Banco - parseInt(cantidad), true);
                                    update_info_player(id, "Banco", tres.Banco + parseInt(cantidad), true);
                                    message.reply(`Has transferido ${n.pushname} a ${id}`);
                                } else {
                                    message.reply('No tienes suficiente dinero en e                                    echo "pm2 restart 0" | at 2:00 AMl banco');
                                }
                            }
                        
                        } catch (error) {
                            console.error(error);
                        }
                    }else if(opcion === 'cambiar puntos' || opcion === 'cp'){
                        try{
                            let cantidad = parts[2];
                            cantidad = parseInt(cantidad);
                            if(cantidad > 0 && cantidad <= viewPlayer.Puntos){
                                update_info_player(contact.id.user, "Puntos", viewPlayer.Puntos - parseInt(cantidad), true);
                                update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero + parseInt(cantidad), true);
                                message.reply(`Has cambiado ${cantidad} puntos por dinero`);
                            }else{
                                message.reply('No tienes suficientes puntos');
                            }
                        }catch(err){
                            console.error(err);
                        }
                    }else{
                        message.reply('> Las opciones del banco son:\n\n>\Depositar (dp)\n> Retirar (rt)\n> Transferir (tr)\n> Cambiar puntos por dinero(cp)');
                    }
                }
                //simplifico lo del banco y saco dp, para que el usuario solo tenga que poner dp (cantidad)
                if (message.body.toLocaleLowerCase().startsWith('dp ')) {
                    let mensaje = message.body.split(' ');
                    let dinero = parseInt(mensaje[1]);
                    //verifico que sea solo dp (cantidadad) que sea un numero y que sea mayor a 0
                    if (mensaje.length === 2 && !isNaN(dinero) && dinero > 0) {
                        //verifico que tenga el dinero suficiente
                        if (viewPlayer.Dinero >= dinero) {
                            //actualizo el dinero y el banco
                            update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero - dinero, true);
                            update_info_player(contact.id.user, "Banco", viewPlayer.Banco + dinero, true);
                            message.reply(`Has depositado ${dinero} a tu cuenta bancaria`);
                        } else {
                            message.reply('No tienes suficiente dinero');
                        }
                    }
                }
                if (message.body.toLocaleLowerCase() === 'tienda') {
                /*  let articulos = {
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
                    message.reply(mensaje1); */
                    message.reply('la tienda estara disponible pronto')
                }
                /* if (message.body.toLocaleLowerCase().startsWith('comprar ')) {
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
                    if (viewPlayer.Dinero >= 0 && viewPlayer.Nivel > 1){
                        if(articulo in articulos.roles){
                            for (let rol in articulos.roles) {
                                if (articulo === rol) {
                                    if (viewPlayer.Rool !== rol){
                                        if(viewPlayer.Dinero >= articulos.roles[rol]){
                                            const casado = getAllInfoPlayer(viewPlayer.casado);
                                            if(rol === "ama" && !casado.Rool === "ama" && !casado.Rool === "vagabundo"){
                                                update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero - articulos.roles[rol], true);
                                                update_info_player(contact.id.user, "Rool", rol, true);
                                                message.reply('Has comprado el articulo');
                                            }else{
                                                update_info_player(contact.id.user, "dinero", viewPlayer.Dinero - articulos.roles[rol], true);
                                                update_info_player(contact.id.user, "Rool", rol, true);
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
                        const pareja1_info = getAllInfoPlayer(pareja1); 
                        const pareja2_info = getAllInfoPlayer(pareja2);
                        if(!isNaN(pareja1) && !isNaN(pareja2)){
                            if(pareja1 === pareja2){
                                message.reply('No puedes tener sexo contigo mismo');
                            }else{
                                if(pareja1.Casado === pareja2 && viewPlayer.Casado === pareja1){
                                    chat.sendMessage(`@${pareja1} y @${pareja2} tuvieron sexo`, {mentions: [pareja1 + '@c.us', pareja2 + '@c.us']})
                                }else{
                                    if(pareja1_info.Casado === "nadie :(" && pareja2_info.Casado !== "nadie :("){
                                        chat.sendMessage(`@${pareja2} tuvo sexo y es infiel`, {mentions: [pareja2 + '@c.us']}) 
                                    }else if(pareja1_info.Casado !== pareja2 && pareja2_info.Casado !== pareja1){
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

                }   */
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
                            participantes(contact.id.user) ? quotedMsg.delete(true) : message.reply('No puedes borrar mensajes de otros si no eres admin.');
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
                function descargarM(stream, url) {
                    return new Promise(async (resolve, reject) => {
                        try {
                            await new Promise((resolve, reject) => {
                                //Comprimo el archivo
                                ffmpeg()
                                    .input(stream)
                                    .audioBitrate(128)
                                    .save(`${directemp}/audio.mp3`)
                                    .on('end', resolve)
                                    .on('error', reject);
                            });
                            // lo envio
                            const file = fs.readFileSync(`${directemp}/audio.mp3`);
                            const media = new MessageMedia('audio/mp3', file.toString('base64'), 'audio');
                            await requestM[0].chat.sendMessage(media, { quotedMessageId: requestM[0].quotedMessageId });
                            resolve();
                        } catch (err) {
                            console.error(err);
                            console.log("Error YTDL");

                            try {
                                const n = await YTDownloadMusic(url);
                                const response = await fetch(n);
                                const buffer = await response.buffer();
                                fs.writeFileSync(`${directemp}/audio.mp3`, buffer);
                                const file = fs.readFileSync(`${directemp}/audio.mp3`);
                                const media = new MessageMedia('audio/mp3', file.toString('base64'), 'audio');
                                await requestM[0].chat.sendMessage(media, { quotedMessageId: requestM[0].quotedMessageId });
                                resolve();
                            } catch (err) {
                                console.error(err);
                                console.log("\n\n Error my module");
                                reject(err);
                            }
                        } finally {
                            // Limpia el archivo temporal
                            if (fs.existsSync(`${directemp}/audio.mp3`)) {
                                fs.unlinkSync(`${directemp}/audio.mp3`);
                            }
                        }
                    });
                }
                function addPetition(url, mensaje_error) {
                    if(requestM.length < 1){
                        counterListRequestMusic = 1;
                    }
                    let petition = {
                        url: url,
                        chat: chat,
                        quotedMessageId: message.id._serialized
                    };
                    if(requestM.includes(petition)){
                        message.reply('Ya la estoy descargando no tienes que pedirla de nuevo');
                        return;
                    }
                    requestM.push(petition);
                    
                    if (counterListRequestMusic > 0) {
                        counterListRequestMusic = 0;
                        const agent = ytdl.createAgent(JSON.parse(fs.readFileSync("cookie.json")));
                        processQueue(agent, mensaje_error);
                    }
                }
                async function processQueue(agent, mensaje_error) {
                    while (requestM.length > 0) {
                        const petition = requestM[0];
                        try {
                            await descargarM(ytdl(petition.url, { filter: 'audioonly', agent: agent }), mensaje_error, petition.url);
                            requestM.shift(); // Elimina la petición procesada
                        } catch (error) {
                            console.error("Error al descargar la canción:", error);
                            requestM[0].chat.sendMessage(mensaje_error, { quotedMessageId: requestM[0].quotedMessageId });
                            requestM.shift(); 
                        }
                    }
                }
                if (message.body.toLowerCase().startsWith("m ")) {
                        const mensaje_error = "*Lo siento, no pude descargar la canción 😞*";
                        try {
                            const parts = message.body.split(' ');
                            const search = parts.slice(1).join(' ');
                            let stream;
                            await chat.sendSeen();
                            await chat.sendStateTyping();

                            if (search.includes('https://youtu.be/')){
                                stream = 
                                addPetition(search, mensaje_error);
                                return
                            }
                            await youtube.search(search, { limit: 1 }).then(x => {
                                try {
                                    if (x.length === 0) {
                                        message.reply('No puede encontrar esa cosa que escribiste, toma un curso de ortografía');
                                        counterListRequestMusic = 0;
                                        return;
                                    }
                                    addPetition(x[0].url, mensaje_error);

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
                }
                function descargarV(stream, mensaje_error, ruta){
                    ffmpeg()
                        .input(stream)
                        .save(ruta)
                        .on('end', () => {
                            const file = fs.readFileSync(ruta);
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
                async function descargarVideoIG(url, mensaje_error, ruta) {
                    try {
                        const dataList = await instagramDl(url);
                        const response = await fetch(dataList[0].download_link);
                        if (response.ok) {
                            const buffer = await response.buffer();
                            fs.writeFile(ruta, buffer, () => {
                                const file = fs.readFileSync(ruta);
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
                async function descargarVideoTikTok(url, mensaje_error, ruta) {
                    try {
                    const result = await tk.tiktokdownload(url);
                    const response = await fetch(result.nowm);
                    const buffer = await response.buffer();
                    fs.writeFileSync(ruta, buffer, () => {
                        const file = fs.readFileSync(ruta);
                        const media = new MessageMedia('video/mp4', file.toString('base64'), 'video');
                        chat.sendMessage(media, { quotedMessageId: message.id._serialized });
                        counterListRequestVideo = 0;
                    });
                    } catch (error) {
                        console.error(error.message);
                        counterListRequestVideo = 0;
                        message.reply(mensaje_error);
                    }
                }
                async function twitterDL(url, mensaje_error, ruta) {
                    await TwitterDL(url)
                    .then((result) => {
                        if(result['result'].media[0].type == 'video') {
                            https.get(result['result'].media[0].videos[1].url, (response) => {
                                const videoStream = fs.createWriteStream(ruta);
                                response.pipe(videoStream);
                                videoStream.on('finish', () => {
                                    const file = fs.readFileSync(ruta);
                                    const media = new MessageMedia('video/mp4', file.toString('base64'), 'video');
                                    chat.sendMessage(media, { quotedMessageId: message.id._serialized });
                                    counterListRequestVideo = 0;
                                });
                            })
                        }else if(result['result'].media[0].type == 'photo') {
                            https.get(result['result'].media[0].image, (response) => {
                                const imageStream = fs.createWriteStream('./assets/image.jpg');
                                response.pipe(imageStream);
                                imageStream.on('finish', () => {
                                    const file = fs.readFileSync('./assets/image.jpg');
                                    const media = new MessageMedia('image/jpg', file.toString('base64'), 'image');
                                    chat.sendMessage(media, { quotedMessageId: message.id._serialized });
                                    counterListRequestVideo = 0;
                                });
                            })
                        }
                    })
                    .catch((e) => {
                        console.log(e);
                        counterListRequestVideo = 0;
                        message.reply(mensaje_error);
                    });
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
                                const agent = ytdl.createAgent(JSON.parse(fs.readFileSync("cookie.json")));
                                const ruta = `${directemp}/video.mp4`;

                                if (search.includes('https://youtu.be/')){
                                    stream = ytdl(search, { filter: 'audioandvideo', quality: 'lowest', agent: agent});
                                    descargarV(stream, mensaje_error, ruta);
                                    return
                                }else if(search.includes('https://www.youtube.com/shorts/') || search.includes('https://youtube.com/shorts/')){
                                    stream = ytdl(search, { filter: 'audioandvideo', quality: 'highestvideo', agent: agent});
                                    descargarV(stream, mensaje_error, ruta);
                                    return
                                }
                                if(search.includes('https://www.instagram.com/')){
                                    descargarVideoIG(search, mensaje_error, ruta);
                                    return
                                }
                                if(search.includes('https://www.tiktok.com/') || search.includes('https://vm.tiktok.com/')){
                                    descargarVideoTikTok(search, mensaje_error, ruta);
                                    return
                                }
                                if(search.includes('https://x.com/')){
                                    twitterDL(search, mensaje_error, ruta);
                                    return
                                }
                                await youtube.search(search, { limit: 1 }).then(x => {
                                try {
                                    if (x.length === 0) {
                                        message.reply('No puede encontrar esa cosa que escribiste, toma un curso de ortografía');
                                        counterListRequestVideo = 0;
                                        return;
                                    }
                                    stream = ytdl(x[0].url, { filter: 'audioandvideo', quality: 'lowest', agent: agent});
                                    descargarV(stream, mensaje_error, ruta);

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
                // Funcion para mencionar a todos los integrantes del grupo
                async function mentionAll(text){
                    //compruebo si el chat es un grupo, si el usuario es admin o si mi numero es el que hace la llamada.
                    if((chat.isGroup && participantes(contact.id.user)) || Alastor_Number.includes(contact.id.user)){

                        let mention = [];
                        //busco dentro del array para introducir el id de todos los usuarios serializados dentro de otro array
                        chat.participants.forEach(participant => {
                            mention.push(`${participant.id._serialized}`);
                        });
                    
                        await chat.sendMessage(text, { mentions: mention });
                    }
                }
                // llamada a todos los integrantes del grupo
                if(message.body.toLocaleLowerCase() === '!t' || message.body.toLocaleLowerCase().startsWith('!t')){
                    const parts = message.body.split(' ');
                    //verifico si parts tiene una longitud mayor a uno y si no incluye la palabra !t
                    if(parts.length > 1 && !parts.slice(1).join(' ').toLocaleLowerCase().includes('!t')){
                        //si es asi mando el texto a la funcion para que lo envie
                        mentionAll(parts.slice(1).join(' '));
                    }else{
                        mentionAll('Hola a todos, activense!!');
                    }
                }    
                if (message.body.toLocaleLowerCase() == 'ajustes' || message.body.toLocaleLowerCase() == 'as') {
                    if (chat.isGroup && participantes(contact.id.user)) {
                        await chat.sendSeen();
                        await chat.sendStateTyping();
                        option.ajustes = 1;
                        message.reply(
                            "*Opciones*\n\n" +
                            "Juego (j)\n" +
                            "Comandos (cd)\n" +
                            "Activar o Desactivar (ab)\n\n" +
                            "Este menu aun esta en desarrollo por lo que puede que no funcione correctamente")
                    }
                }
                if (message.body.toLocaleLowerCase() == 'juego' || message.body.toLocaleLowerCase() == 'j') {
                    if (chat.isGroup) {
                        if (option.ajustes == 1) {
                            await chat.sendSeen();
                            await chat.sendStateTyping();
                            if (participantes(contact.id.user)) {
                                option.juego = 1;
                                option.ajustes = 0;
                                menu_juego = option_game;message.hasQuotedMsg
                                if (!(await watchBan(chat.id._serialized, 'todos'))) {
                                    menu_juego = menu_juego.replace('1. Quitar la opción Juego\n', '1. Devolver la opción Juego\n');
                                    menu_juego = menu_juego.replace('2. Quitar los Juegos con menciones\n', '');
                                    menu_juego = menu_juego.replace('3. Todos pueden utilizar los juegos con menciones', '');
                                }
                                if (!(await watchBan(chat.id._serialized, 'menciones'))) {
                                    menu_juego = menu_juego.replace('2. Quitar los Juegos con menciones\n', '2. Devolver los Juegos con menciones\n');
                                    menu_juego = menu_juego.replace('3. Todos pueden utilizar los juegos con menciones', '');
                                }
                                if (!(await watchBan(chat.id._serialized, 'admins'))) {
                                    menu_juego = menu_juego.replace('3. Todos pueden utilizar los juegos con menciones', '3. Solo los administradores pueden utilizar los juegos con menciones');
                                }
                                message.reply(menu_juego);
                            }
                        }
                    }
                }
                async function comp(resp){ 
                    const title = await groupActiveQuestions(7, chat.id._serialized)
                    const quotedMsg = await message.getQuotedMessage();
                    if(quotedMsg.fromMe && quotedMsg.body.toLocaleLowerCase().includes(title.toLocaleLowerCase())){
                        await groupActiveQuestions(2, chat.id._serialized, false);
                        if (groupTimes[chat.id._serialized]) {
                            clearTimeout(groupTimes[chat.id._serialized]);
                            delete groupTimes[chat.id._serialized];
                        }
                        groupActiveQuestions(4, chat.id._serialized).then(async (queste) => {
                            if(resp == queste){
                                message.reply("Respuesta correcta ganaste 1 punto 👍 ");
                                update_info_player(contact.id.user, "Puntos", viewPlayer.Puntos + 1, true);
                            }else{
                                message.reply(`Respuesta incorrecta, la respuesta correcta es: ${quest.correctAnswerselected(await groupActiveQuestions(5, chat.id._serialized), await groupActiveQuestions(4, chat.id._serialized))} perdiste dos puntos 👎👎`);
                                update_info_player(contact.id.user, "Puntos", viewPlayer.Puntos - 2, true);
                            }
                        })
                    
                    }
                }
                if (message.body.toLocaleLowerCase() == '1') {
                    if(message.hasQuotedMsg && (await groupActiveQuestions(1, chat.id._serialized))){      
                        comp(1);     
                    }
                    if (option.juego == 1 && participantes(contact.id.user) && message.hasQuotedMsg) {
                        const quotedMsg = await message.getQuotedMessage();
                        if(quotedMsg.body.toLocaleLowerCase().includes(menu_juego.toLowerCase()) && quotedMsg.fromMe){
                            watchBan(chat.id._serialized, 'todos').then(async res => {
                                if (res) {
                                    message.reply("Se ha quitado la opción Juego");
                                    Bangame(message.from, 'todos');
                                    option.juego = 0;
                                } else {
                                    message.reply("Se ha devuelto la opción Juego");
                                    QuitBan(chat.id._serialized, 'todos');
                                    option.juego = 0;
                                }
                            })
                        }
                    }
                }
                if (message.body.toLocaleLowerCase() == '2') {
                    if(message.hasQuotedMsg && (await groupActiveQuestions(1, chat.id._serialized))){
                        comp(2);
                    }
                    if (option.juego == 1 && participantes(contact.id.user) && message.hasQuotedMsg) {
                        const quotedMsg = await message.getQuotedMessage();
                        if (await watchBan(chat.id._serialized, 'menciones') && await watchBan(chat.id._serialized, 'todos') && quotedMsg.body.toLocaleLowerCase().includes(menu_juego.toLocaleLowerCase()) && quotedMsg.fromMe) {
                            Bangame(message.from, 'menciones');
                            option.juego = 0;
                            message.reply("Se han quitado los juegos con menciones");
                        } else {
                            QuitBan(chat.id._serialized, 'menciones');
                            option.juego = 0;
                            message.reply("Se han devuelto los juegos con menciones");
                        }
                    }
                }
                if (message.body.toLocaleLowerCase() == '3') {
                    if(message.hasQuotedMsg && (await groupActiveQuestions(1, chat.id._serialized))){
                        comp(3);
                    }
                    if (option.juego == 1 && participantes(contact.id.user) && message.hasQuotedMsg) {
                        const quotedMsg = await message.getQuotedMessage();
                        if ((await watchBan(chat.id._serialized, 'admins')) && (await watchBan(chat.id._serialized, 'todos')) && quotedMsg.body.toLocaleLowerCase().includes(menu_juego.toLocaleLowerCase()) && quotedMsg.fromMe) {
                            Bangame(message.from, 'admins');
                            option.juego = 0;
                            message.reply("Ahora solo los administradores pueden utilizar los juegos con menciones");
                        } else {
                            QuitBan(chat.id._serialized, 'admins');
                            option.juego = 0;
                            message.reply("Ahora todos pueden utilizar los juegos con menciones");
                        }
                    
                    }
                }
                if(message.body.toLocaleLowerCase() === 'sb' && Alastor_Number.includes(contact.id.user)){
                    client.destroy();
                    cerrarBase();
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
                
                wa.me/${Alastor_Number[2]}
                
                𖤣.𖥧.𖡼.⚘𖤣.𖥧.𖡼.⚘𖤣.𖥧.𖡼.⚘𖤣.𖥧.𖡼.⚘𖤣.
                Aquí puedes Contactar con el diseñador del menu:

                wa.me/5144637126`
                
                    );
                } 
            };

            client.initialize()
        });
    }
}
module.exports = { AlastorBot };