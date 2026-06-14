// Plain Node test for the pure sim engine. No framework, no browser.
import assert from 'node:assert/strict'
import { newGameTemplate } from './gameData.js'
import { tick, buildSenses, coordOccupied } from './engine.js'

let passed = 0
const test = async (name, fn) => {
  await fn()
  passed++
  console.log(`ok - ${name}`)
}

await test('newGameTemplate builds one nest per player', () => {
  const map = newGameTemplate(['p1', 'p2'])
  assert.equal(map.nests.length, 2)
  assert.equal(map.nests[0].player, 'p1')
  assert.equal(map.nests[0].health, 100)
  assert.deepEqual(map.ants, [])
})

await test('new ant requests spawn ants at free nest spawn points', async () => {
  const map = newGameTemplate(['p1', 'p2'])
  await tick(map, { runAnt: () => ({}), newAntRequests: ['p1', 'p2'] })
  assert.equal(map.ants.length, 2)
  const p1Ant = map.ants.find(a => a.player === 'p1')
  const spawnable = map.nests[0].spawnPoints.some(sp => sp.x === p1Ant.x && sp.y === p1Ant.y)
  assert.ok(spawnable, 'ant spawned on a nest spawn point')
  assert.equal(p1Ant.health, 10)
})

await test('an ant moves in the direction it returns', async () => {
  const map = newGameTemplate(['p1'])
  await tick(map, { runAnt: () => ({}), newAntRequests: ['p1'] })
  const ant = map.ants[0]
  const before = { x: ant.x, y: ant.y }
  await tick(map, { runAnt: () => ({ move: 2 }) }) // east: x+1
  assert.equal(ant.x, before.x + 1)
  assert.equal(ant.y, before.y)
})

await test('a move into an occupied cell is blocked', async () => {
  const map = newGameTemplate(['p1'])
  // Place two ants adjacent so one tries to move onto the other.
  map.ants.push({ x: 500, y: 500, health: 10, player: 'p1', antFileVersion: 0 })
  map.ants.push({ x: 501, y: 500, health: 10, player: 'p1', antFileVersion: 0 })
  assert.ok(coordOccupied(map, 501, 500))
  const mover = map.ants[0]
  await tick(map, { runAnt: ant => (ant === mover ? { move: 2 } : {}) }) // east into peer
  assert.equal(mover.x, 500, 'blocked, did not move')
})

await test('a returned pheromone is deposited at the ant position', async () => {
  const map = newGameTemplate(['p1'])
  map.ants.push({ x: 300, y: 300, health: 10, player: 'p1', antFileVersion: 0 })
  await tick(map, { runAnt: () => ({ pheromone: 'home' }) })
  assert.equal(map.pheromones.length, 1)
  assert.deepEqual(map.pheromones[0], { tag: 'home', x: 300, y: 300 })
})

await test('senses report a neighbouring ant', () => {
  const map = newGameTemplate(['p1'])
  const ant = { x: 300, y: 300, health: 7, player: 'p1', antFileVersion: 0 }
  map.ants.push(ant, { x: 301, y: 300, health: 10, player: 'p2', antFileVersion: 0 })
  const obj = buildSenses(map, ant)
  assert.equal(obj.health, 7)
  // direction 2 is east (x+1)
  assert.ok(obj.senses[2].some(s => s.item === 'ant' && s.info.player === 'p2'))
})

await test('game finishes when a nest health hits zero', async () => {
  const map = newGameTemplate(['p1', 'p2'])
  map.nests[1].health = 0
  const { finished } = await tick(map, { runAnt: () => ({}) })
  assert.equal(finished, true)
})

console.log(`\n${passed} passing`)
