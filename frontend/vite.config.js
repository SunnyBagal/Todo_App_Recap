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
    // The API runs on http://localhost:5000 (see server/routes/index.js).
    // A "proxy" means the browser only ever talks to localhost:5173, and Vite
    // forwards these paths to the server. That avoids CORS errors in the browser.
    proxy: {
      '/api': 'http://localhost:5000',
      '/signup': 'http://localhost:5000',
      '/signin': 'http://localhost:5000',
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
