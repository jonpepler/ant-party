# Phase 0a spike: Trystero as the Node peer transport

Goal: prove the Ant Party CLI can be a WebRTC peer in Node (via Trystero +
node-datachannel) before we commit to the browser-host migration.

## Result: works

- `node-datachannel` native binary loads in Node 22.
- Raw WebRTC data-channel round-trip works in Node (`manual-handshake.js`).
- Full Trystero `joinRoom -> onPeerJoin -> makeAction` round-trip works in Node
  (`trystero-local-test.js`).

## Sandbox caveats (not real-world problems)

This was built in a network-restricted container, so:

- Public signaling relays (BitTorrent trackers, Nostr, MQTT brokers) are
  unreachable here. Real players on the open internet use them with no setup.
- Public STUN (Google) is also unreachable, so the tests force
  `rtcConfig.iceServers = []` and rely on localhost host candidates. Real peers
  across networks will need STUN/TURN.

To test entirely on localhost we run a local MQTT-over-WebSocket broker
(`local-broker.js`) and point Trystero at it via `relayUrls`.

## Run

```sh
npm install
npm run test:datachannel   # raw node-datachannel round-trip
npm run test:trystero      # full Trystero round-trip via local broker
```

## Files

- `node-peer.js` - a Trystero peer for Node (the shape the CLI will take).
- `manual-handshake.js` - two RTCPeerConnections, manual signaling, no relay.
- `local-broker.js` - local MQTT/ws broker for signaling on localhost.
- `trystero-local-test.js` - spawns broker + two peers, checks round-trip.
- `roundtrip-test.js` - same two-peer check against public relays (fails in
  this sandbox; useful to run on a normal network).

## Takeaways for the migration

- Use Trystero. Room name = gamecode. `makeAction` maps onto our message types.
- The CLI keeps its FileWatcher/Ink UI; only the transport changes.
- Production needs real STUN/TURN config; signaling can use a public strategy
  (nostr/mqtt) or a self-hosted relay.
