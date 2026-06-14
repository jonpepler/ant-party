// Spawns two node-peer.js processes in the same room and checks that they
// complete a WebRTC data-channel round-trip. Exits 0 on success.
import { spawn } from 'node:child_process'

const STRATEGY = process.env.STRATEGY || 'torrent'
const ROOM = `spike-${Date.now()}`

const spawnPeer = (label, initiator) =>
  spawn('node', ['node-peer.js'], {
    cwd: new URL('.', import.meta.url).pathname,
    stdio: 'inherit',
    env: { ...process.env, ROOM, LABEL: label, INITIATOR: initiator ? '1' : '0', STRATEGY }
  })

console.log(`=== round-trip test: strategy=${STRATEGY} room=${ROOM} ===`)

const responder = spawnPeer('B', false)
const initiator = spawnPeer('A', true)

let done = false
const finish = code => {
  if (done) return
  done = true
  for (const p of [initiator, responder]) {
    if (!p.killed) p.kill()
  }
  console.log(code === 0 ? '=== PASS ===' : '=== FAIL ===')
  process.exit(code)
}

// The initiator is the one that confirms the round trip, so its exit is what counts.
initiator.on('exit', code => finish(code ?? 1))
