const { db } = require('./base');
/**
 * 
 * @param {Number} numero 
 * @returns devuelve true si el bot no esta asignado y false si esta asignado
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
//SELECT Mensajes FROM players WHERE id not in (SELECT numero FROM bots) order by Mensajes desc limit 5;
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
/**
 * 
 * @param {string} nombre 
 */
async function eliminarBot(nombre){
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`DELETE FROM bots WHERE numero = ?`, [nombre], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
            });
            db.run(`UPDATE groups SET bot_asignado = '' WHERE bot_asignado = ?`, [nombre], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    })
}
async function searchPathbots(){
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT numero FROM bots`, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                let pathrows = [];
                rows.forEach((row) => {
                    pathrows.push(row.numero);
                });
                resolve(pathrows);
            });
        });
    });
}
async function vercargoBot(numero){
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.get(`SELECT cargo FROM bots WHERE numero = ?`, [numero], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row.cargo);
            });
        });
    });
}
async function asignarCargoBot(numero, cargo){
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`UPDATE bots SET cargo = ? WHERE numero = ?`, [cargo, numero], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    });
}
module.exports = {
    encontrarBot,
    insertarBot,
    cantidadBots,
    eliminarBot,
    searchPathbots,
    vercargoBot,
    asignarCargoBot
}