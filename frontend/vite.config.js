import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // tailwindcss() compiles Tailwind classes during dev/build.
  // In Tailwind v4 there is no tailwind.config.js and no PostCSS setup:
  // this plugin plus `@import "tailwindcss";` in index.css is the whole setup.
  plugins: [react(), tailwindcss()],

  server: {
    // The API runs on the port in server/.env (PORT=3000).
    // A "proxy" means the browser only ever talks to localhost:5173, and Vite
    // forwards these paths to the server. That avoids CORS errors in the browser.
    //
    // NOTE: do not use port 5000 on macOS — AirPlay Receiver listens there and
    // answers every request with 403, which looks exactly like a broken API.
    proxy: {
      '/api': 'http://localhost:3000',
      '/signup': 'http://localhost:3000',
      '/signin': 'http://localhost:3000',
    },
  },

  test: {
    // Vitest config for the examples in src/learn/.
    // jsdom gives tests a fake browser so React components can render.
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.js',
  },
})
