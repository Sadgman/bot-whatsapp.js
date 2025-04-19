const qrcode = require('qrcode-terminal');
const fs = require('fs');
const https = require('https');
const { TwitterDL } = require("twitter-downloader");
const fetch = require("node-fetch");
const ytdp = require('ytdp')
const instagramDl = require("@sasmeee/igdl");
const tk = require('tiktok-downloaders');
const googleTTS = require('google-tts-api');
const youtube = require('youtube-sr').default;
const ytdl = require('@distube/ytdl-core');
const { obtenerPais } = require('./utils/prefix.js');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const { Client, LocalAuth, MessageMedia, RemoteAuth } = require('whatsapp-web.js');
const events = require('events');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const Jimp = require('jimp');
const quest = require('preguntas');
const mc = require('./utils/mc.js');
const Uplayer = require('./utils/playerUtils.js');
const Gtools = require('./utils/groupTools.js');
const games = require('./utils/GamesControlDb.js')
const botUtils = require('./utils/bots.js');

dayjs.extend(utc);
dayjs.extend(timezone); 

let numCodesSent = 0;
ffmpeg.setFfmpegPath(ffmpegPath);
events.EventEmitter.defaultMaxListeners = 20;

// Alastor Bot
// Version 4.0.1


class AlastorBot{
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
        const paths = await botUtils.SearchBotPath();
        await this.activateClientBot(baseDir, true, null, null);
        if(paths.length > 0){
            paths.forEach(async (path) => {
                if(!(await botUtils.SeeBotCargo(path) === null)){
                    await this.activateClientBot(baseDir, true, path, null);
                }
            })
        }
    }
    async closeBot(){
        const db  = require('./utils/base.js');
        new db().CloseDb()
        process.exit();
    }
    async activateClientBot(data_session, qqr, num, message) {
        return new Promise((resolve, reject) => {
            const client = new Client({
                authStrategy: new LocalAuth({
                    clientId: num,
                    dataPath: data_session
                }),
                restartOnAuthFail: true,
                puppeteer: {
                    headless: true,
                    args: [
                        '--no-sandbox', 
                        '--disable-setuid-sandbox', 
                        '--disable-dev-shm-usage',   
                    ],
                    executablePath: this.browserPath
                },
                ffmpegPath: ffmpegPath
            });
            client.on('disconnected', async (reason) => {
                console.error('Cliente desconectado:');
                const paths = await botUtils.SearchBotPath();
                if(paths.length > 0){
                    await botUtils.DeleteBot(num);
                    if(fs.existsSync(`${data_session}/session-${num}`, { recursive: true })){
                        fs.rmSync(`${data_session}/session-${num}`, { recursive: true, force: true });
                    }
                }
                client.destroy();
                reject();
            });
            client.on('auth_failure', async () => {
                console.error('Error de autenticación');
                await botUtils.DeleteBot(num);
            });
            //client.on('authenticated', async (session) => {})
            client.on('qr', async (qr) => {
                if (qqr) {
                    if(num !== null){
                        await botUtils.DeleteBot(num);
                        if(fs.existsSync(`${data_session}/session-${num}`, { recursive: true })){
                            fs.rmSync(`${data_session}/session-${num}`, { recursive: true, force: true });
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
                if(await botUtils.BotIsFound(client.info.wid.user)){
                    await botUtils.InsertBot(client.info.wid.user, data_session);
                }
                if(num){
                    directemp = `${data_session}/session-${client.info.wid.user}/Default/temp`;
                    if(!fs.existsSync(directemp)){
                        fs.mkdirSync(directemp, { recursive: true });
                    }
                    await botUtils.AssignBotCargo(client.info.wid.user, 'secundario');
                }else{
                    directemp = `${data_session}/session/Default/temp`;
                    if(!fs.existsSync(directemp)){
                        fs.mkdirSync(directemp, { recursive: true });
                    }
                    await botUtils.AssignBotCargo(num, 'principal');           
                }
                client.on('message_create', mensaje)
                numCodesSent = 0;
                resolve();
            });
            
            client.on('group_join', (notification) => {
                notification.getChat().then(async (chat) => {
                    Gtools.addgroup(chat.id._serialized);
                    if(await Gtools.esBotAsignado(chat.id._serialized, client.info.wid.user ) === 'no asignado'){
                        await Gtools.asignarBot(client.info.wid.user, chat.id._serialized);
                    }else if(await Gtools.esBotAsignado(chat.id._serialized, client.info.wid.user)){
                        return;
                    } 
                    if(await Gtools.watchBot(chat.id._serialized) && await Gtools.toggleWelcome(chat.id._serialized, true)){
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

            const preminum = `
            🌟 𝑶𝒃𝒕𝒆𝒏 𝒆𝒍 𝒑𝒓𝒆𝒎𝒊𝒖𝒎 🌟

            ᴅᴀʟᴇ ᴄʟɪᴄᴋ ᴀ ᴇꜱᴛᴇ ʟɪɴᴋ ǫᴜᴇ ᴛᴇ ʟʟᴇᴠᴀʀᴀ́ ᴀʟ ᴘᴀᴛʀᴇᴏᴍ ᴏꜰɪᴄɪᴀʟ ʏ ᴘᴏᴅʀᴀ́ꜱ ᴏʙᴛᴇɴᴇʀ ᴜɴ ʙᴏᴛ ᴘᴀʀᴀ ᴛᴜꜱ ɢʀᴜᴘᴏꜱ ᴏ ᴠᴏʟᴠᴇʀᴛᴇ ʙᴏᴛ⬇️

            𝐏𝐚𝐭𝐫𝐞𝐨𝐦
            https://www.patreon.com/alastor782/membership

            𝐏𝐚𝐲𝐩𝐚𝐥

            Volverse bot:
            https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-0JS30850HG541060HM4Z7EHI

            Obtener un bot:
            https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-38J04596E7945440NM4Z7H4A
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
            let mensaje_casado = {};
            let dinero_bj = {};
            let db_client = true;
            let ms;
            const direcMusic = './assets/audio';
            const Alastor_Number = ["32466905630", "18098972404", "573170633386", "22941159770", "595973819264"]
            const insultos = ['bot de mierda', 'mierda de bot', 'alastor de mierda']
            let requestM = []

            const mensaje =  async (message) => {
                let chat;
                try{
                    chat = await message.getChat();
                    
                }catch(err){
                    return;
                }
                finally{
                    if(message.body === '' || !chat){
                        return;
                    }
                }
                
                let numero_cliente = client.info.wid.user
                let contact = await message.getContact();
                const group = await message.getChat();
                const quotedMsg = message.hasQuotedMsg ? (await message.getQuotedMessage()) : null;
                console.log(`Nuevo mensaje ${chat.name} de ${contact.pushname}: ${message.body}`);


                const searchParticipante = (userId) => {
                    const groupParticipants = chat.participants;
                    const participant = groupParticipants.find(part => part.id.user === userId);
                    if (!participant) {
                        return false;
                    }
                    return true;
                }
                await Uplayer.jsonread(contact.id.user, chat.id._serialized);
                const viewPlayer = await Uplayer.getAllInfoPlayer(contact.id.user);
                chat.isGroup = chat.id.server === 'g.us' ? true : false;
                // agrego un jugador a la base de datos
                if(chat.isGroup){
                    // agrego el grupo a la base de datos
                    await Gtools.addgroup(chat.id._serialized)
                    //actualizo la cantidad de mensajes enviados por el jugador
                    if(botUtils.BotIsFound(contact.id.user)){
                        await Uplayer.update_info_player(contact.id.user, "Mensajes", viewPlayer.Mensajes + 1, true);
                    }
                    //compruebo si el bot esta asignado a un grupo
                    if(await Gtools.esBotAsignado(chat.id._serialized, numero_cliente) === 'no asignado' || !searchParticipante(await Gtools.verAsignadoBot(chat.id._serialized)) || await botUtils.BotIsFound(await Gtools.verAsignadoBot(chat.id._serialized))){
                        await Gtools.asignarBot(numero_cliente, chat.id._serialized);
                    }else if(await Gtools.esBotAsignado(chat.id._serialized, numero_cliente)){
                        return;
                    } 
                }

                function quitar_acentos(palabra){
                    const palabras_raras = ["á", "é", "í", "ó", "ú", "ñ", "ü"];
                    const letras_normales = ["a", "e", "i", "o", "u", "n", "u"];
                    for (let i = 0; i < palabras_raras.length; i++) {
                        palabra = palabra.replace(new RegExp(palabras_raras[i], 'g'), letras_normales[i]);
                    }
                    return palabra;
                }
                const ContadorDeUnDia = (player, time) => {
                    if(contadordia[player]){
                        return;
                    }
                    let startTime = Date.now();
                    contadordia[player] = {
                        timeout: setTimeout(() => {
                            delete contadordia[player];
                        }, time? time : 60000),
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

                const currentLevel = viewPlayer.Nivel;
                let winsNeeded = (currentLevel + 1) * 10;

                if(viewPlayer.Puntos >= winsNeeded){
                    Uplayer.update_info_player(contact.id.user, "Nivel", currentLevel + 1, true);
                    Uplayer.update_info_player(contact.id.user, "Puntos", 0, true);
                    message.reply('Felicidades has subido de nivel');
                }
                /**
                * Verifica si el usuario es admin o no, no necesita parametros
                * @param {string} author  id del usuario que envio el mensaje
                * @returns {boolean}  si el usuario es admin devuelve true si no false
                */
                function participantes(userId) {
                    const groupParticipants = chat.participants;
                    if(Array.isArray(groupParticipants)){
                        const participant = groupParticipants.find(part => part.id.user === userId);
                        if (!participant){
                            return false;
                        }
                        return participant.isAdmin || Alastor_Number.includes(userId);
                    }else{
                        return false;
                    }
                }
                if (message.body.toLocaleLowerCase().startsWith('ab')) {
                    let partes = message.body.split(' ');
                    if(partes.length > 2){
                        return;
                    }else if(partes.length === 2){
                        partes = partes[1];
                        if(chat.isGroup && (participantes(contact.id.user) || contact.id.user === numero_cliente)){
                            switch(partes){
                                case 'bienvenida':
                                case 'b':
                                    await Gtools.toggleWelcome(chat.id._serialized);
                                    const bienvenida = await Gtools.toggleWelcome(chat.id._serialized, true);
                                    message.reply(`Bienvenida a sido ${bienvenida ? 'activada' : 'desactivada'}`);
                                    break;
                                case 'br':     
                                    await Gtools.watchBan(chat.id._serialized, 'br') ? await Gtools.Bangame(chat.id._serialized, 'br') : await Gtools.QuitBan(chat.id._serialized, 'br');
                                    break;
                            }
                        }
                        switch (partes) {
                            case 'ms':
                                if(await mc.readStatus() === 'Offline'){
                                    message.reply('Activando servidor...')
                                    await mc.start();
                                    message.reply('El servidor esta Online o se esta iniciando revisa con `ms`');
                                }else{
                                    message.reply(`El servidor ya estaba encendido`);
                                }
                        }
                    }else if((participantes(contact.id.user) || contact.id.user === numero_cliente) && message.body.toLocaleLowerCase() === 'ab'){
                        if(contact.id.user === numero_cliente){
                            db_client = !db_client; chat
                            if(chat.isGroup && !(await Gtools.watchBot(chat.id._serialized))){
                                await Gtools.bot_off_on(chat.id._serialized);
                            }
                            message.reply(`El bot ha sido ${db_client ? 'activado' : 'desactivado'} por el huesped`);
                        }else if (db_client){
                            await Gtools.bot_off_on(chat.id._serialized);
                            const watch = await Gtools.watchBot(chat.id._serialized);
                            message.reply(`El bot ha sido ${watch ? 'activado' : 'desactivado'}`);
                        }else{
                            message.reply('*El bot fue desactivado por el huesped, hablale para que lo active*');
                        }
                    }
                }
                // Verifica si el bot esta activado en el grupo solo si el chat es un grupo
                const condicionReturnG = chat.isGroup ? !(await Gtools.watchBot(chat.id._serialized)) || !db_client || !(await Gtools.watchBan(chat.id._serialized, message.body.toLocaleLowerCase())) : false
                if (condicionReturnG){
                    return;
                }
                if(chat.isGroup && participantes(numero_cliente)){   
                    let mmsg = message.body.toLocaleLowerCase();
                    Gtools.addgroup(chat.id._serialized);
                            for (let i = 0; i < links_baneados.length; i++) {
                                if (mmsg.includes(links_baneados[i])) {
                                    message.delete(true);
                                    group.removeParticipants([contact.id._serialized])
                                    break
                                }
                            }       
                }
                //agregar otro cliente
                if (message.body.toLocaleLowerCase() === '!otro' && await botUtils.BotIsFound(contact.id.user) && !chat.isGroup) {
                    try {
                        if(!(await botUtils.quota())){
                            message.reply('No hay cupo para mas bots, si quieres comprar un cupo habla con Alastor');
                            message.reply(preminum);
                            return;
                        }else{
                            await message.reply(`*Información*\n\nAlastorBot no tiene la capacidad de ver tus mensajes ni la tendrá en el futuro, es decir nadie puede ver tus conversaciones`);
                            message.reply('Activando nuevo bot enviando codigo...');
                            const uniqueDir = './session'
                            ContadorDeUnDia(contact.id.user + '!otro', 180000);
                            await this.activateClientBot(uniqueDir, false, contact.id.user, message);
                            message.reply('Usted se convirtio en un bot');
                        }
                    } catch(err) {
                        message.reply('Lo siento no pude volverte bot');
                    }
                }
                // Añadir un miembro al grupo con solo su número
                if (message.body.toLocaleLowerCase().startsWith("aña") && chat.isGroup) {
                    // Verifico si el bot es admin y si el que añade es admin 
                    if (chat.isGroup && participantes(contact.id.user) && participantes(numero_cliente)) {
                        let parte = message.body.split(" ");
                        if(parte.length > 2){
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
                //remover un miembro del grupo y verifico si el bot es admin y si el que remueve es admin  
                if (message.body.toLocaleLowerCase().startsWith("!re") && chat.isGroup && participantes(numero_cliente) && participantes(contact.id.user)) {
                    const part = message.body.split(" ");
                    const part1 = part[0];
                    if (!(part1 === '!re')) {
                        return;
                    }
                    if (message.hasQuotedMsg) {
                        const quotedMsg = await message.getQuotedMessage();
                        let contacto = await quotedMsg.getContact();
                        // Verifico si es Alastor al que quiere remover, si es así retorno
                        if (Alastor_Number.includes(contacto.id.user)) return;
                
                        chat.removeParticipants([contacto.id._serialized]);
                    } else if (await message.getMentions()) {
                        let parte = await message.getMentions();
                        parte.forEach(p => {
                            if (Alastor_Number.includes(p.id.user)) return;
                            chat.removeParticipants([p.id._serialized]);
                        });
                    }
                }
                //remover a todos del grupo solo si es Alastor quien envia en comando
                if(message.body.toLocaleLowerCase() === '!re t' && Alastor_Number.includes(contact.id.user) && chat.isGroup && participantes(numero_cliente)){
                    chat.participants.forEach((participant) => { //obtengo todos los participantes del grupo
                        chat.removeParticipants([participant.id._serialized]); //los remuevo uno a uno
                    })
                }
                if (message.body.toLocaleLowerCase() === 'io' || message.body.toLocaleLowerCase() === 'ls' && chat.isGroup) {
                    try {
                        let person = message.hasQuotedMsg ? (await quotedMsg.getContact()).id.user : contact.id.user;
                        const info = await Uplayer.getAllInfoPlayer(person);
                        const casado = info.Casado !== 'nadie :(' ? `@${info.Casado}` : info.Casado;
                        const contacto_casado = info.Casado ===  'nadie :(' ? null : (await client.getNumberId(info.Casado))._serialized;
                        chat.sendMessage(`*Casad@ con:* ${casado}\n*nivel* ${info.Nivel}\n*sexo* ${info.sexo}\n*Puntuacion:* ${info.Puntos}\n*Rool:* ${info.Rool}\n*Pais:* ${obtenerPais(contact.id.user)}\n*Dinero:* ${info.Dinero}\n*Dinero en el banco:* ${info.Banco}\n*Total de mensajes enviados:* ${info.Mensajes}\n*Con AlastorBot desde:*\n${info.create_at} `, {
                            mentions: contacto_casado,
                            quotedMessageId: message.hasQuotedMsg? quotedMsg.id._serialized : message.id._serialized
                        });
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
                            let casadoPlayer = await Uplayer.getAllInfoPlayer(viewPlayer.Casado);
                            Uplayer.update_info_player(viewPlayer.Casado, "Puntos", casadoPlayer.Puntos + 1, true);
                            Uplayer.update_info_player(viewPlayer.Casado, "Casado", "nadie :(", true);
                            Uplayer.update_info_player(contact.id.user, "Casado", "nadie :(", true);
                            Uplayer.update_info_player(contact.id.user, "Mensajes", viewPlayer.Mensajes - 20, true);
                            Uplayer.update_info_player(contact.id.user, "Puntos", viewPlayer.Puntos - 1, true);
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
                            Uplayer.jsonread(prometido);
                            if (viewPlayer.Casado === "nadie :(") {
                                Uplayer.update_info_player(contact.id.user, "Casado", prometido, true);
                                Uplayer.update_info_player(prometido, "Casado", contact.id.user, true);
                                message.reply("*🎉Felicidades ahora estas casad@!!*");
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
                                mensaje_casado[prometido.replace('@c.us', '')] = [
                                    `*¿hey @${prometido.replace('@c.us', '')} quieres casarte con ${contact.pushname}?*\n\n> Si tu respuesta es sí responde a este mensaje con un sí`,
                                    contact.id.user

                                ]
                                chat.sendMessage(mensaje_casado[prometido.replace('@c.us', '')][0], { mentions: prometido })
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
                        if(quotedMsg.fromMe && quotedMsg.body === mensaje_casado[contact.id.user]?.[0]){
                            const phoneNumber = mensaje_casado[contact.id.user][1];
                            casarse(phoneNumber);
                        }
                    }
                }

                if (message.body.toLocaleLowerCase() === 'menu' || message.body.toLocaleLowerCase() === 'menú') {
                    let tempMenu = menu;
                    await chat.sendSeen();
                    await chat.sendStateTyping();
                    if (chat.isGroup) {
                        if (await Gtools.watchBan(chat.id._serialized, 'todo') === false) {
                            tempMenu = tempMenu.replace('🎮 👾🎧| Jugar.\n', '');
                            message.reply(tempMenu);
                        } else {
                            message.reply(tempMenu);
                        }
                    } else {
                        tempMenu = tempMenu.replace('📝⚙️🪛 | As (Ajustes)\n', '');
                        tempMenu = tempMenu.replace('👨‍👩‍👧‍👦🏡💞 | !t (Solo Admins).\n', '');
                        message.reply(tempMenu);
                    }
                }
                if (message.body.toLocaleLowerCase() === 'rnu') {
                    games.readRandomAnime().then((anime) => {
                        message.reply(anime);
                    });
                }
                if (message.body.toLocaleLowerCase() === 'ms') {
                    await chat.sendSeen();
                    await chat.sendStateTyping();
                    ms = await mc.readStatus();
                    message.reply(`Estado: ${ms}\n\nip: mc.alastorbot.site\n\nport: 51682\n\nversion: La ultima.\n\n\n Para activar el servidor escribe\n\`ab ms\``);
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
                            Uplayer.update_info_player(contact.id.user, "Puntos", viewPlayer.Puntos + 1, true);
                        } else if (diferenciaMaquina < diferenciaJugador) {
                            ganador = 'ganó la Máquina';
                            Uplayer.update_info_player(contact.id.user, "Puntos", viewPlayer.Puntos - 1, true);
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
                    }
                }
                if(message.body.toLocaleLowerCase().startsWith('pp ')){
                    return
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
                        if (Gtools.addgroup(chat.id._serialized) && await Gtools.watchBan(chat.id._serialized, 'ppt') && await Gtools.watchBan(chat.id._serialized, 'todos')) {
                            ppt_menu = await Gtools.watchBan(chat.id._serialized, 'ppt') ? ppt_menu : ppt_menu = 'Lo siento Banearon este juego del grupo';
                            message.reply(ppt_menu);
                        }
                    } else {
                        message.reply(ppt_menu);
                    }
                }
                // Skills de Roles
                if (message.body.toLocaleLowerCase() === "robar" && message.hasQuotedMsg && viewPlayer.Rool == 'ladron'){
                    const quotedMsg = await message.getQuotedMessage();
                    let contacto = await quotedMsg.getContact();
                    let infoContacto = await Uplayer.getAllInfoPlayer(contacto.id.user);
                    if (infoContacto.Dinero > 0) {
                        await Uplayer.update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero + infoContacto.Dinero, true);
                        await Uplayer.update_info_player(contacto.id.user, "Dinero", 0, true);
                        message.reply('lograste robarle todo el dinero a ' + contacto.pushname);
                    } else {
                        message.reply("No hay nada que robar");
                    }
                }
                if(viewPlayer.Rool === "ama"){
                    let day = parseInt(dayjs().tz("America/Santo_Domingo").format('D'))
                    if(Uplayer.update_dias(contact.id.user,day, 2) === false){
                        Uplayer.update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero + 10, true);
                        let casado = await Uplayer.getAllInfoPlayer(viewPlayer.Casado)
                        Uplayer.update_info_player(viewPlayer.Casado, "Dinero", casado.Dinero - 10, true);
                        Uplayer.update_dias(contact.id.user,day, 1);
                        message.reply("Has recibido 10 monedas por ser ama de casa");
                    }
                }
                if(message.body.toLocaleLowerCase() === 'arrestar'){
                    if(viewPlayer.Rool === "policia" && golpear === true){
                        if(message.hasQuotedMsg){
                            const quotedMsg = await message.getQuotedMessage();
                            let contacto = await quotedMsg.getContact();
                            let contacto_info = await Uplayer.getAllInfoPlayer(contacto.id.user);
                            if(contacto_info.Rool === "ladron"){
                                await Uplayer.update_info_player(contact.id.user, "Puntos", viewPlayer.Puntos + 3, true);
                                await Uplayer.update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero + 10, true);
                                if(contacto_info.Dinero > 0){
                                    message.reply("este ladron no tenia dinero deberias golpearlo con un palo");
                                }
                                await Uplayer.update_info_player(contacto.id.user, "Rool", "vagabundo", true);
                                message.reply("Has arrestado al ladron el jefe te dio 10 monedas y 3 puntos por tu buen trabajo");
                            }else{
                                message.reply("No puedes arrestar a alguien que no es un ladron y que no lo hayas golpeado");
                            }
                        }else{
                            message.reply("Solo puedes arrestar a un ladron al que le respondas");
                        }
                    }
                }
                if(message.body.toLocaleLowerCase() === 'golpear'){
                    try{
                        if(viewPlayer.Rool == "policia" && message.hasQuotedMsg){
                            let parte = await message.getQuotedMessage();
                            parte = await parte.getContact();
                            const parte_id = parte.id.user;
                            const persona_golpeada = await Uplayer.getAllInfoPlayer(parte_id);
                            if(persona_golpeada.Rool === "policia"){
                                message.reply("No puedes golpear a un policia");
                            }else if(persona_golpeada.Rool === "ladron"){
                                await Uplayer.update_info_player(parte_id, "Dinero", 0, true);
                                await Uplayer.update_info_player(parte_id, "Banco", 0, true);
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
                                message.reply(`Has golpeado a ${parte.pushname} ${respuestas[randomIndex]}, ahora arrestalo`);
                                golpear = true;
                            }
                        }
                    }catch(err){
                        console.log(err);
                    }
                }
                if (message.body.toLocaleLowerCase().startsWith('cz') && message.body.toLocaleLowerCase().split(' ')[0] === 'cz') {
                    if (chat.isGroup) {
                        if (message.body.toLocaleLowerCase() === 'cz') {
                            message.reply('Usa los siguientes comandos para jugar:\ncz (cantidad) (cara o cruz)\n\n*Nota* la cantidad no puede ser mayor a 7');
                            return;
                        }
                        let parts = message.body.split(' ');
                        let cantidad = parts[1];
                        let opcion = parts[2];

                        if(!(opcion === 'cara' || opcion === 'cruz')){
                            message.reply('La opcion debe ser cara o cruz');
                            return;
                        }
                        opcion = quitar_acentos(opcion);
                        opcion = opcion.toLocaleLowerCase();
                        if (isNaN(cantidad)) {
                            message.reply('La cantidad debe ser un numero');
                            return;
                        }else if(parseInt(cantidad) > 10000000 || parseInt(cantidad) < 0){
                            message.reply('La cantidad es invalida o la cantidadd es mayor a 1,000,000')
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
                                await Uplayer.update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero + cantidad, true);
                                message.reply(`Has ganado`);
                                const media = MessageMedia.fromFilePath(foto)
                                const medi = new MessageMedia('image/jpg', media.data, 'sticker');
                                chat.sendMessage(medi, { sendMediaAsSticker: true, stickerAuthor: 'Por Alastor', stickerName: 'Alastor Bot' });
                            }
                            if(opcion !== respuesta){
                                await Uplayer.update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero - cantidad, true);
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
                        // cartas especiales tiene un valor de 10
                        const cartas_especiales = ['J', 'Q', 'K', 'A', 'A'];
                        const cartas_completas = cartas.concat(cartas_especiales);
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
                                return 'dealer';
                            }else if(suma_jugador > 21){
                                return 'dealer';
                            }else if(suma_dealer > 21){
                                return 'jugador';
                            }else if(suma_jugador === suma_dealer){
                                return 'empate';
                            }
                            return suma_jugador > suma_dealer ? 'jugador' : 'dealer';
                        }
                        if(opcion[1] === 'apostar'){
                            if(!cartas_jugador[contact.id.user]){
                                let cantidad = opcion[2];
                                cantidad = parseInt(cantidad);
                                if(cantidad > 0){
                                    if(cantidad > 1000000){
                                        message.reply('No puedes apostar mas de 700');
                                        return;
                                    }
                                    if(viewPlayer.Dinero >= cantidad){
                                        dinero_bj[contact.id.user] = cantidad;
                                        await Uplayer.update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero - cantidad, true);
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
                                    await Uplayer.update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero + dinero_bj[contact.id.user] * 2, true);
                                    message.reply('Has ganado' + " las cartas del deler son: " + dealer[contact.id.user]);
                                }else if(ganador_juego === 'dealer'){
                                    message.reply('Has perdido' + " las cartas del deler son: " + dealer[contact.id.user]);
                                }else{
                                    await Uplayer.update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero + dinero_bj[contact.id.user]); 
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
                        Uplayer.update_info_player(contact.id.user, "Puntos", viewPlayer.Puntos - 1, true);
                    } else {
                        message.reply('Ganaste el bot escogio tijera');
                        Uplayer.update_info_player(contact.id.user, "Puntos", viewPlayer.Puntos + 1, true);
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
                        Uplayer.update_info_player(contact.id.user, "Puntos", viewPlayer.Puntos - 1, true);
                    } else {
                        message.reply('Ganaste el bot escogio piedra');
                        Uplayer.update_info_player(contact.id.user, "Puntos", viewPlayer.Puntos + 1, true);
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
                        Uplayer.update_info_player(contact.id.user, "Puntos", viewPlayer.Puntos - 1, true);
                    } else {
                        Uplayer.update_info_player(contact.id.user, "Puntos", viewPlayer.Puntos + 1, true);
                        message.reply('Ganaste el bot escogio papel');
                    }
                }
                if(message.body.toLocaleLowerCase() === 'top ricos'){
                    if(chat.isGroup){
                        const los_ricos = await Uplayer.Uplayer.topPlayersWithMostMoney();
                        const dinero_ricos = await Uplayer.moneyTopPlayers();
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
                        const los_niveles = await Uplayer.topPlayersWithMostLevel();
                        const niveles = await Uplayer.levelTopPlayers();
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
                        const personas = await Uplayer.topUsersMessages();
                        const mensajes = await Uplayer.messageUsers();
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
                    const contactf = message.mentionedIds
                    message.reply(contactf);
                }
                if (message.body.toLocaleLowerCase() === 'jugar') {
                    let tempmenu_game = menu_game;
                    await chat.sendSeen();
                    await chat.sendStateTyping();
                    if (chat.isGroup && await Gtools.watchBan(chat.id._serialized, 'todos')) {
                        if (!(await Gtools.watchBan(chat.id._serialized, 'menciones'))) {
                            tempmenu_game = tempmenu_game.replace(' formar pareja (fp) 👩🏻‍❤️‍💋‍👨🏻\n\n>', '');
                            message.reply(tempmenu_game);
                        } else {
                            message.reply(tempmenu_game);
                        }
                    }else if(!chat.isGroup){
                        tempmenu_game = tempmenu_game.replace(' formar pareja (fp) 👩🏻‍❤️‍💋‍👨🏻\n\n>', '');
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
                        let d, media;
                        if (message.hasQuotedMsg && (await message?.getQuotedMessage())?.hasMedia) {
                            try {
                                d = await (await message.getQuotedMessage()).downloadMedia();
                                media = new MessageMedia(d.mimetype, d.data, 'sticker');
                                await chat.sendMessage(media, { sendMediaAsSticker: true, stickerAuthor: 'Por Alastor', stickerName: 'Alastor Bot' });
                            } catch (err) {
                                message.reply('No se pudo crear el sticker');
                            }
                        } else if (message.hasMedia) {
                            try {
                                d = await message.downloadMedia();
                                media = new MessageMedia(d.mimetype, d.data, 'sticker');
                                await chat.sendMessage(media, { sendMediaAsSticker: true, stickerAuthor: 'Por Alastor', stickerName: '' });   
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
                        Uplayer.update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero + 1, true);
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
                        googleTTS.getAllAudioBase64(text, { lang: language, slow: false })
                            .then((audio) => {
                                let result='';
                                for(let i=0; i<audio.length; i++){
                                    result += audio[i]?.base64
                                }
                                const medi = new MessageMedia('audio/mp3', result, 'audio');
                                if (message.hasQuotedMsg) {
                                    chat.sendMessage(medi, { sendAudioAsVoice: true, quotedMessageId: mensaje_citado.id._serialized });
                                } else {
                                    chat.sendMessage(medi, { sendAudioAsVoice: true });
                                }
                            }).catch((err) => {
                                message.reply('Lo siento no puedo enviarlo');
                            });
                    }

                    processAudio();
                }

                const TempQuest = (id_group) => {
                    if (groupTimes[id_group]) {
                        return;
                    }

                    groupTimes[id_group] = setTimeout(async() => {
                        await games.quest(2, id_group, false);
                        chat.sendMessage('La pregunta ha expirado');

                        delete groupTimes[id_group];
                    }, 10000);
                }
                if(message.body.toLocaleLowerCase() === '!q'){
                    if(chat.isGroup){
                        if(!(await games.quest(1 ,chat.id._serialized))){
                            let indexp = quest.newIndexP();
                            await games.quest(8, chat.id._serialized, quest.readTitle());
                            await games.quest(6, chat.id._serialized, indexp);
                            await games.quest(2, chat.id._serialized, true);
                            await games.quest(3, chat.id._serialized ,quest.correctAnswerIndex());
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
                    if (chat.isGroup && await Gtools.watchBan(chat.id._serialized, 'fp') && await Gtools.watchBan(chat.id._serialized, 'todos') && await Gtools.watchBan(chat.id._serialized, 'menciones')){
                        if (!participantes(contact.id.user) && !(await Gtools.watchBan(chat.id._serialized, 'admins'))) {
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
                            Uplayer.update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero - parseInt(cantidad), true);
                            Uplayer.update_info_player(contact.id.user, "Banco", viewPlayer.Banco + parseInt(cantidad), true);
                            message.reply(`Has depositado ${cantidad} a tu cuenta bancaria`);
                        } else {
                            message.reply('No tienes suficiente dinero');
                        }
                    } else if (opcion === 'retirar' || opcion === 'rt') {
                        let cantidad = parts[2];
                        if (cantidad > 0 && cantidad <= viewPlayer.Banco) {
                            Uplayer.update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero + parseInt(cantidad), true);
                            Uplayer.update_info_player(contact.id.user, "Banco", viewPlayer.Banco - parseInt(cantidad), true);
                            message.reply(`Has retirado ${cantidad} de tu cuenta bancaria`);
                        } else {
                            message.reply('No tienes suficiente dinero en el banco');

                        }
                    } else if ((opcion === 'transferir' || opcion === "tr") && message.mentionedIds.length) {
                        try {
                            let cantidad = parts[2];
                            const id = await client.getContactById(message.mentionedIds[0]);
                            let tres = await Uplayer.getAllInfoPlayer(id.id.user); 

                            if (!isNaN(cantidad)) {
                                cantidad = parseInt(cantidad);
                                const comision = () => {   
                                    // Calcular el 10% de la cantidad
                                    const comisionTotal = cantidad * 0.10;
                                    // Calcular el monto total a deducir (transferencia + comisión)
                                    const montoTotal = Math.round(cantidad + comisionTotal);    
                                    return montoTotal; 
                                }
                                if (cantidad > 0 && comision() <= viewPlayer.Banco) {
                                    Uplayer.update_info_player(contact.id.user, "Banco", viewPlayer.Banco - comision(), true);
                                    Uplayer.update_info_player(id.id.user, "Banco", tres.Banco + parseInt(cantidad), true);
                                    message.reply(`Has transferido ${cantidad} a ${id.pushname}`);
                                } else {
                                    message.reply('No tienes suficiente dinero en el banco o no tienes la cantidad suficiente para la comisión del 10%');
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
                                Uplayer.update_info_player(contact.id.user, "Puntos", viewPlayer.Puntos - parseInt(cantidad), true);
                                Uplayer.update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero + parseInt(cantidad), true);
                                message.reply(`Has cambiado ${cantidad} puntos por dinero`);
                            }else{
                                message.reply('No tienes suficientes puntos');
                            }
                        }catch(err){
                            console.error(err);
                        }
                    }else{
                        message.reply('> Las opciones del banco son:\n\n> Depositar (dp)\n> Retirar (rt)\n> Transferir (tr)\n> Cambiar puntos por dinero(cp)\n\nLa comision es del 10% por transferencia');
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
                            Uplayer.update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero - dinero, true);
                            Uplayer.update_info_player(contact.id.user, "Banco", viewPlayer.Banco + dinero, true);
                            message.reply(`Has depositado ${dinero} a tu cuenta bancaria`);
                        } else {
                            message.reply('No tienes suficiente dinero');
                        }
                    }
                }
                if (message.body.toLocaleLowerCase() === 'tienda') {
                 let articulos = {
                        "roles": {
                            "panadero": 30000,    
                            "cocinero": 10000,
                            "escritor":50000,
                            "ama": 0,
                            "stripper": 600,
                            "bailarin": 500,
                            "ladron": 0,
                            "narco": 1000000,
                            "policia": 3000,
                            "detective": 5000,
                            "doctor general": 5000,
                            "cirujano": 100000,
                            "cirujano plastico": 200000,
                            "enfermera": 40000
                        },
                        "Animales":{
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
                            "panadero": 30000,    
                            "cocinero": 10000,
                            "escritor":50000,
                            "ama": 0,
                            "stripper": 600,
                            "bailarin": 500,
                            "ladron": 0,
                            "narco": 1000000,
                            "policia": 3000,
                            "detective": 5000,
                            "doctor general": 5000,
                            "cirujano": 100000,
                            "cirujano plastico": 200000,
                            "enfermera": 40000
                        },
                        "Animales":{
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
                    if (viewPlayer.Dinero >= 0 && viewPlayer.Nivel > 1) {
                        if (articulo in articulos.roles) {
                            const rol = articulos.roles[articulo];
                            if (viewPlayer.Rool !== articulo) {
                                if(articulo === 'ama') return;
                                if (viewPlayer.Dinero >= rol) {
                                    await Uplayer.update_info_player(contact.id.user, "Dinero", viewPlayer.Dinero - rol, true);
                                    await Uplayer.update_info_player(contact.id.user, "Rool", articulo, true);
                                    message.reply('Has comprado el articulo');
                                } else {
                                    message.reply('No tienes suficiente dinero');
                                }
                            } else {
                                message.reply('Ya tienes ese articulo');
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
                        const pareja1_info = await Uplayer.getAllInfoPlayer(pareja1); 
                        const pareja2_info = await Uplayer.getAllInfoPlayer(pareja2);
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

                }  
                if (message.body.toLocaleLowerCase() == 'sf') {
                    await chat.sendSeen();
                    await chat.sendStateTyping();
                    if (message.hasQuotedMsg) {
                        const mensaje_citado = await message.getQuotedMessage();
                        if (mensaje_citado.hasMedia) {
                            try {
                                const d = await mensaje_citado.downloadMedia();
                                chat.sendMessage(d);
                            } catch (err) {
                                message.reply('No pude enviar la foto, video o audio');
                            }
                        }
                    } else if (message.hasMedia === true) {
                        try {
                            const f = await message.downloadMedia();
                            chat.sendMessage(f);
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
                        if (quotedMsg.fromMe || participantes(contact.id.user)){
                            quotedMsg.delete(true);
                        }else if(chat.isGroup){
                            message.reply('No puedes borrar mensajes de otros si no eres admin.');     
                        }
                    }
                }
                async function SendMediaFile(type){
                    const mensaje_error = "*Lo siento, no pude descargar la canción 😞*";
                    let nameM = './assets/audio/';
                    try {
                        const parts = message.body.split(' ');
                        const search = parts.slice(1).join(' ');
                        await chat.sendSeen();
                        await chat.sendStateTyping();
            
                        
                        const outPath = await ytdp.download(search, type, nameM);  
                                            
                        const file = fs.readFileSync(outPath);
                        const media = new MessageMedia(type == 'audio'? 'audio/mp3' : 'video/mp4', file.toString('base64'));
                        chat.sendMessage(media, { quotedMessageId: message.id._serialized });
                        return outPath;       
                    } catch (error) {
                        console.error('Ocurrió un error:', error);
                        message.reply(mensaje_error);
                    }
                }
                
                if (message.body.toLowerCase().startsWith("m ")) {
                    SendMediaFile('audio');
                }
                
                if (message.body.toLowerCase().startsWith("v ")) {
                    SendMediaFile('video');
                }
                // Funcion para mencionar a todos los integrantes del grupo
                async function mentionAll(text){
                    //compruebo si el chat es un grupo, si el usuario es admin o si mi numero es el que hace la llamada.
                    if((chat.isGroup && participantes(contact.id.user)) || Alastor_Number.includes(contact.id.user)){

                        let mention = [];
                        //busco dentro del array para introducir el id de todos los usuarios serializados dentro de otro array
                        await chat.participants.forEach(participant => {
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
                                if (!(await Gtools.watchBan(chat.id._serialized, 'todos'))) {
                                    menu_juego = menu_juego.replace('1. Quitar la opción Juego\n', '1. Devolver la opción Juego\n');
                                    menu_juego = menu_juego.replace('2. Quitar los Juegos con menciones\n', '');
                                    menu_juego = menu_juego.replace('3. Todos pueden utilizar los juegos con menciones', '');
                                }
                                if (!(await Gtools.watchBan(chat.id._serialized, 'menciones'))) {
                                    menu_juego = menu_juego.replace('2. Quitar los Juegos con menciones\n', '2. Devolver los Juegos con menciones\n');
                                    menu_juego = menu_juego.replace('3. Todos pueden utilizar los juegos con menciones', '');
                                }
                                if (!(await Gtools.watchBan(chat.id._serialized, 'admins'))) {
                                    menu_juego = menu_juego.replace('3. Todos pueden utilizar los juegos con menciones', '3. Solo los administradores pueden utilizar los juegos con menciones');
                                }
                                message.reply(menu_juego);
                            }
                        }
                    }
                }
                async function comp(resp){ 
                    const title = await games.quest(7, chat.id._serialized)
                    const quotedMsg = await message.getQuotedMessage();
                    if(quotedMsg.fromMe && quotedMsg.body.toLocaleLowerCase().includes(title.toLocaleLowerCase())){
                        await games.quest(2, chat.id._serialized, false);
                        if (groupTimes[chat.id._serialized]) {
                            clearTimeout(groupTimes[chat.id._serialized]);
                            delete groupTimes[chat.id._serialized];
                        }
                        games.quest(4, chat.id._serialized).then(async (queste) => {
                            if(resp == queste){
                                message.reply("Respuesta correcta ganaste 1 punto 👍 ");
                                Uplayer.update_info_player(contact.id.user, "Puntos", viewPlayer.Puntos + 1, true);
                            }else{
                                message.reply(`Respuesta incorrecta, la respuesta correcta es: ${quest.correctAnswerselected(await games.quest(5, chat.id._serialized), await games.quest(4, chat.id._serialized))} perdiste dos puntos 👎👎`);
                                Uplayer.update_info_player(contact.id.user, "Puntos", viewPlayer.Puntos - 2, true);
                            }
                        })
                    
                    }
                }
                if (message.body.toLocaleLowerCase() == '1') {
                    if(message.hasQuotedMsg && (await games.quest(1, chat.id._serialized))){      
                        comp(1);     
                    }
                    if (option.juego == 1 && participantes(contact.id.user) && message.hasQuotedMsg) {
                        const quotedMsg = await message.getQuotedMessage();
                        if(quotedMsg.body.toLocaleLowerCase().includes(menu_juego.toLowerCase()) && quotedMsg.fromMe){
                            Gtools.watchBan(chat.id._serialized, 'todos').then(async res => {
                                if (res) {
                                    message.reply("Se ha quitado la opción Juego");
                                    Gtools.Bangame(message.from, 'todos');
                                    option.juego = 0;
                                } else {
                                    message.reply("Se ha devuelto la opción Juego");
                                    Gtools.QuitBan(chat.id._serialized, 'todos');
                                    option.juego = 0;
                                }
                            })
                        }
                    }
                }
                if (message.body.toLocaleLowerCase() == '2') {
                    if(message.hasQuotedMsg && (await games.quest(1, chat.id._serialized))){
                        comp(2);
                    }
                    if (option.juego == 1 && participantes(contact.id.user) && message.hasQuotedMsg) {
                        const quotedMsg = await message.getQuotedMessage();
                        if (await Gtools.watchBan(chat.id._serialized, 'menciones') && await Gtools.watchBan(chat.id._serialized, 'todos') && quotedMsg.body.toLocaleLowerCase().includes(menu_juego.toLocaleLowerCase()) && quotedMsg.fromMe) {
                            Gtools.Bangame(message.from, 'menciones');
                            option.juego = 0;
                            message.reply("Se han quitado los juegos con menciones");
                        } else {
                            Gtools.QuitBan(chat.id._serialized, 'menciones');
                            option.juego = 0;
                            message.reply("Se han devuelto los juegos con menciones");
                        }
                    }
                }
                if (message.body.toLocaleLowerCase() == '3') {
                    if(message.hasQuotedMsg && (await games.quest(1, chat.id._serialized))){
                        comp(3);
                    }
                    if (option.juego == 1 && participantes(contact.id.user) && message.hasQuotedMsg) {
                        const quotedMsg = await message.getQuotedMessage();
                        if ((await Gtools.watchBan(chat.id._serialized, 'admins')) && (await Gtools.watchBan(chat.id._serialized, 'todos')) && quotedMsg.body.toLocaleLowerCase().includes(menu_juego.toLocaleLowerCase()) && quotedMsg.fromMe) {
                            Gtools.Bangame(message.from, 'admins');
                            option.juego = 0;
                            message.reply("Ahora solo los administradores pueden utilizar los juegos con menciones");
                        } else {
                            Gtools.QuitBan(chat.id._serialized, 'admins');
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
                if(message.body.toLocaleLowerCase() == '!premium' || message.body.toLocaleLowerCase() == 'preg'){
                    message.reply(preminum);
                }
                if (message.body.toLocaleLowerCase() === 'creador') {
                    await chat.sendSeen();
                    await chat.sendStateTyping();
                    message.reply(`                 
                            *INFORMACIÓN*
                         *SOBRE EL CREADOR*
                            *DEL BOT 𖠌*

                    ¡Hola! ◡̈
                    Puedes comunicarte con mi creador desde este link:
                    
                    wa.me/${Alastor_Number[2]}
                    
                    𖤣.𖥧.𖡼.⚘𖤣.𖥧.𖡼.⚘𖤣.𖥧.𖡼.⚘𖤣.𖥧.𖡼.⚘𖤣.`);
                } 
            };

            client.initialize()
        });
    }
}
module.exports = { AlastorBot };
