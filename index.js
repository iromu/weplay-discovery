'use strict';

const fs = require('fs');
const join = require('path').join;
const crypto = require('crypto');

const logger = require('weplay-common').logger('weplay-discovery');


// redis
const redis = require('weplay-common').redis();
const sub = require('weplay-common').redis();


var digest = function (state) {
    var md5 = crypto.createHash('md5');
    return md5.update(state).digest('hex');
};

const romsMap = [];
var defaultRomHash;
const romPath = join('data', 'rom');
const romDir = join(process.cwd(), romPath);
const statePath = join('data', 'state');
const stateDir = join(process.cwd(), statePath);

logger.info(romDir);
fs.readdir(romDir, (err, roms) => {
    if (err) {
        logger.error(err);
    }
    var count = 1;
    roms.forEach((rom)=> {
        var name = rom.split('.')[0];
        if (name) {
            var romData = fs.readFileSync(join(romDir, rom));
            var hash = digest(romData).toString();
            var romInfo = {name: name, path: join(romPath, rom), hash: hash, emu: null};
            logger.info('loading rom info', romInfo);
            if (romInfo.name === 'default') {
                defaultRomHash = hash;
                logger.info('default loading rom info', romInfo);
                redis.set('weplay:rom:default', defaultRomHash);
                redis.set('weplay:rom:0', defaultRomHash);
            } else {
                redis.set(`weplay:rom:${count}`, hash);
            }
            count++;
            romsMap.push(romInfo);
        }
    });
});


sub.subscribe('weplay:emu:subscribe');
sub.on('message', (channel, id) => {
    if ('weplay:emu:subscribe' != channel) return;
    id = id.toString();
    logger.debug('weplay:emu:subscribe', {uuid: id});

    var romSelection = romsMap.filter(r=>r.name === 'default' && (r.emu === null || r.emu === id))[0];
    if (!romSelection)  romSelection = romsMap.filter(r=>r.emu === null || r.emu === id)[0];

    if (romSelection) {
        //romsMap[romsMap.indexOf(romSelection)].emu = id;
        romSelection.emu = id;
        //const romSelection = romsMap['default'];
        var romHash = romSelection.hash;

        logger.info(`weplay:emu:${id}:rom:hash`, {romHash: romHash});
        redis.publish(`weplay:emu:${id}:rom:hash`, romHash);

        redis.get(`weplay:state:${romHash}`, (err, state) => {
            if (err) throw err;
            if (!state) {

                fs.stat(join(stateDir, `${romHash}.state`), (err, stats) => {
                    if (stats) {
                        fs.readFile(join(stateDir, `${romHash}.state`), (err, stateFromFile) => {
                            if (err) logger.error(err);
                            if (stateFromFile) {
                                logger.debug('loading latest state from disk');
                                redis.set(`weplay:state:${romHash}`, stateFromFile);

                                logger.info(`weplay:emu:${id}:rom:state`);
                                redis.publish(`weplay:emu:${id}:rom:state`, stateData);
                            }
                        });
                    } else {
                        fs.readFile(join(process.cwd(), romSelection.path), (err, romData) => {
                            if (err) {
                                logger.error(err);
                            }

                            logger.info(`weplay:emu:${id}:rom:data`, {romHash: romHash});
                            redis.publish(`weplay:emu:${id}:rom:data`, romData);
                        });
                    }
                });
            } else {
                logger.info(`weplay:emu:${id}:rom:state`);
                redis.publish(`weplay:emu:${id}:rom:state`, state);
            }
        });


        sub.subscribe(`weplay:state:${romHash}`);
        sub.on('message', (channel, romPack) => {
            if (`weplay:state:${romHash}` != channel) return;

            redis.set(`weplay:state:${romHash}`, romPack);

            logger.debug('weplay:state', {romHash: romHash, state: digest(romPack)});
            var stateName = join('data', 'state', `${romHash}.state`);
            const file = join(process.cwd(), stateName);
            fs.writeFile(file, romPack, (err) => {
                if (err) {
                    logger.error(err);
                }
            });
        });

    }
    logger.info('weplay:emu:subscribe:done', {id: id, romsMap: romsMap.filter(r=> r.emu !== null)});
    redis.publish(`weplay:emu:${id}:subscribe:done`, '');
});

redis.publish('weplay:discover:init', '');