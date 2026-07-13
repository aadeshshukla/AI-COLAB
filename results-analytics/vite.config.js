import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import getAcademicResult from './api/getAcademicResult.js'

function academicResultDevApi() {
  return {
    name: 'academic-result-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/getAcademicResult', async (req, res, next) => {
        try {
          const url = new URL(req.url || '/', 'http://localhost')
          req.query = Object.fromEntries(url.searchParams.entries())

          const vercelLikeResponse = {
            setHeader: (...args) => res.setHeader(...args),
            status(code) {
              res.statusCode = code
              return this
            },
            json(payload) {
              if (!res.headersSent) {
                res.setHeader('Content-Type', 'application/json')
              }
              res.end(JSON.stringify(payload))
              return this
            },
          }

          await getAcademicResult(req, vercelLikeResponse)
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), academicResultDevApi()],
})
