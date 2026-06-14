// Phase 0a spike: a Trystero peer running in Node via node-datachannel.
// This is the shape the CLI transport will eventually take.
//
// Env:
//   ROOM      - room code (the future gamecode)
//   LABEL     - human label for logs
//   INITIATOR - "1" to kick off the ping round-trip
//   STRATEGY  - torrent | nostr | mqtt  (signaling strategy, default torrent)
import { RTCPeerConnection } from 'node-datachannel/polyfill'

const ROOM = process.env.ROOM || 'ant-party-spike-room'
const LABEL = process.env.LABEL || 'peer'
const INITIATOR = process.env.INITIATOR === '1'
const STRATEGY = process.env.STRATEGY || 'torrent'

const strategyModule = {
  torrent: 'trystero/torrent',
  nostr: 'trystero/nostr',
  mqtt: 'trystero/mqtt'
}[STRATEGY]

const log = (...args) => console.log(`[${LABEL}]`, ...args)

const { joinRoom } = await import(strategyModule)

const config = { appId: 'ant-party-spike', rtcPolyfill: RTCPeerConnection }
if (process.env.RELAY_URLS) config.relayUrls = process.env.RELAY_URLS.split(',')
// In the sandbox public STUN is unreachable; force localhost host candidates only.
if (process.env.NO_STUN === '1') config.rtcConfig = { iceServers: [] }

const room = joinRoom(config, ROOM)

const nonce = `${LABEL}-${Date.now()}`
const [sendPing, getPing] = room.makeAction('ping')
const [sendPong, getPong] = room.makeAction('pong')

room.onPeerJoin(peerId => {
  log('peer joined:', peerId)
  if (INITIATOR) {
    log('sending ping', nonce)
    sendPing(nonce)
  }
})

room.onPeerLeave(peerId => log('peer left:', peerId))

getPing((data, peerId) => {
  log('got ping from', peerId, '->', data)
  sendPong(data, peerId)
})

getPong((data, peerId) => {
  log('got pong from', peerId, '->', data)
  if (data === nonce) {
    log('ROUND TRIP OK')
    setTimeout(() => process.exit(0), 200)
  }
})

const TIMEOUT_MS = Number(process.env.TIMEOUT_MS || 45000)
setTimeout(() => {
  log(`TIMEOUT after ${TIMEOUT_MS}ms, no round trip`)
  process.exit(1)
}, TIMEOUT_MS)

log(`joined room "${ROOM}" via ${STRATEGY}, initiator=${INITIATOR}`)
