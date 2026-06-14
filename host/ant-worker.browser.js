// Browser Web Worker. Identical protocol to ant-worker.node.js but using the
// self.onmessage / postMessage API instead of worker_threads parentPort.
//
// NOTE: this file CANNOT be exercised in the headless sandbox (no browser /
// no Chromium). It needs in-browser verification. The Node worker
// (ant-worker.node.js) covers the same logic and is tested in antRunner.test.js;
// the only difference here is the messaging surface, which mirrors that worker
// exactly.
//
// Loaded as an ES module worker:
//   new Worker(new URL('./ant-worker.browser.js', import.meta.url), { type: 'module' })
import { compileAnt } from './compileAnt.js'

let ant = null

self.onmessage = ev => {
  const msg = ev.data
  if (msg.type === 'load') {
    try {
      ant = compileAnt(msg.code)
      self.postMessage({ type: 'loaded' })
    } catch (err) {
      ant = null
      self.postMessage({ type: 'loadError', error: String(err) })
    }
    return
  }

  if (msg.type === 'tick') {
    try {
      if (!ant) throw new Error('no ant loaded')
      const action = ant.run(msg.ant)
      self.postMessage({ type: 'action', id: msg.id, action })
    } catch (err) {
      self.postMessage({ type: 'tickError', id: msg.id, error: String(err) })
    }
  }
}
