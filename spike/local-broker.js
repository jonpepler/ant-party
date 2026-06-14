// Minimal local MQTT-over-WebSocket broker so the Trystero spike can signal
// entirely on localhost (the public relays are firewalled in this sandbox).
import { Aedes } from 'aedes'
import { createServer } from 'aedes-server-factory'

const PORT = Number(process.env.BROKER_PORT || 8888)
const broker = await Aedes.createBroker()
const server = createServer(broker, { ws: true })

broker.on('client', c => console.log('[broker] client connected:', c.id))
broker.on('publish', (packet, client) => {
  if (client) console.log('[broker] publish from', client.id, 'topic', packet.topic)
})

server.listen(PORT, () => console.log(`[broker] mqtt/ws listening on ws://localhost:${PORT}`))
