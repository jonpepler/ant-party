# sim - portable Ant Party simulation

Phase 1 of the migration: the pure game logic, extracted from the Redis/socket/
vm2-bound server (`models/`) into a framework-agnostic ES module that runs in
both the browser host and Node.

## What's here

- `geometry.js` - Coord, translateShape, pointInPolygon (from utils/Geometry.js)
- `shapes.js` - nest shapes and per-player-count nest positions
- `gameData.js` - `newGameTemplate(players)` initial map data
- `engine.js` - the tick simulation and its pure helpers
- `index.js` - barrel export

## Design

The engine has no I/O. Ant code execution is injected via a `runAnt` callback,
so the same engine drives:

- the browser host, where `runAnt` posts senses to a per-player Web Worker
  (see ../spike for the sandbox), and
- Node tests, where `runAnt` is just a function.

```js
import { newGameTemplate, tick } from './index.js'

const map = newGameTemplate(['p1', 'p2'])
await tick(map, {
  runAnt: (ant, antObj) => ({ move: 2, pheromone: 'home' }),
  newAntRequests: ['p1'],
  antFileVersionFor: id => latestVersion[id]
})
```

`tick` mutates `map` in place and returns `{ mapData, finished }`. Scheduling
and broadcasting the result are the host's job, not the engine's.

## Test

```sh
npm test   # node tick.test.js
```

## Not ported (infrastructure, replaced in later phases)

- Redis persistence (Game/Player state) -> in-memory host state
- `io.emit('mapData')` -> Trystero broadcast to peers
- vm2 `Func` -> Web Worker sandbox

## Faithful-port notes

- `pointInPolygon` is an axis-aligned bounding-box check, kept as-is.
- Fixed a latent bug from `models/Game.js getObjAtPoint`, which read
  `.player`/`.health` off the filtered array instead of an element; here it
  uses the first match.
