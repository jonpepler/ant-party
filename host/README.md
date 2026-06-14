# Host side (Phase 2)

The browser tab that hosts a game is authoritative. It runs every player's
untrusted ant code in its own sandboxed worker (one worker per player) and feeds
the results into the pure simulation engine in `../sim/engine.js`.

This directory is the host's ant-execution layer. It is transport-agnostic: no
Trystero / node-datachannel code lives here. The transport wiring is a later
phase.

## Pieces

- `../sim/protocol.js` — shared message protocol (action keys, room id, app id).
  This is the single source of truth shared with the CLI repo. Do not change its
  keys or shapes.

- `compileAnt.js` — pure, environment-agnostic compiler. `compileAnt(source)`
  compiles the untrusted ant source ONCE into a reusable function and returns
  `{ run(antObj) }`. It replicates the old vm2 (`models/Func.js`)
  completion-value semantics: the source is an IIFE expression whose completion
  value is the actions object, compiled via
  `new Function('ant', 'return (' + source + ')')` and called with the antObj
  each tick. Compile errors throw synchronously (as `CompileError`); runtime
  errors propagate out of `run`. No worker code, so it is directly unit-testable.

- `ant-worker.node.js` — a `worker_threads` worker (parentPort) wrapping
  `compileAnt`. Used by tests and any Node host.

- `ant-worker.browser.js` — a browser Web Worker (`self.onmessage` /
  `postMessage`) wrapping `compileAnt`. Same protocol as the node worker; only
  the messaging surface differs. NEEDS IN-BROWSER VERIFICATION (see Caveats).

  Both workers speak the same protocol:

  ```
  in : { type: 'load', code }      out: { type: 'loaded' } | { type: 'loadError', error }
  in : { type: 'tick', id, ant }   out: { type: 'action', id, action } | { type: 'tickError', id, error }
  ```

- `antRunner.js` — the per-player worker pool. `createAntRunner({ spawnWorker,
  tickDeadlineMs = 50 })` returns
  `{ loadAnt, runAnt, removePlayer, destroy }`. `spawnWorker()` is injected so
  the pool is testable: pass a `worker_threads` factory in Node, a `Worker`
  factory in the browser. It tolerates both the `.on('message')` (node) and
  `addEventListener`/`onmessage` (browser) listener styles.

- `antRunner.test.js` — node:assert tests using REAL `worker_threads` workers.

## How it plugs into sim/engine.js

`engine.js`'s `tick(mapData, { runAnt, ... })` calls `runAnt(ant, antObj)` for
each ant and reads back a `{ move, pheromone }` action. `createAntRunner`
produces exactly that callback:

```js
import { createAntRunner } from './antRunner.js'
import { tick } from '../sim/engine.js'
import { Worker } from 'node:worker_threads' // or Web Worker in the browser

const runner = createAntRunner({
  spawnWorker: () => new Worker(new URL('./ant-worker.node.js', import.meta.url)),
  tickDeadlineMs: 50
})

// When a player sends their ant file (ACTIONS.ANT_FILE):
await runner.loadAnt(playerID, antSource)

// Each game tick:
await tick(mapData, { runAnt: runner.runAnt, newAntRequests, antFileVersionFor })
```

### Security / perf boundary

`runAnt` dispatches the antObj to the ant's player worker and races it against a
hard deadline (`tickDeadlineMs`). If the worker misses the deadline (e.g. an
infinite loop) or errors, the runner `terminate()`s that one worker, respawns it
with the player's last known source, and resolves the tick to a safe no-op `{}`.
A runaway ant can therefore never hang the host, and it cannot affect any other
player (one worker each).

## Running the tests

```
node antRunner.test.js
# or
npm test
```

## Caveats

- `ant-worker.browser.js` cannot run in the headless sandbox (no browser /
  Chromium), so it has not been executed here. Its logic is identical to
  `ant-worker.node.js` (which the test suite exercises against real workers);
  only the postMessage surface differs. Verify it in a real browser tab, loaded
  as a module worker:
  `new Worker(new URL('./ant-worker.browser.js', import.meta.url), { type: 'module' })`.
