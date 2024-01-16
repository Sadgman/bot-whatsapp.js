const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { Client, LocalAuth, MessageMedia, Poll } = require('whatsapp-web.js');
const { measureMemory } = require('vm');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/usr/bin/google-chrome-stable',
    },
    ffmpegPath: '/usr/bin/ffmpeg'

});

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
        fs.writeFileSync('data.json', JSON.stringify(data) , 'utf-8');
    }
    return encuentra;
}

function updateEntrada(player, entrada) {
    let jsonfile = fs.readFileSync('data.json', 'utf-8');
    let data = JSON.parse(jsonfile);
    for (let i = 0; i < data.players.length; i++) {
        if (data.players[i].id === player) {
            data.players[i].entrada = entrada;
            break;
        }
    }
}
function addgroup(group){
    let jsonfile = fs.readFileSync('data.json', 'utf-8');
    let data = JSON.parse(jsonfile);
    datagroup = 
    {
        id: group,
    }
    encuentra = false;
    for (let i = 0; i < data.GroupList.length; i++) {
        if (data.GroupList[i].id === group) {
            encuentra = true;
            break;
        }
    }
    if (encuentra === false) {
        data.GroupList.push(datagroup);
        fs.writeFileSync('data.json', JSON.stringify(data) , 'utf-8');
    }
}
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

client.on('message', async (message) => {
    const chat = await message.getChat();
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
        if(message.body === '!todos') {
            const chat = await message.getChat();
            
            let text = "";
            let mentions = [];
    
            for(let participant of chat.participants) {
                mentions.push(`${participant.id.user}@c.us`);
                text += `@${participant.id.user} `;
            }
            console.log(text);
            await message.reply('Mencionando a todos los participantes:');
            await chat.sendMessage(text, { mentions });
        }
        
    }
    if(message.body.toLocaleLowerCase() === '!todos') {
        if(chat.isGroup){
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
            message.reply('Este comando solo funciona en grupos');
        }
    }
    
    if(message.body.toLocaleLowerCase() === 'menu' || message.body.toLocaleLowerCase() === 'menú'){
        message.reply(`
        *Opciones*

        📋  menu...
        👨‍👨‍👧‍👦 — !todos (mencionar a todos los participantes).
        🧟 — recomienda un anime (rnu).
        🎮 — jugar.
        🃏 — sticker(st) (adjunta la imagen).
        👨🏻‍💻 — creador.

        Estas son todas las opciones disponibles por el momento
        `);
    }
    if (message.body.toLocaleLowerCase() === 'recomienda un anime' || message.body.toLocaleLowerCase() === 'rnu' ) {
        file = fs.readFileSync('data.json', 'utf-8')
        data =  JSON.parse(file)
        const randomIndex = Math.floor(Math.random() * data.animes.names.length);
        message.reply(data.animes.names[randomIndex]);
    }
    if(message.body.toLocaleLowerCase() === 'jugar piedra papel o tijera' || message.body.toLocaleLowerCase() === 'ppt'){
        let contact = await message.getContact();
        jsonread(contact.id.user);
        updateEntrada(contact.id.user, 1);
        message.reply(`Piedra 🪨, papel 🧻 o tiejeras ✂️
        
        Usa los siguientes comandos para jugar:

        ppt piedra 
        ppt papel
        ppt tijera
        `);
        
    }
    if(message.body.toLocaleLowerCase() === 'ppt piedra'){
        let contact = await message.getContact();
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
    if(message.body.toLocaleLowerCase() === 'jugar'){
        let contact = await message.getContact();
        jsonread(contact.id.user);
        message.reply(`estos son los juegos disponibles por el momento:
        Piedra 🪨, papel 🧻 o tiejeras ✂️(ppt)
        formar pareja (fp) 👩🏻‍❤️‍💋‍👨🏻 `);
    }
    if(message.body.toLocaleLowerCase() === 'sticker' || message.body.toLocaleLowerCase() === 'st'){


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
    
    if(message.body.toLocaleLowerCase() == 'ajustes' || message.body.toLocaleLowerCase() == 'as'){
        if(chat.isGroup){
            addgroup(message.from); 
            if (participantes()) {
                message.reply(`
                *Opciones*

                Juego (j)
                Comandos (cd)
                Desactivar bot (db)
                Activar bot (ab)
                `)
            }
        }
        
    }
    else if(message.body.toLocaleLowerCase() == 'juego' || message.body.toLocaleLowerCase() == 'j'){
        if(chat.isGroup){
        
            if (participantes()) {
                message.reply(`
                *Opciones*

            1. Quitar la opción Juego
            2. Quitar los Juegos con menciones
            3. Solo los admins pueden utilizar los juegos con menciones
                
            usar juego o j + el número de la opción que desea cambiar
                `)
            }
        }
    }

    if(message.body.toLocaleLowerCase() === 'creador'|| message.body.toLocaleLowerCase() === 'como se crea un bot'){
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
