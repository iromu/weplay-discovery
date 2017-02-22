process.title = 'weplay-discovery';

const crypto = require('crypto');
const uuid = require('node-uuid').v4();
const logger = require('weplay-common').logger('weplay-discovery', uuid);

const discoveryPort = process.env.DISCOVERY_PORT || 3010;
const Discovery = require('weplay-common').Discovery;

const discovery = new Discovery().server(discoveryPort, null, ()=> {
    logger.info('Discovery server listening', {
        port: discoveryPort,
        uuid: uuid
    });
});


var restify = require('restify');

function lookup(req, res, next) {
    res.send(discovery.lookup().map(service=> {
        if (service.events) {
            const events = service.events.map(e=> {
                return e.event;
            });
            return {name: service.name, id: service.id, version: service.version, events: events};
        }
        else {
            return {name: service.name, id: service.id, version: service.version};
        }
    }));
    next();
}

var server = restify.createServer({
    formatters: {
        'application/json': function (req, res, body, cb) {
            return cb(null, JSON.stringify(body, null, '\t'));
        }
    }
});

server.pre(restify.pre.userAgentConnection());

server.get('/lookup', lookup);
server.head('/lookup', lookup);

server.listen(8080, function () {
    logger.info('Restify %s listening at %s', server.name, server.url);
});

require('weplay-common').cleanup(discovery.destroy.bind(discovery));
