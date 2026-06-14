// The host orchestrator: ties the wire protocol, the simulation engine, and the
// per-player ant runner into a running game. It is transport- and runner-
// injected so it can be driven by a real Trystero peer in the browser or a fake
// in Node tests.
//
// transport shape:
//   send(action, data, peerId?)  // peerId omitted = broadcast to all peers
//   on(action, handler)          // handler(data, peerId)
//   onPeerJoin(cb)               // cb(peerId)
//   onPeerLeave(cb)              // cb(peerId)
//
// antRunner shape (see ./antRunner.js):
//   loadAnt(playerId, source), runAnt(ant, antObj), removePlayer(playerId), destroy()
import { ACTIONS } from '../sim/protocol.js'
import { newGameTemplate } from '../sim/gameData.js'
import { tick } from '../sim/engine.js'

export const generateGamecode = () => {
  const min = 111111
  const max = 999999
  return String(Math.floor(Math.random() * (max - min + 1)) + min)
}

export const createHostGame = ({
  transport,
  antRunner,
  gamecode = generateGamecode(),
  tickIntervalMs = 1000,
  scheduler = { setInterval, clearInterval },
  onUpdate = () => {}
}) => {
  // peerId -> { peerId, playerID, name, versions: [source], latestVersion }
  const players = new Map()
  const spawnQueue = []
  let mapData = null
  let started = false
  let finished = false
  let loopHandle = null

  const snapshot = () => ({
    gamecode,
    started,
    finished,
    mapData,
    players: [...players.values()].map(p => ({ id: p.playerID, name: p.name }))
  })

  const emitUpdate = () => onUpdate(snapshot())

  const playerByPeer = peerId => players.get(peerId)

  const addPlayer = (peerId, { playerName } = {}) => {
    if (started) return // no joining a game in progress
    if (!players.has(peerId)) {
      players.set(peerId, {
        peerId,
        playerID: peerId, // peerId is a stable per-connection id
        name: playerName || 'anon',
        versions: [],
        latestVersion: -1
      })
    }
    const player = players.get(peerId)
    transport.send(ACTIONS.JOIN_RESULT, { result: true, playerID: player.playerID }, peerId)
    emitUpdate()
  }

  const removePlayer = peerId => {
    const player = playerByPeer(peerId)
    if (!player) return
    players.delete(peerId)
    antRunner.removePlayer(player.playerID)
    emitUpdate()
  }

  const updateAntFile = async (peerId, { antFile } = {}) => {
    const player = playerByPeer(peerId)
    if (!player) return
    player.versions.push(antFile)
    player.latestVersion = player.versions.length - 1
    // Only ack once the code actually compiles, so the player learns of
    // compile errors and the worker is live before the next tick uses it.
    try {
      await antRunner.loadAnt(player.playerID, antFile)
      transport.send(
        ACTIONS.FILE_RESULT,
        { result: true, liveAntFileVersion: player.latestVersion },
        peerId
      )
    } catch (err) {
      transport.send(
        ACTIONS.FILE_RESULT,
        { result: false, error: String((err && err.message) || err), liveAntFileVersion: player.latestVersion },
        peerId
      )
    }
  }

  const requestSpawn = peerId => {
    const player = playerByPeer(peerId)
    if (player) spawnQueue.push(player.playerID)
  }

  const antFileVersionFor = playerID => {
    const player = [...players.values()].find(p => p.playerID === playerID)
    return player ? player.latestVersion : 0
  }

  // Advance the sim one tick and broadcast the new map. Public for testing.
  const tickOnce = async () => {
    const newAntRequests = spawnQueue.splice(0, spawnQueue.length)
    const result = await tick(mapData, {
      runAnt: antRunner.runAnt,
      newAntRequests,
      antFileVersionFor
    })
    mapData = result.mapData
    finished = result.finished
    transport.send(ACTIONS.MAP_DATA, mapData)
    emitUpdate()
    if (finished) stop()
  }

  const start = () => {
    if (started) return
    const playerIDs = [...players.values()].map(p => p.playerID)
    mapData = newGameTemplate(playerIDs)
    started = true
    transport.send(ACTIONS.GAME_START, { mapData })
    emitUpdate()
    loopHandle = scheduler.setInterval(() => { tickOnce() }, tickIntervalMs)
  }

  const stop = () => {
    if (loopHandle !== null) {
      scheduler.clearInterval(loopHandle)
      loopHandle = null
    }
    antRunner.destroy()
  }

  // Wire transport handlers.
  transport.on(ACTIONS.JOIN, (data, peerId) => addPlayer(peerId, data))
  transport.on(ACTIONS.ANT_FILE, (data, peerId) => updateAntFile(peerId, data))
  transport.on(ACTIONS.SPAWN, (_data, peerId) => requestSpawn(peerId))
  transport.onPeerLeave(removePlayer)

  return { gamecode, getState: snapshot, start, stop, tickOnce }
}
