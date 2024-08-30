const puppeteer = require('puppeteer-extra');
const ph = require('./puppeteer-helper');
const fs = require('fs');
require('dotenv').config();
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

const hostname = 'https://aternos.org';

const to = {
    default: 10000,
    start: 300000,
    stop: 60000
};

const si = {
    stopped: 'div.statuslabel i.fas.fa-stop-circle',
    started: 'div.statuslabel i.fas.fa-play-circle',
    waiting: 'div.statuslabel i.fas.fa-clock',
    loading: 'div.statuslabel i.fas.fa-spinner-third'
};

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

async function findServer(page, id) {
    let server = id && await page.$(`[data-id="${id}"]`);
    if (!server) {
        const servers = await page.$$('div.server-body');
        for (const srv of servers) {
            if (!id || await ph.getText(srv, '.server-name') === id) {
                return srv;
            }
        }
    }
    return server;
}

async function getServerID(page) {
    return await ph.getText(page, 'div.navigation-server-detail.navigation-server-id');
}

async function getServerName(page) {
    const href = await ph.getText(page, '.server-ip.mobile-full-width');
    if (href) {
        const match = href.match(/^[^.]+/);
        return match ? match[0] : null;
    }
}

async function getPlayers(page) {
    let players = await ph.getText(page, '#players');
    if (players) {
        players = players.split('/');
        return {
            current: players[0].trim() * 1,
            max: players[1].trim() * 1
        };
    }
}

async function getSoftware(page) {
    return await ph.getText(page, '#software');
}

async function getVersion(page) {
    return await ph.getText(page, '#version');
}

async function getQueue(page) {
    let time = await ph.getText(page, 'span.server-status-label-left');
    let people = await ph.getText(page, 'span.server-status-label-right.queue-position');
    if (time && people) {
        people = people.split('/');
        return {
            time: time.replace('.ca', '').replace('min', '').trim() * 60,
            position: people.lengh > 0 && people[0].trim() * 1,
            waiting: people.lengh > 1 && people[1].trim() * 1
        };
    } 
}

async function getStatus(page) { 
    
    const status = {};

    if (await ph.isVisible(page, si.stopped)) {
        status.id = 0;
    }
    else if (await ph.isVisible(page, si.started)) {
        status.id = 1;
        //status.countdown = await ph.getText(page, 'span.server-status-label-left');
        //status.memory = await ph.getText(page, 'span.server-status-label-right.queue-position');
    }
    else if (await ph.isVisible(page, si.waiting)) {
        status.id = 2;
        status.queue = await getQueue(page);
    }
    else if (await ph.isVisible(page, si.loading)) {
        status.id = 3;
    }
    else {
        status.id = -1;
    }

    if (await ph.waitForFirst(page, to.default, '.statuslabel-label')) {
        status.text = await ph.getText(page, '.statuslabel-label');
    }    

    return status;
}

async function getServerInfo(page) {
    let info = {};

    try {
        info.id = await getServerID(page);
        info.name = await getServerName(page);
        info.status = await getStatus(page);
        info.players = await getPlayers(page);
        info.software = await getSoftware(page);
        info.version = await getVersion(page);
    }
    catch(err) {
        info.error = err.message;
    }

    return info;
}

async function connect(id, req, doend) {
    const startPage = hostname + '/go';

    let browser, page, info = {}, time = new Date();

    try {
        if(!browser) {         
            browser = await puppeteer.launch({headless:true});
            
            page = await browser.newPage();

            if(fs.existsSync('./cookies/cookiemc.json')) {
                // Leer las cookies del archivo JSON
                const cookiesString = fs.readFileSync('./cookies/cookiemc.json');
                const cookies = JSON.parse(cookiesString);

                // Establecer las cookies en la página
                await page.setCookie(...cookies);
                await page.goto(startPage);
            }else{
                await page.goto(startPage);
                await page.type('.username', process.env.ATERNOS_USER);
                await page.type('.password', process.env.ATERNOS_PASSWORD);
                await page.click('.login-button.btn.btn-main.join-left');

                await page.waitForFunction(() => {
                    let le = document.querySelector('div.login-error');
                    le = le && le.textContent.trim() !== '';
                    return le || document.querySelector('div.page-content.page-servers');
                }, {timeout:30000});

                const error = await ph.getText(page, 'div.login-error');
                if (error) {
                    throw error;
                }

                // Obtener todas las cookies
                const cookies = await page.cookies();
                // Guardar las cookies en un archivo JSON
                const fs = require('fs');
                fs.writeFileSync('./cookies/cookiemc.json', JSON.stringify(cookies, null, 2));    
            }

            const server = await findServer(page, id);
            if (!server) {
                throw `Server ${id} not found`;
            }

            await server.click();
            await page.waitForNavigation({ waitUntil: 'networkidle0' });
        }
        
        const choices = await page.$('.btn.btn-huge.btn-success');
        if (choices && !doend) {
            await choices.click();
        }

        await page.waitForSelector('.btn.btn-huge.btn-danger', { hidden:false, timeout:520000});

        info = await getServerInfo(page);

        if (req) {
            await req(page, info);
        }
    }
    catch(error) {
        info.error = error.message;
    }
    finally {
        if(browser){
            await browser.close();
        }
        info.elapsed = new Date() - time;
        return info;
    }
}

async function start(id, wait) {
    return new Promise(async (resolve, reject) => {
        try {
            const info = await connect(id, async (page, info) => {
                if (info.status.id !== 0) {
                    return;
                }

                try {
                    await page.waitForSelector('#start');
                    await page.click('#start');

                    const confirmStart = 'div.status.online';
                    await page.waitForSelector(confirmStart, { timeout: 120000 });
                    let confirmation = await page.$(confirmStart);
                    if (confirmation) {
                        await confirmation.click();
                    }

                    if (!page.url().includes('server')) {
                        await page.goto(hostname + '/server');
                    }

                    await ph.waitForFirst(page, to.start, si.started, si.waiting);

                    if (wait && await ph.isVisible(si.waiting)) {
                        const queue = await getQueue(page);
                        await page.waitForSelector('#confirm', { timeout: queue.time * 1000, visible: true });
                        await page.click('#confirm');
                        await page.waitForSelector(si.started, { timeout: to.start });
                    }

                    info.status = await getStatus(page);
                }
                catch (error) {
                    info.error = error.message;
                }
            });
            resolve(info);
        } catch (error) {
            reject(error);
        }
    });
}
async function readStatus() {
    return new Promise(async (resolve, reject) => {
        try {
            const info = await connect(null, null, true);
            resolve(info.status.text);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    start,
    readStatus
};