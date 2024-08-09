const fs = require('fs');
const {db} = require('./base');

async function update_dias(player, dias, opcion) {
    try {
        if (opcion === 1) {
            await update_info_player(player, "dias", dias, true);
        } else if (opcion === 2) {
            if (await getAllInfoPlayer(player).dias !== dias) {
                return false;
            } else {
                return true;
            }
        }
    } catch (err) {
        console.log(err);
        return null;
    }
}

function getAllInfoPlayer(id) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT * FROM players WHERE id = ?`, [id], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows[0]);
            });
        });
    });
}

async function update_info_player(player, type, value, rem) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT * FROM players WHERE id = ?`, [player], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (rows.length === 0) {
                    reject('No existe el jugador');
                    return;
                }
                let player = rows[0];
                rem ? player[type] = value : player[type].push(value);

                const query = `UPDATE players SET ${type} = ? WHERE id = ?`;
                db.run(query, [player[type], player.id], (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(player);
                });
            });
        });
    });
}

async function jsonread(player) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT * FROM players WHERE id = ?`, [player], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (!rows.length > 0) {
                    const n = `INSERT INTO players (id, Nombre, Casado, Rool, Puntos, Nivel, Dinero, Banco, Mensajes, Objetos, Animales) VALUES (?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?)`;
                    db.run(n, [player, '', 'nadie :(', 'Vagabundo', 0, 0, 0, 0, 0, '{}', '{}'], (err) => {
                        if (err) {
                            return console.log(err.message);
                        }
                    });
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    });
}

async function topPlayersWithMostMoney() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT id, Banco + Dinero as total FROM players ORDER BY total DESC LIMIT 5`, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows.map(row => row.id));
            });
        });
    });
}

async function moneyTopPlayers() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT Banco + Dinero as total FROM players ORDER BY total DESC LIMIT 5`, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows.map(row => row.total));
            });
        });
    });
}

async function topPlayersWithMostLevel() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT id FROM players ORDER BY Nivel DESC LIMIT 5`, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows.map(row => row.id));
            });
        });
    });
}

async function levelTopPlayers() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT Nivel FROM players ORDER BY Nivel DESC LIMIT 5`, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows.map(row => row.Nivel));
            });
        });
    });
}

async function topUsersMessages() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT id FROM players ORDER BY Mensajes DESC LIMIT 5`, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows.map(row => row.id));
            });
        });
    });
}

async function messageUsers() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT Mensajes FROM players ORDER BY Mensajes DESC LIMIT 5`, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows.map(row => row.Mensajes));
            });
        });
    });
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
