const fs = require('fs');
const readline = require('readline');

process.on('SIGINT', async () => {
    const { AlastorBot } = require('./bot')
    new AlastorBot().closeBot();
})

if(fs.existsSync('config.json')){
    const browserPath = JSON.parse(fs.readFileSync('config.json'))[0].path;
    if(browserPath){
        const { AlastorBot } = require('./bot')
        new AlastorBot(browserPath).activate();
    }
}else{
    const r = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    r.question("Introduce la ruta del navegador: ", (path) => {
        if(path){
            r.question("Introduce la ruta de la Base de datos: ", (pathB) => {
                if(pathB){
                    fs.writeFileSync('config.json', JSON.stringify([
                        {
                            path: path,
                            pathB: pathB,
                            ms: false
                        }], null, 4));(path)
                    const { AlastorBot } = require('./bot')
                    new AlastorBot(path).activate();
                }
                r.close();
            })
        }else{
            r.close();
        }
    })
}