const Database = require('./base');

class botTools extends Database{
    constructor(){
        super();
    }
    /**
     * 
     * @param {Number} numero 
     * @returns devuelve true si el bot no se encuentra y false si se encuentra
    */
    async BotIsFound(number){
        return new Promise((resolve, reject) => {
            this.ReadDb(`SELECT * FROM bots WHERE numero = ?`, [number])
            .then((rows) => {
                if(rows.length === 0){
                    resolve(true);
                }else{
                    resolve(false);
                }
            })
        })
    }
    /**
     *
     * @param {number} number
     * @param {string} name
     */
    async InsertBot(number, name){
        return new Promise((resolve, reject) => {
            this.WriteDb(`INSERT INTO bots (numero, Nombre) VALUES (?, ?)`, [number, name])
            .then(() => {
                resolve();
            })
        })
    }
    async BotsCount(){
        return new Promise((resolve, reject) => {
            this.ReadDb(`SELECT * FROM bots`)
            .then((rows) => {
                resolve(rows.length);
            })
        })
    }
    async quota(){
        return new Promise((resolve, reject) => {
            this.ReadDb(`SELECT COUNT(*) FROM bots`).then((rows) => {
                if(rows[0]['COUNT(*)'] < 6){
                    resolve(true);
                }
                resolve(false);
            })
        })
    }
    async DeleteBot(name){
        return new Promise((resolve, reject) => {
            this.WriteDb(`DELETE FROM bots WHERE numero = ?`, [name])
            .then(() => {
                this.WriteDb(`UPDATE groups SET bot_asignado = '' WHERE bot_asignado = ?`, [name])
                .then(() => {
                    resolve();
                })
            })
        })
    }
    async SearchBotPath(){
        return new Promise((resolve, reject) => {
            this.ReadDb(`SELECT numero FROM bots`)
            .then((rows) => {
                let pathrows = [];
                rows.forEach((row) => {
                    pathrows.push(row.numero);
                });
                resolve(pathrows);
            })
        })
    }
    async SeeBotCargo(number){
        return new Promise((resolve, reject) => {
            this.ReadDb(`SELECT cargo FROM bots WHERE numero = ?`, [number])
            .then((row) => {
                resolve(row.cargo);
            })
        })
    }
    async AssignBotCargo(number, cargo){
        return new Promise((resolve, reject) => {
            this.WriteDb(`UPDATE bots SET cargo = ? WHERE numero = ?`, [cargo, number])
            .then(() => {
                resolve();
            })
        })
    }
}
module.exports = new botTools();