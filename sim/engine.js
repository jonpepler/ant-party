// The pure simulation engine, ported from the non-Redis parts of
// models/Game.js. Ant code execution is injected via `runAnt` so the same
// engine works with a browser Web Worker (host) or a plain function (tests).
import { pointInPolygon } from './geometry.js'

export const translateDirectionToMovement = direction => {
  switch (direction) {
    case 0: return { x: 0, y: -1 }
    case 1: return { x: 1, y: -1 }
    case 2: return { x: 1, y: 0 }
    case 3: return { x: 1, y: 1 }
    case 4: return { x: 0, y: 1 }
    case 5: return { x: -1, y: 1 }
    case 6: return { x: -1, y: 0 }
    case 7: return { x: -1, y: -1 }
  }
}

export const newAnt = (x, y, player, antFileVersion) => ({
  x, y, health: 10, player, antFileVersion
})

export const coordOccupied = (mapData, posX, posY) =>
  mapData.nests.some(nest =>
    pointInPolygon(posX, posY, nest.points.map(p => [p.x, p.y]))) ||
  mapData.ants.some(ant => ant.x === posX && ant.y === posY)

export const getObjAtPoint = (mapData, posX, posY) => {
  const nests = mapData.nests.filter(nest =>
    pointInPolygon(posX, posY, nest.points.map(p => [p.x, p.y])))
  if (nests.length) {
    return { item: 'nest', info: { player: nests[0].player, health: nests[0].health } }
  }
  const ants = mapData.ants.filter(ant => ant.x === posX && ant.y === posY)
  if (ants.length) {
    return { item: 'ant', info: { player: ants[0].player, health: ants[0].health } }
  }
  return undefined
}

export const getPheromones = (mapData, posX, posY) =>
  mapData.pheromones
    .filter(p => p.x === posX && p.y === posY)
    .map(p => ({ item: 'pheromone', info: { pheromone: p.tag } }))

// Senses an ant receives: the 8 surrounding cells plus its own health.
export const buildSenses = (mapData, ant) => ({
  senses: Array.from({ length: 8 }).map((_, index) => {
    const sense = []
    const direction = translateDirectionToMovement(index)
    const sx = ant.x + direction.x
    const sy = ant.y + direction.y
    const obj = getObjAtPoint(mapData, sx, sy)
    if (obj) sense.push(obj)
    sense.push(...getPheromones(mapData, sx, sy))
    return sense
  }),
  health: ant.health
})

// Free nest spawn point not currently occupied by an ant.
export const randomFreePointSpawnPoint = (mapData, nest) => {
  const free = nest.spawnPoints.filter(sp =>
    mapData.ants.every(ant => sp.x !== ant.x || sp.y !== ant.y))
  return free.length ? free[Math.floor(Math.random() * free.length)] : null
}

// Advances the simulation by one tick, mutating mapData in place.
//   runAnt(ant, antObj) -> { move?, pheromone? }   (may be async)
//   newAntRequests        -> array of playerIDs requesting a new ant
//   antFileVersionFor(id) -> latest ant file version for a player (optional)
export const tick = async (mapData, { runAnt, newAntRequests = [], antFileVersionFor } = {}) => {
  let finished = false

  for (const ant of mapData.ants) {
    const antObj = buildSenses(mapData, ant)
    const actions = (await runAnt(ant, antObj)) || {}

    if (actions.pheromone) {
      mapData.pheromones.push({ tag: actions.pheromone, x: ant.x, y: ant.y })
    }
    if (actions.move !== undefined && actions.move !== null) {
      const movement = translateDirectionToMovement(actions.move)
      const newPosX = ant.x + movement.x
      const newPosY = ant.y + movement.y
      if (!coordOccupied(mapData, newPosX, newPosY)) {
        ant.x = newPosX
        ant.y = newPosY
      }
    }
  }

  for (const nest of mapData.nests) {
    if (nest.health <= 0) finished = true
  }

  for (const playerID of newAntRequests) {
    const nest = mapData.nests.find(nest => nest.player === playerID)
    if (nest && nest.health > 0) {
      const spawnPoint = randomFreePointSpawnPoint(mapData, nest)
      if (spawnPoint) {
        const version = antFileVersionFor ? antFileVersionFor(playerID) : 0
        mapData.ants.push(newAnt(spawnPoint.x, spawnPoint.y, playerID, version))
      }
    }
  }

  return { mapData, finished }
}
