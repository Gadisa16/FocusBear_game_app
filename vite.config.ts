import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    {
      name: 'api-generate-tasks-dev',
      configureServer(server) {
        server.middlewares.use('/api/generate-tasks', async (req, res, next) => {
          if (req.method !== 'POST') return next()
          try {
            const chunks: Buffer[] = []
            for await (const c of req) chunks.push(c as Buffer)
            const bodyText = Buffer.concat(chunks).toString('utf8') || '{}'
            const body = JSON.parse(bodyText)
            const goal = String(body?.goal || '').trim()
            const mod = await import('./api/generate-tasks.ts')
            const tasks = await mod.generateTasksForGoal(goal)
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ tasks }))
          } catch (err: any) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err?.message || 'Internal error' }))
          }
        })
      }
    }
  ],
})
