const fs = require('fs');

/** 
 * @param {string} animal nombre del animal
 * @returns devuelve true si el animal ya existe en el archivo data.json, false si no existe
*/
function addAnimal(id_player ,name){
    // Esta función modifica el archivo data.json para agregar un nuevo animal al jugador siguiendo la siguiente estructura:
    /* {
        animales: {
            "nombre": "",
            "tipo": "",
            "cansancio": 0,
            "hambre": 0,
            "felicidad": 0,
            "salud": 0,
        }
    }; */
    // solo se modifica la propiedad animales, se agrega un nuevo objeto con los valores por defecto
    let playerRead = fs.readFileSync('data.json', 'utf-8');
    let data = JSON.parse(playerRead);

    animal = {
        "nombre": name,
        "tipo": name,
        "cansancio": 0,
        "hambre": 0,
        "felicidad": 0,
        "salud": 0,
    };
    // Se busca si el jugador ya tiene el animal 
    let found = false;
    for (let i = 0; i < data.players.length; i++) {
        if (data.players[i].id === id_player) {
            for (let j = 0; j < data.players[i].animales.length; j++) {
                if (data.players[i].animales[j].nombre === name) {
                    found = true;
                    return found;
                }
            }
            if (found === false) {
                data.players[i].animales.push(animal);
                fs.writeFileSync('data.json', JSON.stringify(data, null, 4), 'utf-8');
                return found;
            }
            break;
        }
    }   
}

function modifyAnimalsParameters(player_id, animal_name, parameter, value, option){
    // Esta función modifica los parámetros de los animales del jugador, se puede modificar el cansancio, hambre, felicidad y salud dependiendo de option
    // option = 0 -> cansancio
    // option = 1 -> hambre
    // option = 2 -> felicidad
    // option = 3 -> salud
    // tomando en cuenta que el animal ya existe
    let playerRead = fs.readFileSync('data.json', 'utf-8');
    let data = JSON.parse(playerRead);
    for (let i = 0; i < data.players.length; i++) {
        if (data.players[i].id === player_id) {
            for (let j = 0; j < data.players[i].animales.length; j++) {
                if (data.players[i].animales[j].nombre === animal_name) {
                    switch (option) {
                        case 0:
                            data.players[i].animales[j].cansancio = value;
                            break;
                        case 1:
                            data.players[i].animales[j].hambre = value;
                            break;
                        case 2:
                            data.players[i].animales[j].felicidad = value;
                            break;
                        case 3:
                            data.players[i].animales[j].salud = value;
                            break;
                        default:
                            break;
                    }
                    fs.writeFileSync('data.json', JSON.stringify(data, null, 4), 'utf-8');
                    break;
                }
            }
            break;
        }
    }
}

function getAnimalParameters(player_id, animal_name){
    // Esta función devuelve los parámetros de un animal en específico
    let playerRead = fs.readFileSync('data.json', 'utf-8');
    let data = JSON.parse(playerRead);
    for (let i = 0; i < data.players.length; i++) {
        if (data.players[i].id === player_id) {
            for (let j = 0; j < data.players[i].animales.length; j++) {
                if (data.players[i].animales[j].nombre === animal_name) {
                    return data.players[i].animales[j];
                }
            }
            break;
        }
    }
}
function getAnimals(player_id){
    // Esta función devuelve todos los animales que tiene el jugador
    let playerRead = fs.readFileSync('data.json', 'utf-8');
    let data = JSON.parse(playerRead);
    for (let i = 0; i < data.players.length; i++) {
        if (data.players[i].id === player_id) {
            return data.players[i].animales;
        }
    }
}
function deleteAnimal(player_id, animal_name){
    // Esta función elimina un animal del jugador
    let playerRead = fs.readFileSync('data.json', 'utf-8');
    let data = JSON.parse(playerRead);
    for (let i = 0; i < data.players.length; i++) {
        if (data.players[i].id === player_id) {
            for (let j = 0; j < data.players[i].animales.length; j++) {
                if (data.players[i].animales[j].nombre === animal_name) {
                    data.players[i].animales.splice(j, 1);
                    fs.writeFileSync('data.json', JSON.stringify(data, null, 4), 'utf-8');
                    break;
                }
            }
            break;
        }
    }
}
function animalExist(player_id ,animal_name){
    // Esta función verifica si el animal ya existe en el jugador
    let playerRead = fs.readFileSync('data.json', 'utf-8');
    let data = JSON.parse(playerRead);
    for (let i = 0; i < data.players.length; i++) {
        if (data.players[i].id === player_id) {
            for (let j = 0; j < data.players[i].animales.length; j++) {
                if (data.players[i].animales[j].nombre === animal_name) {
                    return true;
                }
            }
            break;
        }
    }
    return false;
}

module.exports = {
    addAnimal,
    modifyAnimalsParameters,
    getAnimalParameters,
    getAnimals,
    deleteAnimal,
    animalExist
}