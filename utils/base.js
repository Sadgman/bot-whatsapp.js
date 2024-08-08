const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('/home/sadgman/data.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
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