const { db } = require('./base');
/**
 * 
 * @param {Number} numero 
 * @returns 
 */
async function encontrarBot(numero){
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT * FROM bots WHERE numero = ?`, [numero], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (rows.length === 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    });
}
/** 
 * @param {number} numero
 * @param {string} nombre
*/
async function insertarBot(numero, nombre){
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`INSERT INTO bots (numero, Nombre) VALUES (?, ?)`, [numero, nombre], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    });
}
async function cantidadBots(){
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT * FROM bots`, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows.length);
            });
        });
    });
}
async function eliminarBot(){
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`DELETE FROM bots WHERE numero = ?`, [numero], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    })
}
module.exports = {
    encontrarBot,
    insertarBot,
    cantidadBots,
    eliminarBot
}