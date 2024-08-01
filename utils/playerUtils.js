const fs = require('fs');
const directory = './data.json'
/**
 * 
 * @param {number} player id del jugador 
 * @returns devuelve true si el jugador ya existe en el archivo data.json, false si no existe
 */
function jsonread(player) {
    let jsonfile = fs.readFileSync(directory, 'utf-8');
    let data = JSON.parse(jsonfile);
    dataplayer =
    {
        id: player,
        casado: "nadie :(",
        dias: 0,
        nivel: 0,
        ganadas: 0,
        dinero: 0,
        mensajes: 0,
        banco: 0,
        roles: "vagabundo",
        animales: [
            {
                "nombre": "",
                "tipo": "",
                "cansancio": 0,
                "hambre": 0,
                "felicidad": 100,
                "salud": 100,
            }
        ],
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
        fs.writeFileSync(directory, JSON.stringify(data, null, 4), 'utf-8');
    }
    return encuentra;
}
/**
 * @param {id} player el id del jugador
 * @param {string} type el tipo de dato que se quiere actualizar
 * @param {string} value el valor que se quiere agregar
 * @param {boolean} rem si es true se reemplaza el valor si es false se agrega al array
 *   
 */
function update_info_player(player, type, value, rem) {
    try {
        let jsonfile = fs.readFileSync(directory, 'utf-8');
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
        fs.writeFileSync(directory, JSON.stringify(data, null, 2));
    } catch (err) {
        console.log(err);
        return null;
    }
}
/**
 * 
 * @param {number} player id del jugador 
 * @returns devuelve toda la información del jugador
 */
function getAllInfoPlayer(player) {
    try {
        let jsonfile = fs.readFileSync(directory, 'utf-8');
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
/**
 * 
 * @param {number} player id del jugador
 * @param {number} dias el dia actual
 * @param {number} opcion si es 1 se actualiza el valor por el de dias, si es 2 se compara el valor con el valor en el json
 * @returns 
 */
function update_dias(player ,dias, opcion) {
    try {
        if(opcion === 1){    
            update_info_player(player, "dias", dias, true);
        }else if(opcion === 2){
            if(getAllInfoPlayer(player).dias !== dias){
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
function topPlayersWithMostMoney() {
    let jsonfile = fs.readFileSync(directory, 'utf-8');
    let json = JSON.parse(jsonfile);
    let top = [];
    let sortedPlayers = json.players.sort((a, b) => b.banco - a.banco);
    for (let i = 0; i < 5; i++) {
        top.push(sortedPlayers[i].id);
    }
    return top;
}
function moneyTopPlayers(){
    let jsonfile = fs.readFileSync(directory, 'utf-8');
    let json = JSON.parse(jsonfile);
    let top = [];
    let sortedPlayers = json.players.sort((a, b) => b.banco - a.banco);
    for (let i = 0; i < 5; i++) {
        top.push(sortedPlayers[i].banco);
    }
    return top;
}
function topPlayersWithMostLevel(){
    let jsonfile = fs.readFileSync(directory, 'utf-8');
    let json = JSON.parse(jsonfile);
    let top = [];
    let sortedPlayers = json.players.sort((a, b) => b.nivel - a.nivel);
    for (let i = 0; i < 5; i++) {
        top.push(sortedPlayers[i].id);
    }
    return top;

}
function levelTopPlayers(){
    let jsonfile = fs.readFileSync(directory, 'utf-8');
    let json = JSON.parse(jsonfile);
    let top = [];
    let sortedPlayers = json.players.sort((a, b) => b.nivel - a.nivel);
    for (let i = 0; i < 5; i++) {
        top.push(sortedPlayers[i].nivel);
    }
    return top;
}
function topUsersMessages(){
    let jsonfile = fs.readFileSync(directory, 'utf-8');
    let json = JSON.parse(jsonfile);
    let top = [];
    let sortedPlayers = json.players.sort((a, b) => b.mensajes - a.mensajes);
    for (let i = 0; i < 5; i++) {
        top.push(sortedPlayers[i].id);
    }
    return top;
}
function messageUsers(){
    let jsonfile = fs.readFileSync(directory, 'utf-8');
    let json = JSON.parse(jsonfile);
    let top = [];
    let sortedPlayers = json.players.sort((a, b) => b.mensajes - a.mensajes);
    for (let i = 0; i < 5; i++) {
        top.push(sortedPlayers[i].mensajes);
    }
    return top;
}
module.exports = {
    jsonread,
    update_info_player,
    getAllInfoPlayer,
    update_dias,
    topPlayersWithMostMoney,
    moneyTopPlayers,
    topPlayersWithMostLevel,
    levelTopPlayers,
    topUsersMessages,
    messageUsers
};