const Database = require('./base');

class groupTools extends Database {

    /**
     * 
     * @param {string} group id del grupo
     * @param {string} game nombre del grupo 
     */
    addgroup(group, name = "Grupo") {
        return new Promise((resolve, reject) => {
            let jsonStruct = [
                {
                    'Juegos': [],
                    'Personas': []
                }
            ];
            jsonStruct = JSON.stringify(jsonStruct, null, 4);
            const n = `INSERT OR IGNORE INTO groups (id, Nombre, Baneados) VALUES (?, ?, ?)`;
            this.WriteDb(n, [group, name ,jsonStruct]).then(() => {resolve()}).catch((err) => {reject(err)});
        })
    }
    /**
     * 
     * @param {string} id_group id del grupo 
     * @param {string} game nombre del juego
     */
    Bangame(id_group, game){
        return new Promise((resolve, reject) => {
            this.ReadDb(`SELECT Baneados FROM groups WHERE id = ?`, [id_group])
            .then((rows) => {
                let baneados = JSON.parse(rows[0].Baneados);
                let baneadosg = baneados[0].Juegos
                if(baneadosg.includes(game)){
                    resolve();
                    return;
                }
            
                baneadosg.push(game);
                baneados[0].Juegos = baneadosg;
            

                const query = `UPDATE groups SET Baneados = ? WHERE id = ?`;
                this.WriteDb(query, [JSON.stringify(baneados, null, 4), id_group]).then(() => {resolve()}).catch((err) => {reject(err)});
            }).catch((err) => {reject(err)});
        });
    }
    /**
     * 
     * @param {string} id_group id del grupo
     * @param {string} game juego a ver 
     * @returns retorna true si el juego no esta baneado y false si esta baneado
     */
    watchBan(id_group, game){
        return new Promise((resolve, reject) => {
            this.ReadDb(`SELECT Baneados FROM groups WHERE id = ?`, [id_group])
            .then((rows) => {
                let baneados = JSON.parse(rows[0].Baneados);
                let baneadosg = baneados[0].Juegos
                if(baneadosg.includes(game)){
                    resolve(false);
                    return;
                }
                resolve(true);
            }).catch((err) => {reject(err)});
        });
    }
    /**
     * 
     * @param {string} id_group el id del grupo 
     * @param {string} game el juego que se quiere quitar de la lista de baneados
     * @returns retorna true si se pudo quitar el juego de la lista de baneados, false si no se pudo
     */
    QuitBan(id_group, game){
        return new Promise((resolve, reject) => {
            this.ReadDb(`SELECT Baneados FROM groups WHERE id = ?`, [id_group])
            .then((rows) => {
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
                this.WriteDb(query, [JSON.stringify(baneados, null, 4), id_group]).then(() => {resolve()}).catch((err) => {reject(err)});
            }).catch((err) => {reject(err)});
        });
    }
    /**
     * 
     * @param {string} id_group id del grupo
     * @param {boolean} view ver si esta activado o desactivado el modo admin
     * @returns retorna el estado de si esta activado o desactivado el modo admin
     **/
    ToogleModoAdmin(id_group, view){
        return new Promise((resolve, reject) => {
            this.ReadDb(`SELECT modo_admin FROM groups WHERE id = ?`, [id_group])
            .then((rows) => {
                let modo_admin = rows[0].modo_admin;
                if(view){
                    resolve(modo_admin);
                    return;
                }
                modo_admin = !modo_admin;
                const query = `UPDATE groups SET modo_admin = ? WHERE id = ?`;
                this.WriteDb(query, [modo_admin, id_group]).then(() => {resolve(modo_admin)}).catch((err) => {reject(err)});
            }).catch((err) => {reject(err)});
        });
    }
        
    /**
     * 
     * @param {string} id_group id del grupo
     * @param {string} ban nombre del juego o opcion a banear
     */
    Ban(id_group, ban){
        return new Promise((resolve, reject) => {
            this.watchBan(id_group, ban) ? this.Bangame(id_group, ban) : this.QuitBan(id_group, ban);
            resolve();
        })
    }
    /**
     * Desactiva o activa el bot si esta desactivado o activado en el grupo
     * @param {string} id_group id del grupo 
     */
    bot_off_on(id_group) {
        return new Promise((resolve, reject) => {
            this.ReadDb(`SELECT bot FROM groups WHERE id = ?`, [id_group])
            .then((rows) => {
                if (!rows[0]) {
                    const error = new Error(`No se encontró el grupo con id ${id_group}`);
                    reject(error);
                    return;
                }
                let bot = rows[0].bot;
                bot = !bot;
                const query = `UPDATE groups SET bot = ? WHERE id = ?`;
                this.WriteDb(query, [bot, id_group]).then(() => {resolve()}).catch((err) => {reject(err)});
            }).catch((err) => {reject(err)});
        });
    }
    /**
     * 
     * @param {string} id_group id del grupo
     * 
     * revisa y devuelve true si el bot esta activado y false si esta desactivado
     */
    watchBot(id_group) {
        return new Promise((resolve, reject) => {
            this.ReadDb(`SELECT bot FROM groups WHERE id = ?`, [id_group])
            .then((rows) => {resolve(rows[0].bot)}).catch((err) => {reject(err)});
        });
    }
    /**
     * 
     * @param {number} numero id del bot
     * @param {string} id_group id del grupo
     * @returns 
     */
    asignarBot(numero, id_group){
        return new Promise((resolve, reject) => {
            this.WriteDb(`UPDATE groups SET bot_asignado = ? WHERE id = ?`, [numero, id_group])
            .then(() => {resolve()}).catch((err) => {reject(err)});
        });
    }
    removerAsignacionBot(nombre){
        return new Promise((resolve, reject) => {
            this.WriteDb(`UPDATE groups SET bot_asignado = '' WHERE id = ?`, [nombre])
            .then(() => {resolve()}).catch((err) => {reject(err)});
        });
    }
    /**
     * 
     * @param {Text} id id del grupo
     * @param {number} nombre id del bot
     * @returns si el bot esta asignado retorna true si no esta asignado retorna false y si no hay bot asignado retorna 'no asignado'
     */
    esBotAsignado(id, nombre) {
        return new Promise((resolve, reject) => {
            this.ReadDb(`SELECT bot_asignado FROM groups WHERE id = ?`, [id])
            .then((row) => {
                if (row.bot_asignado === '' || row.bot_asignado === null){ 
                    resolve('no asignado');
                }else if(row.bot_asignado !== nombre){
                    resolve(true);
                }else {
                    resolve(false);
                }
            }).catch((err) => {reject(err)});
        });
    }
    verAsignadoBot(id_group) {
        return new Promise((resolve, reject) => {
            this.ReadDb(`SELECT bot_asignado FROM groups WHERE id = ?`, [id_group])
            .then((row) => {resolve(row.bot_asignado)}).catch((err) => {reject(err)});
        });
    }
    /**
     * @param {string} id_group id del grupo
     * @param {boolean} view ver si esta activado o desactivado el mensaje de bienvenida
     * @returns retorna el estado de si esta activado o desactivado el mensaje de bienvenida
     */
    toggleWelcome(id_group, view){
        return new Promise((resolve, reject) => {
            this.ReadDb(`SELECT welcome FROM groups WHERE id = ?`, [id_group])
            .then((rows) => {
                let welcome = rows[0].welcome;
                if(view){
                    resolve(welcome);
                    return;
                }
                welcome = !welcome;
                const query = `UPDATE groups SET welcome = ? WHERE id = ?`;
                this.WriteDb(query, [welcome, id_group]).then(() => {resolve(welcome)}).catch((err) => {reject(err)});
            }).catch((err) => {reject(err)});
        });
    }   
}

module.exports = new groupTools();