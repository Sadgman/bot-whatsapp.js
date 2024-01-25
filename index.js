const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

let client;

if((process.arch === 'arm' || process.arch === "arm64") && process.execPath === '/usr/bin/node'){
    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            args: ['-no-sandbox'],
            executablePath: '/usr/bin/chromium-browser'
        },
        ffmpegPath: '/usr/bin/ffmpeg'

    });
}else{
    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            executablePath: '/usr/bin/google-chrome-stable'
        },
        ffmpegPath: '/usr/bin/ffmpeg'

    });
}
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
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
function jsonread(player){
    let jsonfile = fs.readFileSync('data.json', 'utf-8');
    let data = JSON.parse(jsonfile);
    dataplayer = 
    {
        id: player, 
        ganadas: 0, 
        perdidas: 0, 
        entrada: 0
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
        fs.writeFileSync('data.json', JSON.stringify(data, null, 4) , 'utf-8');
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
            fs.writeFileSync('data.json', JSON.stringify(data, null, 4) , 'utf-8');
            break;
        }
    }
}
/**
 * 
 * @param {string} group recibe el id del grupo en formato string
 * @returns retorna true si el grupo ya esta en la lista de grupos y si no esta lo crea y retorna true
 */
function addgroup(group){
    let jsonfile = fs.readFileSync('data.json', 'utf-8');
    let data = JSON.parse(jsonfile);
    let datagroup = 
    {
        id: group,
        juegos: [{"todos": true, baneados: ["admins"]}]
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
    fs.writeFileSync('data.json', JSON.stringify(data, null, 4) , 'utf-8');
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
            fs.writeFileSync('data.json', JSON.stringify(data, null, 4) , 'utf-8');
            break;
        }
    }
    for(let games of game){
        if(data.grouplist[i].juegos[0].todos == false && !data.grouplist[i].juegos[0].baneados.includes(games)){
            data.grouplist[i].juegos[0].baneados.push(games);
            fs.writeFileSync('data.json', JSON.stringify(data, null, 4) , 'utf-8');
        }
    }   
}
/**
 * 
 * @param {string} id_group id del grupo 
 * @param {string} game nombre del juego
 * @returns retorna true si el juego no esta baneado y false si esta baneado
 */
function watchBan(id_group, game){
    let jsonfile = fs.readFileSync('data.json', 'utf-8');
    let data = JSON.parse(jsonfile);
    let i;
    for (i = 0; i < data.grouplist.length; i++) {
        if (data.grouplist[i].id === id_group) {
            if(data.grouplist[i].juegos[0].todos == true){
                return true
            }else{
                if(data.grouplist[i].juegos[0].baneados.includes(game)){
                    return false
                }else{
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
function QuitBan(id_group, game){
    let jsonfile = fs.readFileSync('data.json', 'utf-8');
    let data = JSON.parse(jsonfile);
    for (i = 0; i < data.grouplist.length; i++) {
        if (data.grouplist[i].id === id_group) {
            if(data.grouplist[i].juegos[0].todos == false){ 
                if(data.grouplist[i].juegos[0].baneados.includes(game)){
                    let index = data.grouplist[i].juegos[0].baneados.indexOf(game);
                    data.grouplist[i].juegos[0].baneados.splice(index, 1);
                    fs.writeFileSync('data.json', JSON.stringify(data, null, 4) , 'utf-8');
                    return true
                }else{
                    return false
                }
            }else{
                return false
            }
        }
    }
}
let option = {
    juego:0,
    ajustes:0
};
const menu = "*Opciones*\n\n" +"📋  menu...\n"+"👨‍👨‍👧‍👦 — !todos (solo los admins lo pueden usar).\n"+"🧟 — recomienda un anime (rnu).\n"+"🎮 — jugar.\n"+"🃏 — sticker(st) (adjunta la imagen).\n"+"📝 — ajustes(as).\n"+"👨🏻‍💻 — creador.\n\n"+"Estas son todas las opciones disponibles por el momento";
const option_game = "*Opciones*\n\n" + "1. Quitar la opción Juego\n" + "2. Quitar los Juegos con menciones\n"+ "3. Todos pueden utilizar los juegos con menciones";
const menu_game = "estos son los juegos disponibles por el momento:\n\n" + "Piedra 🪨, papel 🧻 o tiejeras ✂️(ppt)\n" + "formar pareja (fp) 👩🏻‍❤️‍💋‍👨🏻"
client.on('message', async (message) => {
    const chat = await message.getChat();
    
    /**
    * Verifica si el usuario es admin o no, no necesita parametros
    * 
    * @returns {boolean}  si el usuario es admin devuelve true si no false
    */
    function participantes(){
 
        let participantes = [];
            chat.participants.forEach((participant) => {
                participantes.push(participant);
            });  
            const sender = participantes.find(participant => participant.id._serialized === message.author);
            return sender.isAdmin;
    }

    if (message.from === "120363123428242054@g.us") { 
        if(message.body === 'hola') {
            message.reply('Bienvenid@ a Anime Fan Site');
        }    
    }
    if(message.body.toLocaleLowerCase() === '!todos') {
        if(chat.isGroup){
            if(participantes()){
                const chat = await message.getChat();
                
                let text = "";
                let mentions = [];

                for(let participant of chat.participants) {
                    mentions.push(`${participant.id.user}@c.us`);
                    text += `@${participant.id.user} `;
                }
                console.log(text);

                await chat.sendMessage(text, { mentions });
            }else{
                message.reply('Solo los administradores pueden usar este comando');
            }
        }else{
            message.reply('Este comando solo funciona en grupos');
        }
    }
    if(message.body.toLocaleLowerCase() === 'menu' || message.body.toLocaleLowerCase() === 'menú'){
    let tempMenu = menu;
    await chat.sendSeen();
    await chat.sendStateTyping();
    if(chat.isGroup){
        if(watchBan(chat.id._serialized, 'todos' === false)){
            tempMenu = tempMenu.replace('🎮 — jugar.', '');
            message.reply(tempMenu);
        }else{
            message.reply(tempMenu);
        }
    }else{
        tempMenu = tempMenu.replace('📝 — ajustes(as).\n', '');
        tempMenu = tempMenu.replace('👨‍👨‍👧‍👦 — !todos (solo los admins lo pueden usar).\n', '');
        message.reply(tempMenu);
    }
}
    if (message.body.toLocaleLowerCase() === 'recomienda un anime' || message.body.toLocaleLowerCase() === 'rnu' ) {
        file = fs.readFileSync('data.json', 'utf-8')
        data =  JSON.parse(file)
        const randomIndex = Math.floor(Math.random() * data.animes.names.length);
        message.reply(data.animes.names[randomIndex]);
    }
    if(message.body.toLocaleLowerCase() === 'jugar piedra papel o tijera' || message.body.toLocaleLowerCase() === 'ppt'){
        let contact = await message.getContact();
        await chat.sendSeen();
        await chat.sendStateTyping();
        ppt_menu =
        "Piedra 🪨, papel 🧻 o tiejeras ✂️\n\n"+
        "Usa los siguientes comandos para jugar:\n\n"+
        "ppt piedra\n"+
        "ppt papel\n"+
        "ppt tijera\n";
        if(chat.isGroup){
            if(addgroup(chat.id._serialized) && watchBan(chat.id._serialized, 'ppt') && watchBan(chat.id._serialized, 'todos')){           
                jsonread(contact.id.user);
                updateEntrada(contact.id.user, 1);
                message.reply(ppt_menu);
            }
        }else{
            jsonread(contact.id.user);
            updateEntrada(contact.id.user, 1);
            message.reply(ppt_menu);
        }
    }
    if(message.body.toLocaleLowerCase() === 'ppt piedra'){
        let contact = await message.getContact();
        await chat.sendSeen();
        await chat.sendStateTyping();
        if (getEntrada(contact.id.user) === 1){
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
        updateEntrada(contact.id.user, 0);
    }
    if(message.body.toLocaleLowerCase() === 'ppt papel'){
        let contact = await message.getContact();
        await chat.sendSeen();
        await chat.sendStateTyping();
        if (getEntrada(contact.id.user) === 1){
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
    if(message.body.toLocaleLowerCase() === 'ppt tijera'){
        await chat.sendSeen();
        await chat.sendStateTyping();
        let contact = await message.getContact();
        if (getEntrada(contact.id.user) === 1){
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
    if(message.body.toLocaleLowerCase() === 'jugar' && watchBan(chat.id._serialized, 'todos') == true){
        let tempmenu_game = menu_game;
        await chat.sendSeen();
        await chat.sendStateTyping();
        if(chat.isGroup){
            let contact = await message.getContact();
            jsonread(contact.id.user);
            addgroup(message.from);
            if(watchBan(chat.id._serialized, 'menciones') == false && watchBan(chat.id._serialized, 'todos') == true){
                tempmenu_game = tempmenu_game.replace('formar pareja (fp) 👩🏻‍❤️‍💋‍👨🏻', '');
                message.reply(tempmenu_game);
            }else{
                message.reply(tempmenu_game);   
            }
        }else{
            let contact = await message.getContact();
            jsonread(contact.id.user);
            tempmenu_game = tempmenu_game.replace('formar pareja (fp) 👩🏻‍❤️‍💋‍👨🏻', '');
            message.reply(tempmenu_game);
        }
    }
    if(message.body.toLocaleLowerCase() === 'sticker' || message.body.toLocaleLowerCase() === 'st'){
        await chat.sendSeen();
        await chat.sendStateTyping();
        if (message.hasQuotedMsg) {
            const mensaje_citado = await message.getQuotedMessage();
            if (mensaje_citado.hasMedia) {
                try {
                    if(mensaje_citado.type === 'image'){
                        const d = await mensaje_citado.downloadMedia();
                        fs.writeFileSync('sticker.png', d.data, {encoding: 'base64'});
                        const sticker = new MessageMedia('image/png', fs.readFileSync('sticker.png').toString('base64'), 'sticker');
                        chat.sendMessage(sticker, { sendMediaAsSticker: true }); 
                    }
                    else if(mensaje_citado.type === 'video'){
                        const d = await mensaje_citado.downloadMedia();
                        fs.writeFileSync('sticker.mp4', d.data, {encoding: 'base64'});
                        const sticker = new MessageMedia('video/mp4', fs.readFileSync('sticker.mp4').toString('base64'), 'sticker');
                        chat.sendMessage(sticker, { sendMediaAsSticker: true }); 
                    }
                } catch (err) {
                    message.reply('No se pudo crear el sticker');
                } 
            }
        }

        if (message.hasMedia === true) {
            try {
                if(message.type === 'image'){
                    const d = await message.downloadMedia();
                    fs.writeFileSync('sticker.png', d.data, {encoding: 'base64'});
                    const sticker = new MessageMedia('image/png', fs.readFileSync('sticker.png').toString('base64'), 'sticker');
                    chat.sendMessage(sticker, { sendMediaAsSticker: true }); 
                }
                else if(message.type === 'video'){
                    const d = await message.downloadMedia();
                    fs.writeFileSync('sticker.mp4', d.data, {encoding: 'base64'});
                    const sticker = new MessageMedia('video/mp4', fs.readFileSync('sticker.mp4').toString('base64'), 'sticker');
                    chat.sendMessage(sticker, { sendMediaAsSticker: true }); 
                }      
            } catch (err) {
                message.reply('No se pudo crear el sticker');
            }
        }
    }
    if(message.body.toLocaleLowerCase() === 'formar pareja' || message.body.toLocaleLowerCase() === 'fp'){
        if(chat.isGroup){
            if(addgroup(chat.id._serialized) && watchBan(chat.id._serialized, 'fp') && watchBan(chat.id._serialized, 'todos') && watchBan(chat.id._serialized, 'menciones')){
                if(watchBan(chat.id._serialized, 'admins') == false && participantes()){
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
                    chat.sendMessage(mensaje, { mentions: [`${pareja[0]}@c.us`, `${pareja[1]}@c.us`]});  
                }else if(watchBan(chat.id._serialized, 'admins') == true){
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
                    chat.sendMessage(mensaje, { mentions: [`${pareja[0]}@c.us`, `${pareja[1]}@c.us`]});
                }
            }
        }else{
            message.reply('Este comando solo funciona en grupos');
        }
    }
    
    if(message.body.toLocaleLowerCase() == 'ajustes' || message.body.toLocaleLowerCase() == 'as'){
        if(chat.isGroup){
            addgroup(message.from); 
            if (participantes()) {
                await chat.sendSeen();
                await chat.sendStateTyping();
                option.ajustes = 1;
                message.reply(
                "*Opciones*\n\n"+
                "Juego (j)\n"+
                "Comandos (cd)\n"+
                "Desactivar bot (db)\n"+
                "Activar bot (ab)\n\n"+
                "Este menu aun esta en desarrollo por lo que puede que no funcione correctamente")
            }
        }
        
    }
    
    else if(message.body.toLocaleLowerCase() == 'juego' || message.body.toLocaleLowerCase() == 'j'){
        if(chat.isGroup){
            if(option.ajustes == 1){
                await chat.sendSeen();
                await chat.sendStateTyping();
                if (participantes()) {
                    option.juego = 1;
                    option.ajustes = 0;
                    let menu_juego = option_game;
                    if(watchBan(chat.id._serialized, 'todos') == false){
                        menu_juego = menu_juego.replace('1. Quitar la opción Juego\n', '1. Devolver la opción Juego\n');
                        menu_juego = menu_juego.replace('2. Quitar los Juegos con menciones\n', '');
                        menu_juego = menu_juego.replace('3. Todos pueden utilizar los juegos con menciones', '');
                    }
                    if(watchBan(chat.id._serialized, 'menciones') == false){
                        menu_juego = menu_juego.replace('2. Quitar los Juegos con menciones\n', '2. Devolver los Juegos con menciones\n');
                        menu_juego = menu_juego.replace('3. Todos pueden utilizar los juegos con menciones', '');
                    }
                    if(watchBan(chat.id._serialized, 'admins') == false){
                        menu_juego = menu_juego.replace('3. Todos pueden utilizar los juegos con menciones', '3. Solo los administradores pueden utilizar los juegos con menciones');
                    }
                    message.reply(menu_juego);
                }
            }
        }
    }
    if(message.body.toLocaleLowerCase() == '1'){
        if(option.juego == 1){
            if(watchBan(chat.id._serialized, 'todos') == false){
                QuitBan(chat.id._serialized, 'todos');
                option.juego = 0;
                message.reply("Se ha devuelto la opción Juego");
            }else{
                Bangame(message.from, ['todos']);
                option.juego = 0;
                message.reply("Se ha quitado la opción Juego");
            }
        }
    }
    if(message.body.toLocaleLowerCase() == '2'){
        if(option.juego == 1){
            if(watchBan(chat.id._serialized, 'todos') == true){
                if(watchBan(chat.id._serialized, 'menciones') == true){
                    Bangame(message.from, ['menciones']);
                    option.juego = 0;
                    message.reply("Se han quitado los juegos con menciones");
                }else{
                    QuitBan(chat.id._serialized, 'menciones');
                    option.juego = 0;
                    message.reply("Se han devuelto los juegos con menciones");
                }
            }
        }
    }
    if(message.body.toLocaleLowerCase() == '3'){
        if(option.juego == 1){
            if(watchBan(chat.id._serialized, 'todos') == true){
                if(watchBan(chat.id._serialized, 'admins') == true){
                    Bangame(message.from, ['admins']);
                    option.juego = 0;
                    message.reply("Ahora solo los administradores pueden utilizar los juegos con menciones");
                }else{
                    QuitBan(chat.id._serialized, 'admins');
                    option.juego = 0;
                    message.reply("Ahora todos pueden utilizar los juegos con menciones");
                }
            }
        }
    }
    if(message.body.toLocaleLowerCase() === 'creador'|| message.body.toLocaleLowerCase() === 'como se crea un bot'){
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
    Puedes comunicarte con la socia del creador en caso de que el creador no se encuentre disponible o algún otro inconveniente:
    
    wa.me/14846507434`);
    }
});


client.initialize();
