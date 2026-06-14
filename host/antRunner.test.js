// Tests for the per-player ant worker pool. Uses REAL worker_threads workers
// (like the spike) via an injected spawnWorker factory, so the deadline /
// terminate / respawn behaviour is exercised for real. No test framework:
// plain node:assert. Run with `node host/antRunner.test.js`.
import assert from 'node:assert'
import { Worker } from 'node:worker_threads'
import { createAntRunner } from './antRunner.js'
import { compileAnt } from './compileAnt.js'

const workerUrl = new URL('./ant-worker.node.js', import.meta.url)
const spawnWorker = () => new Worker(workerUrl)

// Ant sources are IIFE-completion expressions, exactly like the old vm2 ones.
// `ant` is injected as { senses, health }.
const goodAnt = `(() => { const { health } = ant; return { move: health > 5 ? 2 : 6, pheromone: 'ok' } })()`
const runawayAnt = `(() => { while (true) {} })()`
const otherAnt = `(() => ({ move: 4 }))()`

const sampleAntObj = { senses: Array.from({ length: 8 }, () => []), health: 10 }

let failures = 0
const check = (label, fn) => fn().then(
  () => console.log('ok  -', label),
  err => { failures++; console.log('FAIL-', label, '\n     ', err.message) }
)

async function main () {
  // 0) compileAnt unit check: completion-value semantics.
  await check('compileAnt returns the IIFE completion value', async () => {
    const c = compileAnt(goodAnt)
    const action = c.run(sampleAntObj)
    assert.deepStrictEqual(action, { move: 2, pheromone: 'ok' })
  })

  await check('compileAnt surfaces compile errors', async () => {
    assert.throws(() => compileAnt('(() => { this is not js )('))
  })

  // 1) Well-behaved ant loads and runAnt returns its actions.
  await check('good ant loads and runAnt returns its actions', async () => {
    const runner = createAntRunner({ spawnWorker, tickDeadlineMs: 50 })
    await runner.loadAnt('p1', goodAnt)
    const action = await runner.runAnt({ player: 'p1' }, sampleAntObj)
    assert.deepStrictEqual(action, { move: 2, pheromone: 'ok' })
    runner.destroy()
  })

  // 2) Runaway ant hits the deadline, worker is terminated, pool recovers.
  await check('runaway ant hits deadline, terminates, and pool recovers', async () => {
    const runner = createAntRunner({ spawnWorker, tickDeadlineMs: 50 })
    await runner.loadAnt('p1', runawayAnt)

    const t0 = performance.now()
    const action = await runner.runAnt({ player: 'p1' }, sampleAntObj)
    const elapsed = performance.now() - t0

    // The runaway must be cut off near the deadline and yield a safe no-op.
    assert.deepStrictEqual(action, {}, 'runaway should resolve to {}')
    assert.ok(elapsed < 500, `should resolve near deadline, took ${elapsed.toFixed(0)}ms`)

    // Replace with a good ant; the respawned/reloaded worker must work again.
    await runner.loadAnt('p1', goodAnt)
    const recovered = await runner.runAnt({ player: 'p1' }, sampleAntObj)
    assert.deepStrictEqual(recovered, { move: 2, pheromone: 'ok' })
    runner.destroy()
  })

  // 2b) Even without an explicit reload, the player keeps working after a
  //     runaway (the runner auto-respawns with the last known source).
  await check('player auto-recovers after a runaway without reload', async () => {
    const runner = createAntRunner({ spawnWorker, tickDeadlineMs: 50 })
    await runner.loadAnt('p1', runawayAnt)
    const dead = await runner.runAnt({ player: 'p1' }, sampleAntObj)
    assert.deepStrictEqual(dead, {})
    // The auto-respawn reloads runawayAnt again, so this also times out, but
    // the runner must still resolve cleanly rather than hang.
    const again = await runner.runAnt({ player: 'p1' }, sampleAntObj)
    assert.deepStrictEqual(again, {})
    runner.destroy()
  })

  // 3) Two players are isolated: one's runaway must not affect the other.
  await check('two players are isolated', async () => {
    const runner = createAntRunner({ spawnWorker, tickDeadlineMs: 50 })
    await runner.loadAnt('p1', runawayAnt)
    await runner.loadAnt('p2', otherAnt)

    const [a1, a2] = await Promise.all([
      runner.runAnt({ player: 'p1' }, sampleAntObj),
      runner.runAnt({ player: 'p2' }, sampleAntObj)
    ])

    assert.deepStrictEqual(a1, {}, 'p1 runaway -> no-op')
    assert.deepStrictEqual(a2, { move: 4 }, 'p2 unaffected')

    // p2 still works on a subsequent tick.
    const a2b = await runner.runAnt({ player: 'p2' }, sampleAntObj)
    assert.deepStrictEqual(a2b, { move: 4 })
    runner.destroy()
  })

  // 4) Unknown player -> safe no-op (no worker loaded).
  await check('unknown player yields a no-op', async () => {
    const runner = createAntRunner({ spawnWorker, tickDeadlineMs: 50 })
    const action = await runner.runAnt({ player: 'nobody' }, sampleAntObj)
    assert.deepStrictEqual(action, {})
    runner.destroy()
  })

  console.log(failures === 0 ? '\n=== PASS ===' : `\n=== FAIL (${failures}) ===`)
  process.exit(failures === 0 ? 0 : 1)
}

main()
