const Database  = require('./base');

class playerUtils extends Database {
    constructor(){
        super();
    }
    /**
     *
     * @param {number} player
     * @param {number} dias
     * @param {number} opcion
     */
    async update_dias(player, dias, opcion) {
        try {
            if (opcion === 1) {
                await this.update_info_player(player, "dias", dias, true);
            } else if (opcion === 2) {
                if (await this.getAllInfoPlayer(player).dias !== dias) {
                    return false;
                } else {
                    return true;
                }
            }
        } catch (err) {
            console.error(err);
            return null;
        }
    }
    async getAllInfoPlayer(id) {
        return new Promise((resolve, reject) => {
            this.ReadDb(`SELECT * FROM players WHERE id = ?`, [id])
            .then(async (rows) => {
                rows[0].Casado = (await dr.ReadDb(`SELECT pareja FROM casados WHERE id = ${id}`)).pareja;
                resolve(rows[0]);
            }).catch((err) => {reject(err)});
        });
    }
    /**
     * va a actualizar la informacion de un jugador
     * @param {id del jugador} player
     * @param {tipo de informacion a actualizar} type
     * @param {valor a actualizar} value
     * @param {si es un array} isArray
    */
    async update_info_player(player, type, value, isArray) {
        return new Promise((resolve, reject) => {
            if(type === "Casado"){
                this.WriteDb(`UPDATE casados SET pareja = ? WHERE id = ?`, [value, player])
                .then(() => {resolve()}).catch((err) => {reject(err)});
                return;
            }
            this.ReadDb(`SELECT * FROM players WHERE id = ?`, [player])
            .then((rows) => {
                let player = rows[0];
                if (Array.isArray(player[type])) {
                    isArray ? player[type] = value : player[type].push(value);
                } else {
                    player[type] = value;
                }
    
                const query = `UPDATE players SET ${type} = ? WHERE id = ?`;
                this.WriteDb(query, [player[type], player.id])
                .then(() => {resolve(player)}).catch((err) => {reject(err)});
            }).catch((err) => {reject(err)});
        })
    }
    /**
     * 
     * @param {id del jugador} player 
     * @param {grupo del jugador} grupo
     */
    async jsonread(player, grupo) {
        return new Promise((resolve, reject) => {
            this.WriteDb(`INSERT OR IGNORE INTO players (id) VALUES (${player}); 
                INSERT OR IGNORE INTO casados (id) VALUES (${player}); 
                INSERT OR IGNORE INTO estadisticas(id) VALUES (${player}) `)
            .then(() => {resolve(true)}).catch((err) => {reject(err)});
        });
    }
    async topPlayersWithMostMoney() {
        return new Promise((resolve, reject) => {
            this.ReadDb(`SELECT id, Banco + Dinero as total FROM players ORDER BY total DESC LIMIT 5`)
            .then((rows) => {resolve(rows.map(row => row.id))}).catch((err) => {reject(err)});
        });
    }
    async moneyTopPlayers() {
        return new Promise((resolve, reject) => {
            this.ReadDb(`SELECT Banco + Dinero as total FROM players ORDER BY total DESC LIMIT 5`)
            .then((rows) => {resolve(rows.map(row => row.total))}).catch((err) => {reject(err)});
        });
    }
    async topPlayersWithMostLevel() {
        return new Promise((resolve, reject) => {
            this.ReadDb(`SELECT id FROM players ORDER BY Nivel DESC LIMIT 5`)
            .then((rows) => {resolve(rows.map(row => row.id))}).catch((err) => {reject(err)});
        });
    }
    async levelTopPlayers() {
        return new Promise((resolve, reject) => {
            this.ReadDb(`SELECT Nivel FROM players ORDER BY Nivel DESC LIMIT 5`)
            .then((rows) => {resolve(rows.map(row => row.Nivel))}).catch((err) => {reject(err)});
        });
    }
    async topUsersMessages() {
        return new Promise((resolve, reject) => {
            this.ReadDb(`SELECT id FROM players WHERE id not in (SELECT numero FROM bots) order by Mensajes desc limit 5;`)
            .then((rows) => {resolve(rows.map(row => row.id))}).catch((err) => {reject(err)});
        });
    }
    async messageUsers() {
        return new Promise((resolve, reject) => {
            this.ReadDb(`SELECT Mensajes FROM players WHERE id not in (SELECT numero FROM bots) order by Mensajes desc limit 5;`)
            .then((rows) => {resolve(rows.map(row => row.Mensajes))}).catch((err) => {reject(err)});
        });
    }
    
}

module.exports = new playerUtils();