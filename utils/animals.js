const {db} = require('./base');

/** 
 * @param {string} id_player id del jugador
 * @param {string} tipo tipo de animal
 * @param {string} name nombre del animal
*/
function addAnimal(id_player, tipo, name){
    /* [
        {
        tipo: {
            "nombre": "",
            "cansado": 0,
            "hambre": 0,
            "salud": 3,
            "felicidad": 100,
            }
        ]
    }; */
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT Animales FROM players WHERE id = ?`, [id_player], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                let animals;
                try {
                    animals = rows[0].Animales ? JSON.parse(rows[0].Animales) : {};
                } catch (parseError) {
                    animals = {};
                }
                if(animals[tipo] === undefined){
                    animals[tipo] = []
                }
                animals[tipo].forEach((animal) => {
                    if(animal.nombre === name){
                        reject('Ya tienes un animal con ese nombre');
                        return;
                    }
                })
                animals[tipo].push({
                    "nombre": name,
                    "cansado": 0,
                    "hambre": 0,
                    "salud": 3,
                    "felicidad": 100
                })
            
                const query = `UPDATE players SET Animales = ? WHERE id = ?`;
                db.run(query, [JSON.stringify(animals, null, 4), id_player], (err) => {
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
 * @param {string} player_id 
 * @param {string} type_return 
 * @param {string} name_animal 
 * @returns 
 * [{ nombre: 'gato', tipo: 'gato' }] 
retorna un array con todos los nombres de los animales y el tipo.
Si es all retorna un objeto con todos los datos del animal

 */
function getAnimals(player_id, type_return, name_animal){
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT Animales FROM players WHERE id = ?`, [player_id], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                let animals = rows[0].Animales ? JSON.parse(rows[0].Animales) : reject('No tienes animales');
                if(type_return === 'names'){
                    let allAnimalsnames = [];
                    let typesAnimals = [];
                    for(const type in animals){
                        if(animals.hasOwnProperty(type)){
                            animals[type].forEach((animal) => {
                                allAnimalsnames.push({nombre: animal.nombre, tipo: type});
                            })
                        }
                    }
                    resolve(allAnimalsnames, typesAnimals);
                }else if(type_return === 'all'){
                    for(const animal in animals){
                        if(animals.hasOwnProperty(animal)){
                            animals[animal].forEach((element) => {
                                if(element.nombre === name_animal){
                                    resolve(element);
                                }
                            })
                        }
                    }
                }
            });
        });
    });
}

/**
 * 
 * @param {string} player_id id del jugador
 * @param {string} name nombre del animal
 * @param {string} parameter parametro a modificar
 * @param {*} value valor a modificar
 * @returns retorna una promesa
 */
function modifyAnimalsParameters(player_id ,name, parameter, value){
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT Animales FROM players WHERE id = ?`, [player_id], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                let animals;
                try {
                    animals = rows[0].Animales ? JSON.parse(rows[0].Animales) : {};
                } catch (parseError) {
                    reject(parseError);
                }
         
                for(const type in animals){
                if(animals.hasOwnProperty(type)){
                    animals[type].forEach((elemet) => {
                        if(elemet.nombre === name){
                            elemet[parameter] = value;
                            const query = `UPDATE players SET Animales = ? WHERE id = ?`;
                            db.run(query, [JSON.stringify(animals, null, 4), player_id], (err) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }
                                resolve();
                            });
                        }
                    })
                }
                }
            });
        });
    });
}
function deleteAnimal(player_id, animal_name){
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(`SELECT Animales FROM players WHERE id = ?`, [player_id], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                let animals;
                try {
                    animals = rows[0].Animales ? JSON.parse(rows[0].Animales) : {};
                } catch (parseError) {
                    reject(parseError);
                }
                for(const type in animals){
                    if(animals.hasOwnProperty(type)){
                        animals[type].forEach((animal, index) => {
                            if(animal.nombre === animal_name){
                                animals[type].splice(index, 1);
                                const query = `UPDATE players SET Animales = ? WHERE id = ?`;
                                db.run(query, [JSON.stringify(animals, null, 4), player_id], (err) => {
                                    if (err) {
                                        reject(err);
                                        return;
                                    }
                                    resolve();
                                });
                            }
                        })
                    }
                }
            });
        });
    });
}

module.exports = {
    addAnimal,
    modifyAnimalsParameters,
    getAnimals,
    deleteAnimal
}