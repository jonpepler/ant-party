// Integration test for the host orchestrator: drives hostGame with a fake
// transport and the REAL worker_threads ant runner, so protocol -> engine ->
// sandbox is exercised end to end in Node.
import assert from 'node:assert/strict'
import { Worker } from 'node:worker_threads'
import { createHostGame } from './hostGame.js'
import { createAntRunner } from './antRunner.js'
import { ACTIONS } from '../sim/protocol.js'

const workerUrl = new URL('./ant-worker.node.js', import.meta.url)
const spawnWorker = () => new Worker(workerUrl)

// A transport stub that records outbound sends and lets the test inject
// inbound peer messages and peer-leave events.
const makeFakeTransport = () => {
  const handlers = new Map()
  const leaveCbs = []
  const sent = []
  return {
    send: (action, data, peerId) => sent.push({ action, data, peerId }),
    on: (action, h) => handlers.set(action, h),
    onPeerJoin: () => {},
    onPeerLeave: cb => leaveCbs.push(cb),
    inbound: (action, data, peerId) => handlers.get(action) && handlers.get(action)(data, peerId),
    leave: peerId => leaveCbs.forEach(cb => cb(peerId)),
    sent
  }
}

// Never auto-loop; the test drives ticks manually for determinism.
const manualScheduler = { setInterval: () => null, clearInterval: () => {} }

// Poll until a condition holds (or time out). Used to wait for the async
// compile ack before driving ticks.
const waitFor = async (fn, ms = 3000) => {
  const start = Date.now()
  while (!fn()) {
    if (Date.now() - start > ms) throw new Error('waitFor timed out')
    await new Promise(r => setTimeout(r, 5))
  }
}
const ackedFile = transport => transport.sent.some(s => s.action === ACTIONS.FILE_RESULT)

let passed = 0
const test = async (name, fn) => { await fn(); passed++; console.log(`ok - ${name}`) }

await test('a joining peer is registered and gets a JOIN_RESULT', async () => {
  const transport = makeFakeTransport()
  const antRunner = createAntRunner({ spawnWorker })
  const host = createHostGame({ transport, antRunner, gamecode: '123456', scheduler: manualScheduler })

  transport.inbound(ACTIONS.JOIN, { playerName: 'Ada' }, 'peerA')
  const res = transport.sent.find(s => s.action === ACTIONS.JOIN_RESULT)
  assert.ok(res, 'JOIN_RESULT sent')
  assert.equal(res.peerId, 'peerA')
  assert.equal(res.data.result, true)
  assert.equal(host.getState().players.length, 1)
  assert.equal(host.getState().players[0].name, 'Ada')
  host.stop()
})

await test('ant file upload is acked with a version', async () => {
  const transport = makeFakeTransport()
  const antRunner = createAntRunner({ spawnWorker })
  const host = createHostGame({ transport, antRunner, gamecode: '123456', scheduler: manualScheduler })

  transport.inbound(ACTIONS.JOIN, { playerName: 'Ada' }, 'peerA')
  transport.inbound(ACTIONS.ANT_FILE, { antFile: '(() => ({}))()' }, 'peerA')
  await waitFor(() => ackedFile(transport))
  const ack = transport.sent.find(s => s.action === ACTIONS.FILE_RESULT)
  assert.ok(ack)
  assert.equal(ack.data.result, true)
  assert.equal(ack.data.liveAntFileVersion, 0)
  host.stop()
})

await test('start broadcasts GAME_START with a map; spawn then move works', async () => {
  const transport = makeFakeTransport()
  const antRunner = createAntRunner({ spawnWorker })
  const host = createHostGame({ transport, antRunner, gamecode: '123456', scheduler: manualScheduler })

  transport.inbound(ACTIONS.JOIN, { playerName: 'Ada' }, 'peerA')
  // An ant that always walks east (direction 2).
  transport.inbound(ACTIONS.ANT_FILE, { antFile: '(() => ({ move: 2 }))()' }, 'peerA')
  transport.inbound(ACTIONS.SPAWN, {}, 'peerA')
  await waitFor(() => ackedFile(transport)) // ensure worker compiled before ticking

  host.start()
  const startMsg = transport.sent.find(s => s.action === ACTIONS.GAME_START)
  assert.ok(startMsg, 'GAME_START broadcast')
  assert.equal(startMsg.peerId, undefined, 'broadcast (no target)')
  assert.equal(startMsg.data.mapData.nests.length, 1)

  await host.tickOnce() // spawns the queued ant (at end of tick)
  let map = host.getState().mapData
  assert.equal(map.ants.length, 1, 'ant spawned')
  const spawn = { x: map.ants[0].x, y: map.ants[0].y }

  await host.tickOnce() // ant runs and moves east
  map = host.getState().mapData
  assert.equal(map.ants[0].x, spawn.x + 1, 'ant moved east')
  assert.equal(map.ants[0].y, spawn.y)

  const mapBroadcasts = transport.sent.filter(s => s.action === ACTIONS.MAP_DATA)
  assert.ok(mapBroadcasts.length >= 2, 'map broadcast each tick')
  host.stop()
})

await test('a runaway ant does not hang the tick', async () => {
  const transport = makeFakeTransport()
  const antRunner = createAntRunner({ spawnWorker, tickDeadlineMs: 50 })
  const host = createHostGame({ transport, antRunner, gamecode: '123456', scheduler: manualScheduler })

  transport.inbound(ACTIONS.JOIN, { playerName: 'Loop' }, 'peerA')
  transport.inbound(ACTIONS.ANT_FILE, { antFile: '(() => { while (true) {} })()' }, 'peerA')
  transport.inbound(ACTIONS.SPAWN, {}, 'peerA')
  await waitFor(() => ackedFile(transport)) // compiles fine; the loop only runs on tick

  host.start()
  await host.tickOnce() // spawn the runaway ant
  assert.equal(host.getState().mapData.ants.length, 1)
  await host.tickOnce() // ant loops forever -> deadline -> no-op, tick completes
  // If we got here without hanging, the boundary held.
  assert.equal(host.getState().mapData.ants.length, 1)
  host.stop()
})

await test('a leaving peer is removed', async () => {
  const transport = makeFakeTransport()
  const antRunner = createAntRunner({ spawnWorker })
  const host = createHostGame({ transport, antRunner, gamecode: '123456', scheduler: manualScheduler })

  transport.inbound(ACTIONS.JOIN, { playerName: 'Ada' }, 'peerA')
  assert.equal(host.getState().players.length, 1)
  transport.leave('peerA')
  assert.equal(host.getState().players.length, 0)
  host.stop()
})

console.log(`\n${passed} passing`)
process.exit(0)
