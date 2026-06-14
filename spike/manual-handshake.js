// Proves node-datachannel establishes a real WebRTC data channel in Node,
// independent of any external signaling relay. Two peer connections in one
// process exchange SDP + ICE directly and send messages over a data channel.
import { RTCPeerConnection } from 'node-datachannel/polyfill'

const a = new RTCPeerConnection()
const b = new RTCPeerConnection()

// Manual signaling: forward ICE candidates between the two peers.
a.onicecandidate = e => e.candidate && b.addIceCandidate(e.candidate)
b.onicecandidate = e => e.candidate && a.addIceCandidate(e.candidate)

let pass = false
const timeout = setTimeout(() => {
  console.log('FAIL: no round trip within 15s')
  process.exit(1)
}, 15000)

const dc = a.createDataChannel('spike')
dc.onopen = () => {
  console.log('A: data channel open, sending ping')
  dc.send('ping')
}
dc.onmessage = e => {
  console.log('A: received', e.data)
  if (e.data === 'pong') {
    pass = true
    clearTimeout(timeout)
    console.log('=== PASS: node-datachannel data channel round-trip works ===')
    setTimeout(() => process.exit(0), 100)
  }
}

b.ondatachannel = e => {
  const ch = e.channel
  ch.onmessage = m => {
    console.log('B: received', m.data)
    if (m.data === 'ping') ch.send('pong')
  }
}

const offer = await a.createOffer()
await a.setLocalDescription(offer)
await b.setRemoteDescription(offer)
const answer = await b.createAnswer()
await b.setLocalDescription(answer)
await a.setRemoteDescription(answer)
console.log('signaling exchanged, negotiating ICE...')
