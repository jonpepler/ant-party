// Browser ant runner: wires the transport-agnostic createAntRunner from the
// host module to real module Web Workers that load the host's browser sandbox
// (ant-worker.browser.js).
//
// Vite understands `new Worker(new URL('...', import.meta.url), { type: 'module' })`
// and will bundle the worker (and its imports, e.g. compileAnt.js) as a separate
// chunk. The relative URL is resolved from THIS file at build time.
import { createAntRunner } from '../../../host/antRunner.js'

const spawnWorker = () =>
  new Worker(
    new URL('../../../host/ant-worker.browser.js', import.meta.url),
    { type: 'module' }
  )

// tickDeadlineMs is left at the antRunner default (50ms): the hard per-tick
// budget for one ant's worker before it is killed and respawned.
export const createBrowserAntRunner = () => createAntRunner({ spawnWorker })

export default createBrowserAntRunner
