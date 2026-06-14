// worker_threads worker (used by tests and any Node host). Thin: the real
// compile/run logic lives in compileAnt.js. Mirrors the spike protocol:
//
//   in : { type: 'load', code }            out: { type: 'loaded' }
//                                            or  { type: 'loadError', error }
//   in : { type: 'tick', id, ant }         out: { type: 'action', id, action }
//                                            or  { type: 'tickError', id, error }
//
// `ant` is the antObj { senses, health }. `action` is the { move, pheromone }
// object returned by the compiled ant. `id` correlates request/response so the
// runner can match concurrent ticks.
import { parentPort } from 'node:worker_threads'
import { compileAnt } from './compileAnt.js'

let ant = null

parentPort.on('message', msg => {
  if (msg.type === 'load') {
    try {
      ant = compileAnt(msg.code)
      parentPort.postMessage({ type: 'loaded' })
    } catch (err) {
      ant = null
      parentPort.postMessage({ type: 'loadError', error: String(err) })
    }
    return
  }

  if (msg.type === 'tick') {
    try {
      if (!ant) throw new Error('no ant loaded')
      const action = ant.run(msg.ant)
      parentPort.postMessage({ type: 'action', id: msg.id, action })
    } catch (err) {
      parentPort.postMessage({ type: 'tickError', id: msg.id, error: String(err) })
    }
  }
})
