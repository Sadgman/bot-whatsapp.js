const {db} = require('./base');
/**
 * @param {string} group id del grupo
 * @param {string} game nombre del grupo 
 */
function addgroup(group, name) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT * FROM groups WHERE id = ?`, [group], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (rows.length > 0) {
                    resolve();
                    return;
                }
                let jsonStruct = [
                    {
                        'Juegos': [],
                        'Personas': []
                    }
                ];
                jsonStruct = JSON.stringify(jsonStruct, null, 4);
                const n = `INSERT INTO groups (id, Nombre, modo_admin, bot, activeQuest ,correctAnswer, title_quest, Baneados) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                db.run(n, [group, name, false, true , false, '', '', jsonStruct], (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        });
    });
}
/**
 * 
 * @param {string} id_group id del grupo 
 * @param {string} game nombre del juego
 */
async function Bangame(id_group, game){
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT Baneados FROM groups WHERE id = ?`, [id_group], (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                let baneados = JSON.parse(rows[0].Baneados);
                let baneadosg = baneados[0].Juegos
                if(baneadosg.includes(game)){
                    resolve();
                    return;
                }
            
                baneadosg.push(game);
                baneados[0].Juegos = baneadosg;
            

                const query = `UPDATE groups SET Baneados = ? WHERE id = ?`;
                db.run(query, [JSON.stringify(baneados, null, 4), id_group], (err) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    console.log('Juego baneado');
                    resolve();
                });
            });
        });
    });
}
/**
 * 
 * @param {string} id_group id del grupo
 * @param {string} game juego a ver 
 * @returns retorna true si el juego no esta baneado y false si esta baneado
 */
async function watchBan(id_group, game){
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT Baneados FROM groups WHERE id = ?`, [id_group], (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                let baneados = JSON.parse(rows[0].Baneados);
                let baneadosg = baneados[0].Juegos
                if(baneadosg.includes(game)){
                    resolve(false);
                    return;
                }
                resolve(true);
            });
        });
    });
}
/**
 * 
 * @param {string} id_group el id del grupo 
 * @param {string} game el juego que se quiere quitar de la lista de baneados
 * @returns retorna true si se pudo quitar el juego de la lista de baneados, false si no se pudo
 */
async function QuitBan(id_group, game){
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT Baneados FROM groups WHERE id = ?`, [id_group], (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                let baneados = JSON.parse(rows[0].Baneados);
                let baneadosg = baneados[0].Juegos
                if(!baneadosg.includes(game)){
                    resolve();
                    return;
                }
                let index = baneadosg.indexOf(game);
                baneadosg.splice(index, 1);
                baneados[0].Juegos = baneadosg;

                const query = `UPDATE groups SET Baneados = ? WHERE id = ?`;
                db.run(query, [JSON.stringify(baneados, null, 4), id_group], (err) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    resolve();
                });
            });
        });
    });
}
/**
 * 
 * @param {string} id_group id del grupo 
 * 
 * Desactiva o activa el bot si esta desactivado o activado en el grupo
 */
async function bot_off_on(id_group){
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT bot FROM groups WHERE id = ?`, [id_group], (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                let bot = rows[0].bot;
                bot = !bot;
                const query = `UPDATE groups SET bot = ? WHERE id = ?`;
                db.run(query, [bot, id_group], (err) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }
                    resolve();
                });
            });
        });
    });
}
/**
 * 
 * @param {string} id_group id del grupo
 * 
 * revisa y devuelve true si el bot esta activado y false si esta desactivado
 */
async function watchBot(id_group) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT bot FROM groups WHERE id = ?`, [id_group], (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                }
                resolve(rows[0].bot);
            });
        });
    });
}
/**
 * @param {number} option si es 1 retorna el estado de la pregunta si es 2 activa o desactiva la pregunta si es 3 pone el indice de respuesta correcta, si es 4 retorna el indice de la respuesta correcta si es 5 retorna el indice de la pregunta si es 6 pone el indice de la pregunta si es 7 retorna el titulo de la pregunta si es 8 pone el titulo de la pregunta
 * @param {*} value valor a cambiar
 * @param {string} id_group el id del grupo
 * @returns retorna true si la pregunta esta activa y false si no lo esta 
*/
async function groupActiveQuestions(option, id_group, value) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT * FROM groups WHERE id = ?`, [id_group], (err, rows) => {
                if(err){
                    reject(err);
                    return;
                }
                switch(option){
                    case 1:
                        resolve(rows[0].activeQuest);
                        break;
                    case 2:
                        rows[0].activeQuest = value;
                        break;
                    case 3:
                        rows[0].correctAnswer = value;
                        break;
                    case 4:
                        resolve(rows[0].correctAnswer);
                        break;
                    case 5:
                        resolve(rows[0].index_p);
                        break;
                    case 6:
                        rows[0].index_p = value;
                        break;
                    case 7:
                        resolve(rows[0].title_quest);
                        break;
                    case 8:
                        rows[0].title_quest = value;
                        break;
                    default:
                        reject('Opcion no valida');
                        break;
                }
                const query = `UPDATE groups SET activeQuest = ?, correctAnswer = ?, title_quest = ?, index_p = ? WHERE id = ?`;
                db.run(query, [rows[0].activeQuest, rows[0].correctAnswer, rows[0].title_quest, rows[0].index_p, id_group], (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(rows[0].activeQuest);
                });
            })
        });
    });
}
async function asignarBot(numero, nombre){
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`UPDATE groups SET bot_asignado = ? WHERE id = ?`, [numero, nombre], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    });
}
async function removerAsignacionBot(nombre){
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`UPDATE groups SET bot_asignado = '' WHERE id = ?`, [nombre], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    });
}
/**
 * 
 * @param {Text} id id del grupo
 * @param {number} nombre id del bot
 * @returns si el bot esta asignado retorna true si no esta asignado retorna false y si no hay bot asignado retorna 'no asignado'
 */
async function esBotAsignado(id, nombre) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.get(`SELECT bot_asignado FROM groups WHERE id = ?`, [id], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (row.bot_asignado === '' || row.bot_asignado === null){ 
                    resolve('no asignado');
                }else if(row.bot_asignado !== nombre){
                    resolve(true);
                }else {
                    resolve(false);
                }
            });
        });
    });
}
module.exports = {
    addgroup,
    Bangame,
    watchBan,
    QuitBan,
    watchBot,
    groupActiveQuestions,
    asignarBot,
    removerAsignacionBot,
    esBotAsignado,
    bot_off_on
}