import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const extraHosts = (env.ALLOWED_HOSTS || env.VITE_ALLOWED_HOSTS || '')
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean)

  // Auto-detect container vs host:
  // Inside Docker container, backend is reachable at 'http://backend:5173'
  // Outside Docker (local machine), backend is reachable at 'http://localhost:5173'
  const isDocker =
    fs.existsSync('/.dockerenv') ||
    fs.existsSync('/run/.containerenv') ||
    Boolean(process.env.DOCKER_CONTAINER)

  const defaultBackend = isDocker ? 'http://backend:5173' : 'http://localhost:5173'
  const backendTarget = process.env.BACKEND_URL || env.BACKEND_URL || defaultBackend

  return {
    plugins: [react()],
    server: {
      port: 8005,
      host: true,
      allowedHosts: Array.from(
        new Set([
          'localhost',
          '127.0.0.1',
          ...extraHosts,
        ])
      ),
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('error', (err, _req, res: any) => {
              console.warn(`[vite proxy error to ${backendTarget}]:`, err.message)
              if (res && !res.headersSent && typeof res.writeHead === 'function') {
                res.writeHead(502, { 'Content-Type': 'application/json' })
                res.end(
                  JSON.stringify({
                    detail:
                      'Backend server is starting up or unreachable. Please retry in a few seconds.',
                  })
                )
              }
            })
          },
        },
      },
    },
  }
})
