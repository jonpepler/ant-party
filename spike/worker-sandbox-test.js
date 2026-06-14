// Phase 0b spike: prove the host can run untrusted ant code in a worker,
// compile it once, invoke per tick, and KILL a runaway (infinite-loop) ant
// via terminate() without hanging the host, then respawn and carry on.
//
// Uses worker_threads as a stand-in for browser Web Workers: terminate()
// forcibly stops a spinning worker in both, which is the property under test.
import { Worker } from 'node:worker_threads'

const workerUrl = new URL('./ant-worker.js', import.meta.url)
const TICK_DEADLINE_MS = 50

const spawnWorker = () => new Worker(workerUrl)

// Load ant code into a worker and wait for confirmation.
const loadAnt = (worker, code) =>
  new Promise((resolve, reject) => {
    const onMsg = msg => {
      if (msg.type === 'loaded') { worker.off('message', onMsg); resolve() }
      if (msg.type === 'loadError') { worker.off('message', onMsg); reject(new Error(msg.error)) }
    }
    worker.on('message', onMsg)
    worker.postMessage({ type: 'load', code })
  })

// Run one tick with a hard deadline. Returns {action} or throws on
// timeout / runtime error. The caller decides whether to terminate.
const runTick = (worker, tick, senses) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      worker.off('message', onMsg)
      reject(new Error('DEADLINE'))
    }, TICK_DEADLINE_MS)
    const onMsg = msg => {
      if (msg.tick !== tick) return
      clearTimeout(timer)
      worker.off('message', onMsg)
      if (msg.type === 'action') resolve(msg.action)
      else reject(new Error(msg.error))
    }
    worker.on('message', onMsg)
    worker.postMessage({ type: 'tick', tick, senses })
  })

const goodAnt = `return (senses) => senses.food > 0 ? 'EAT' : 'NORTH'`
const evilAnt = `return (senses) => { while (true) {} }`

let failures = 0

// 1) Well-behaved ant: compile once, run many ticks, measure throughput.
{
  const worker = spawnWorker()
  await loadAnt(worker, goodAnt)
  const N = 1000
  const start = performance.now()
  for (let i = 0; i < N; i++) {
    const action = await runTick(worker, i, { food: i % 2 })
    if (i === 0 && action !== 'NORTH') failures++
  }
  const ms = performance.now() - start
  console.log(`good ant: ${N} ticks in ${ms.toFixed(0)}ms (${(N / (ms / 1000)).toFixed(0)} ticks/s)`)
  await worker.terminate()
}

// 2) Runaway ant: tick must hit the deadline, terminate() must kill it,
//    and the host must keep running.
{
  let worker = spawnWorker()
  await loadAnt(worker, evilAnt)
  let killed = false
  try {
    await runTick(worker, 0, {})
    console.log('FAIL: runaway ant did not time out')
    failures++
  } catch (err) {
    if (err.message === 'DEADLINE') {
      const code = await worker.terminate() // forcibly kills the spinning thread
      killed = true
      console.log(`runaway ant: hit ${TICK_DEADLINE_MS}ms deadline, terminated (exit ${code})`)
    } else {
      console.log('FAIL: unexpected error', err.message)
      failures++
    }
  }
  if (!killed) failures++

  // 3) Host recovers: respawn a fresh worker and keep going.
  worker = spawnWorker()
  await loadAnt(worker, goodAnt)
  const action = await runTick(worker, 0, { food: 1 })
  console.log(`recovery: respawned worker, next tick ok -> ${action}`)
  if (action !== 'EAT') failures++
  await worker.terminate()
}

console.log(failures === 0 ? '=== PASS ===' : `=== FAIL (${failures}) ===`)
process.exit(failures === 0 ? 0 : 1)
