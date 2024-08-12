const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const pathBase = JSON.parse(fs.readFileSync('config.json'))[0].pathB;

let db = new sqlite3.Database(pathBase, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(err.message);
    }
});
function cerrarBase() {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
module.exports = {
    db,
    cerrarBase
};