import {Discovery} from 'weplay-common'

process.title = 'weplay-discovery'

const discoveryPort = process.env.DISCOVERY_PORT || 3010
const statusPort = process.env.STATUS_PORT || 8088

const options = {name: 'discovery', port: discoveryPort, statusPort: statusPort}
const discovery = new Discovery().server(options)

require('weplay-common').cleanup(discovery.destroy.bind(discovery))
