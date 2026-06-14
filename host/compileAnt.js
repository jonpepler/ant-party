// Pure, environment-agnostic ant compiler. No worker code lives here so it can
// be unit-tested directly in Node. This faithfully replicates the old vm2
// (models/Func.js) completion-value semantics:
//
//   The ant source is an IIFE expression whose completion value is the
//   actions object, e.g.
//     (() => { const { senses, health } = ant; return { move: 0, pheromone: 'x' } })()
//   with `ant` injected as { senses, health }.
//
// We compile the source ONCE into a reusable function via
//   new Function('ant', 'return (' + source + ')')
// and then call it with the antObj on every tick. Wrapping the source in
// `return (...)` makes the function return the completion value of the IIFE,
// matching what vm2's `vm.run(script)` returned.

// compileAnt(source) -> { run(antObj) -> actions }
//
// Throws synchronously if the source fails to COMPILE (syntax error etc).
// run(antObj) throws if the ant code throws at RUNTIME.
export function compileAnt (source) {
  let fn
  try {
    // eslint-disable-next-line no-new-func
    fn = new Function('ant', 'return (' + source + ')')
  } catch (err) {
    throw new CompileError(String(err))
  }

  return {
    run (antObj) {
      // Any throw here is a runtime error from untrusted code; let it
      // propagate so the caller (worker / runner) can decide what to do.
      return fn(antObj)
    }
  }
}

export class CompileError extends Error {
  constructor (message) {
    super(message)
    this.name = 'CompileError'
  }
}

export default compileAnt
