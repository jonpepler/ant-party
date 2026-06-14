// Per-player worker pool that produces the `runAnt(ant, antObj)` callback that
// sim/engine.js expects.
//
// One Web Worker (browser) or worker_threads Worker (Node tests) per player
// isolates players from each other. Each tick we dispatch the ant's antObj to
// its player's worker with a HARD deadline. If the worker misses the deadline
// (e.g. an infinite loop) or errors, we terminate() and respawn that one
// worker, reloading the player's last known source, and resolve to a safe
// no-op action {} so the simulation tick keeps moving. This is the
// security/perf boundary: a runaway ant must never hang the host.
//
// The transport (Trystero / node-datachannel) is deliberately NOT involved
// here; this module is transport-agnostic.

// spawnWorker() must return a worker handle exposing:
//   - postMessage(msg)
//   - terminate()  (sync or returning a Promise; result ignored)
//   - message listening via EITHER .on('message', fn) (worker_threads)
//     OR .addEventListener('message', fn) / .onmessage (Web Worker)
//
// createAntRunner({ spawnWorker, tickDeadlineMs = 50 })
export function createAntRunner ({ spawnWorker, tickDeadlineMs = 50 }) {
  if (typeof spawnWorker !== 'function') {
    throw new Error('createAntRunner requires a spawnWorker factory')
  }

  // playerId -> { worker, source, nextId, pending: Map<id, {resolve, timer}>, off }
  const players = new Map()

  // Attach a message handler that works for both worker_threads and Web Workers.
  // Returns a function that detaches it.
  const onMessage = (worker, handler) => {
    if (typeof worker.on === 'function') {
      worker.on('message', handler)
      return () => worker.off('message', handler)
    }
    const wrapped = ev => handler(ev && 'data' in ev ? ev.data : ev)
    if (typeof worker.addEventListener === 'function') {
      worker.addEventListener('message', wrapped)
      return () => worker.removeEventListener('message', wrapped)
    }
    worker.onmessage = wrapped
    return () => { worker.onmessage = null }
  }

  // Spin up a worker for a player and load `source` into it. Wires up the
  // single long-lived message handler that routes 'action'/'tickError'
  // responses back to their pending tick promises by id.
  const startWorker = (playerId, source) => {
    const worker = spawnWorker()
    const entry = {
      worker,
      source,
      nextId: 0,
      pending: new Map(),
      loaded: null,
      off: null
    }

    entry.off = onMessage(worker, msg => {
      if (!msg || typeof msg !== 'object') return
      if (msg.type === 'loaded') {
        if (entry.loaded) entry.loaded.resolve()
        return
      }
      if (msg.type === 'loadError') {
        if (entry.loaded) entry.loaded.reject(new Error(msg.error))
        return
      }
      // tick responses
      const p = entry.pending.get(msg.id)
      if (!p) return
      clearTimeout(p.timer)
      entry.pending.delete(msg.id)
      if (msg.type === 'action') p.resolve(msg.action)
      else p.resolve(undefined) // tickError -> safe no-op upstream
    })

    entry.loaded = deferred()
    worker.postMessage({ type: 'load', code: source })
    players.set(playerId, entry)
    return entry
  }

  // Tear down a player's worker (terminate + detach + fail in-flight ticks
  // with a safe no-op so callers never hang).
  const teardown = entry => {
    try { entry.off && entry.off() } catch (_) {}
    for (const [, p] of entry.pending) {
      clearTimeout(p.timer)
      p.resolve(undefined)
    }
    entry.pending.clear()
    try {
      const r = entry.worker.terminate()
      if (r && typeof r.then === 'function') r.then(() => {}, () => {})
    } catch (_) {}
  }

  return {
    // Load (or replace) a player's ant source. Resolves once the worker
    // confirms the code compiled; rejects on compile error.
    async loadAnt (playerId, source) {
      const existing = players.get(playerId)
      if (existing) teardown(existing)
      const entry = startWorker(playerId, source)
      await entry.loaded
    },

    // The callback sim/engine.js consumes. Dispatches antObj to the worker for
    // ant.player and races it against a hard deadline. On deadline/error,
    // terminates + respawns that player's worker and resolves to {}.
    async runAnt (ant, antObj) {
      const playerId = ant.player
      let entry = players.get(playerId)
      if (!entry) return {} // no ant loaded for this player -> no-op

      const id = entry.nextId++
      const action = await new Promise(resolve => {
        const timer = setTimeout(() => {
          if (entry.pending.has(id)) {
            entry.pending.delete(id)
            resolve(DEADLINE)
          }
        }, tickDeadlineMs)
        entry.pending.set(id, { resolve, timer })
        entry.worker.postMessage({ type: 'tick', id, ant: antObj })
      })

      if (action === DEADLINE) {
        // Runaway ant: kill its worker and bring it back for next tick.
        const source = entry.source
        teardown(entry)
        // Respawn so subsequent ticks for this player work again. We don't
        // await the reload here (the engine moves on); load happens async.
        const fresh = startWorker(playerId, source)
        fresh.loaded.catch(() => {})
        return {}
      }

      return action || {}
    },

    // Remove a player entirely (e.g. they left the game).
    removePlayer (playerId) {
      const entry = players.get(playerId)
      if (entry) {
        teardown(entry)
        players.delete(playerId)
      }
    },

    // Tear down every worker.
    destroy () {
      for (const [, entry] of players) teardown(entry)
      players.clear()
    }
  }
}

const DEADLINE = Symbol('deadline')

const deferred = () => {
  let resolve, reject
  const promise = new Promise((res, rej) => { resolve = res; reject = rej })
  promise.resolve = resolve
  promise.reject = reject
  return promise
}

export default createAntRunner
