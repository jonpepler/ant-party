// Trystero-backed transport implementing the interface hostGame.js expects.
//
// hostGame talks to "transport" with this shape:
//   send(action, data, peerId?)  // peerId omitted = broadcast to all peers
//   on(action, handler)          // handler(data, peerId)
//   onPeerJoin(cb)               // cb(peerId)
//   onPeerLeave(cb)              // cb(peerId)
//
// Under the hood each logical ACTION becomes a Trystero "action" channel
// created with room.makeAction(key). Trystero action keys must be <= 12 bytes;
// the values in ACTIONS already satisfy that, so we use them verbatim as keys.
//
// Trystero uses native WebRTC in the browser (no polyfill), with a public
// signalling/relay strategy (default: BitTorrent trackers). We join as the host
// peer; player peers (the CLI) join the same room by gamecode.
import { joinRoom, selfId } from 'trystero'
import { APP_ID, roomId, ACTIONS } from '../../../sim/protocol.js'

export const createTrysteroTransport = (gamecode) => {
  const room = joinRoom({ appId: APP_ID }, roomId(gamecode))

  // Pre-create one Trystero action channel per protocol ACTION. makeAction
  // returns [send, receive]; we keep both so send()/on() can route by action.
  const channels = {}
  for (const key of Object.values(ACTIONS)) {
    const [sendFn, getFn] = room.makeAction(key)
    channels[key] = { send: sendFn, get: getFn }
  }

  return {
    selfId,

    // peerId omitted => broadcast to all peers; otherwise target one peer.
    send (action, data, peerId) {
      const channel = channels[action]
      if (!channel) throw new Error(`unknown action: ${action}`)
      // Trystero sendFn(data, targetPeers?) where targetPeers can be a single
      // id or array; omitting it broadcasts.
      return peerId ? channel.send(data, peerId) : channel.send(data)
    },

    on (action, handler) {
      const channel = channels[action]
      if (!channel) throw new Error(`unknown action: ${action}`)
      // Trystero getFn delivers (data, peerId, metadata); hostGame only needs
      // (data, peerId).
      channel.get((data, peerId) => handler(data, peerId))
    },

    onPeerJoin (cb) {
      room.onPeerJoin(cb)
    },

    onPeerLeave (cb) {
      room.onPeerLeave(cb)
    },

    // Not part of the hostGame interface, but handy for teardown.
    leave () {
      return room.leave()
    }
  }
}

export default createTrysteroTransport
