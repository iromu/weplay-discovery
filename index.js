process.title = 'weplay-discovery'

const uuid = require('node-uuid').v4()
const logger = require('weplay-common').logger('weplay-discovery', uuid)

const discoveryPort = process.env.DISCOVERY_PORT || 3010
const statusPort = process.env.STATUS_PORT || 8088
const Discovery = require('weplay-common').Discovery

const discovery = new Discovery().server({name: 'discovery', port: discoveryPort, statusPort: statusPort}, () => {
  logger.info('My Discovery server listening', {
    port: discoveryPort,
    uuid: uuid
  })
})

const discoveryUrl = process.env.DISCOVERY_MASTER_URL
if (discoveryUrl) {
  const EventBus = require('weplay-common').EventBus
  var bus = new EventBus({
    url: discoveryUrl,
    port: discoveryPort,
    statusPort: statusPort,
    name: 'emu',
    id: this.uuid,
    serverListeners: {
      'move': (socket, request) => {
        // console.log('move Request', request)
        if (this.emu) {
          this.emu.move(request)
        }
      },
      'streamJoinRequested': this.streamJoinRequested.bind(this),
      'streamCreateRequested': this.streamCreateRequested.bind(this)
    },
    clientListeners: [
      // {name: 'rom', event: 'connect', handler: this.onRomConnect.bind(this)},
      // {name: 'rom', event: 'disconnect', handler: this.onRomDisconnect.bind(this)},
      {name: 'gateway', event: 'move', handler: this.onMove.bind(this)},
      {name: 'rom', event: 'data', handler: this.onRomData.bind(this)},
      {name: 'rom', event: 'hash', handler: this.onRomHash.bind(this)},
      {name: 'rom', event: 'state', handler: this.onRomState.bind(this)}]
  }, () => {
    logger.info('Discovery slave connected to discovery server', {
      discoveryUrl: discoveryUrl,
      uuid: this.uuid
    })
  })
}

require('weplay-common').cleanup(discovery.destroy.bind(discovery))
