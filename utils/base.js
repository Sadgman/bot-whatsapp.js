const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const pathBase = JSON.parse(fs.readFileSync('config.json'))[0].pathB;

class Database {
    constructor() {
        this.db = new sqlite3.Database(pathBase, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
    }
    ReadDb(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    }
    WriteDb(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(query, params, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    CloseDb() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
}

module.exports = Database;