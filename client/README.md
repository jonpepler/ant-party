# Ant Party client (browser host)

This is the **authoritative browser host** for Ant Party. There is no game
server: this page generates a gamecode, joins a WebRTC room as the host peer
(via [Trystero](https://github.com/dmotz/trystero)), accepts player peers (the
CLI), runs the simulation itself, and broadcasts map data each tick.

It is a static site built with [Vite](https://vitejs.dev/) (React plugin) and
deployable to GitHub Pages.

## How it fits together

- `src/host/trysteroTransport.js` implements the transport interface that
  `host/hostGame.js` expects, backed by Trystero (native WebRTC).
- `src/host/browserAntRunner.js` wires `host/antRunner.js` to real module Web
  Workers running the `host/ant-worker.browser.js` sandbox (one worker per
  player, isolating untrusted ant code).
- `src/components/GameSetup.js` is the host page. On mount it generates a
  gamecode, builds the transport + ant runner, and starts the orchestrator
  (`createHostGame`). The player list and all map data come from the
  orchestrator's `onUpdate` snapshot.
- `src/components/Game.js` + `src/components/p5/GameSketch.js` render the map
  data the simulation produces. The host runs the tick loop; these just draw.

The simulation (`../sim`) and orchestrator/runner (`../host`) are imported
directly as sibling ESM modules. Vite's `server.fs.allow: ['..']` permits the
out-of-root imports and bundles the module worker as a separate chunk.

## Scripts

```sh
npm install
npm run dev      # Vite dev server (http://localhost:5173)
npm run build    # static bundle into dist/
npm run preview  # serve the built dist/ locally
npm run lint     # eslint --fix
```

`vite.config.js` sets `base: './'` so the built site works on a GitHub Pages
project page (served from `/<repo>/`).

## Deploying to GitHub Pages

A workflow at `.github/workflows/pages.yml` (repo root) builds `client/` and
publishes `client/dist` to Pages on push to `main`/`master`. Enable Pages in the
repo settings with "Source: GitHub Actions".

To deploy manually:

```sh
cd client
npm ci
npm run build
# publish the contents of dist/ to your Pages branch / hosting
```

## What still needs in-browser + real-network verification

The headless sandbox has no browser and cannot reach WebRTC signalling/relays,
so the live peer-to-peer round trip could not be exercised here. The build is
verified; the following need a real browser and network:

1. **Host page loads** and renders the setup screen with a generated 6-digit
   gamecode (no console errors; Trystero joins the room).
2. **A CLI peer connects** on that gamecode: it sends `JOIN`, appears in the
   player list, and receives `JOIN_RESULT`.
3. **Ant file upload**: the CLI sends `ANT_FILE`; the host compiles it in a Web
   Worker and replies `FILE_RESULT` (success or compile error).
4. **Start + simulation**: clicking Start broadcasts `GAME_START`, the tick loop
   runs, `MAP_DATA` is broadcast each tick, and **ants render and move** in the
   p5 canvas.
5. **Spawn / leave**: `SPAWN` requests add ants; a peer leaving removes its
   player and tears down its worker.
6. **GitHub Pages**: confirm assets load over the `./`-relative base on the
   project-page URL.
