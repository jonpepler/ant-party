// Shared Ant Party message protocol for the Trystero transport.
// Trystero action keys must be <= 12 bytes; logical names map to short keys.
export const APP_ID = 'ant-party'
export const roomId = gamecode => `ant-party-${gamecode}`
export const ACTIONS = {
  JOIN: 'join',           // player -> host: { gamecode, playerName }
  JOIN_RESULT: 'joinRes', // host -> player: { result, playerID, error }
  ANT_FILE: 'antFile',    // player -> host: { antFile, antFileVersion }
  FILE_RESULT: 'fileRes', // host -> player: { result, liveAntFileVersion, error }
  SPAWN: 'spawn',         // player -> host: {} (request a new ant)
  GAME_START: 'start',    // host -> all: { mapData }
  MAP_DATA: 'map'         // host -> all: mapData (per tick)
}
