import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config for the Ant Party browser host.
// - base: './' so the built static site works on a GitHub Pages project page
//   (served from /<repo>/) without absolute-path asset 404s.
// - fs.allow: '..' lets us import the sibling ESM modules in ../sim and ../host,
//   which live outside the Vite root (client/).
// - Module web workers (new Worker(new URL(...), { type: 'module' })) are
//   supported out of the box; worker.format keeps them as ES modules so the
//   sandbox's `import` statements work.
export default defineConfig({
  base: './',
  plugins: [
    // This project keeps JSX inside .js files (CRA convention), so tell the
    // React plugin to also transform .js (not just .jsx).
    react({ include: /\.(js|jsx)$/ })
  ],
  // esbuild's dep pre-bundling needs the same hint for any .js that contains JSX.
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' }
    }
  },
  // Treat all .js as JSX at the esbuild layer too (covers the entry module and
  // any path the react plugin's babel transform does not reach during build).
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/,
    exclude: []
  },
  worker: {
    format: 'es'
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
})
