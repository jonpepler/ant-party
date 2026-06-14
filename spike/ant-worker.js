// Sandbox worker: compiles a player's untrusted ant code ONCE, then runs it
// per tick. Mirrors the browser Web Worker design (postMessage protocol,
// terminate-to-kill). worker_threads has the same preemptive-termination
// semantics as a browser Worker, which is the property we're verifying.
import { parentPort } from 'node:worker_threads'

let step = null

parentPort.on('message', msg => {
  if (msg.type === 'load') {
    try {
      // Untrusted: the ant file returns a (senses) => action function.
      // In the browser this is the same new Function() compile step.
      step = new Function(msg.code)()
      parentPort.postMessage({ type: 'loaded' })
    } catch (err) {
      parentPort.postMessage({ type: 'loadError', error: String(err) })
    }
    return
  }

  if (msg.type === 'tick') {
    try {
      const action = step(msg.senses)
      parentPort.postMessage({ type: 'action', tick: msg.tick, action })
    } catch (err) {
      parentPort.postMessage({ type: 'tickError', tick: msg.tick, error: String(err) })
    }
  }
})
