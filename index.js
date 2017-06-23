process.title = 'weplay-discovery'

const crypto = require('crypto')
const uuid = require('node-uuid').v4()
const logger = require('weplay-common').logger('weplay-discovery', uuid)

const discoveryPort = process.env.DISCOVERY_PORT || 3010
const statusPort = process.env.STATUS_PORT || 8080
const Discovery = require('weplay-common').Discovery

const discovery = new Discovery().server({name: 'My Discovery', port: discoveryPort, statusPort: statusPort}, () => {
  logger.info('My Discovery server listening', {
    port: discoveryPort,
    uuid: uuid
  })
})


const discoveryUrl = process.env.DISCOVERY_URL
if (discoveryUrl) {
  var discoveryClient = new Discovery().client(options, _onConnect)
}


require('weplay-common').cleanup(discovery.destroy.bind(discovery))
