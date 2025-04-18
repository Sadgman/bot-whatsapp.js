const Database = require('./base');

class Games extends Database {
    async readRandomAnime(){
        return new Promise((resolve, reject) => {
            this.ReadDb(`SELECT * FROM anime ORDER BY RANDOM() LIMIT 1`)
            .then((rows) => {
                rows = rows[0];
                resolve("*Nombre:* " + rows.name + "\n*Genero:* " + rows.genre + "\n*Año:* " + rows.year );
            }).catch((err) => {reject(err)});
        })
    }
    /**
     * @param {number} option si es 1 retorna el estado de la pregunta si es 2 activa o desactiva la pregunta si es 3 pone el indice de respuesta correcta, si es 4 retorna el indice de la respuesta correcta si es 5 retorna el indice de la pregunta si es 6 pone el indice de la pregunta si es 7 retorna el titulo de la pregunta si es 8 pone el titulo de la pregunta
     * @param {*} value valor a cambiar
     * @param {string} id_group el id del grupo
     * @returns retorna true si la pregunta esta activa y false si no lo esta 
     */
    async quest(option, id_group, value) {
        try {
            const rows = await this.ReadDb(`SELECT * FROM quest WHERE id_group = ?`, [id_group]);
            if (rows.length === 0) {
                await this.WriteDb(`INSERT INTO quest (id_group) VALUES (?)`, [id_group]);
            }

            let row = rows[0] || { activeQuest: false, correctAnswer: null, index_p: 0, title_quest: '' };

            switch (option) {
                case 1:
                    return row.activeQuest;
                case 2:
                    row.activeQuest = value;
                    break;
                case 3:
                    row.correctAnswer = value;
                    break;
                case 4:
                    return row.correctAnswer;
                case 5:
                    return row.index_p;
                case 6:
                    row.index_p = value;
                    break;
                case 7:
                    return row.title_quest;
                case 8:
                    row.title_quest = value;
                    break;
                default:
                    throw new Error('Opción no válida');
            }

            const query = `UPDATE quest SET activeQuest = ?, correctAnswer = ?, title_quest = ?, index_p = ? WHERE id_group = ?`;
            await this.ReadDb(query, [row.activeQuest, row.correctAnswer, row.title_quest, row.index_p, id_group]);

            return row.activeQuest;
        } catch (err) {
            console.error(err.message);
            throw err;
        }
    }
}

module.exports = new Games();