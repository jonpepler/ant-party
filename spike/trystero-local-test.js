// End-to-end Trystero test in Node using a local MQTT broker for signaling.
// Proves joinRoom -> onPeerJoin -> makeAction round-trip works with the
// node-datachannel polyfill, with no dependency on public relays.
import { spawn } from 'node:child_process'

const PORT = 8888
const ROOM = `spike-${Date.now()}`
const here = new URL('.', import.meta.url).pathname

const broker = spawn('node', ['local-broker.js'], {
  cwd: here,
  stdio: 'inherit',
  env: { ...process.env, BROKER_PORT: String(PORT) }
})

const spawnPeer = (label, initiator) =>
  spawn('node', ['node-peer.js'], {
    cwd: here,
    stdio: 'inherit',
    env: {
      ...process.env,
      ROOM,
      LABEL: label,
      INITIATOR: initiator ? '1' : '0',
      STRATEGY: 'mqtt',
      RELAY_URLS: `ws://localhost:${PORT}`,
      NO_STUN: '1',
      TIMEOUT_MS: '30000'
    }
  })

let initiator, responder
let done = false
const finish = code => {
  if (done) return
  done = true
  for (const p of [initiator, responder, broker]) {
    if (p && !p.killed) p.kill()
  }
  console.log(code === 0 ? '=== PASS ===' : '=== FAIL ===')
  process.exit(code)
}

// Give the broker a moment to bind before peers connect.
setTimeout(() => {
  console.log(`=== trystero local test: room=${ROOM} broker=ws://localhost:${PORT} ===`)
  responder = spawnPeer('B', false)
  initiator = spawnPeer('A', true)
  initiator.on('exit', code => finish(code ?? 1))
}, 1000)
