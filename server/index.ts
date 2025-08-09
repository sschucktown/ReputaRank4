// server/index.ts
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { mountStaticClient } from './vite'

const app = express()
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// Optional: quick visibility during debug
// console.log('ENV present?', !!process.env.SUPABASE_URL, !!process.env.SUPABASE_SERVICE_KEY)

;(async () => {
  // Dynamically import AFTER dotenv ran
  const { registerRoutes } = await import('./routes')
  registerRoutes(app)

  if (process.env.NODE_ENV === 'production') {
    mountStaticClient(app)
  }

  const port = Number(process.env.PORT ?? 5000)
  app.listen(port, () => console.log(`[server] listening on http://localhost:${port}`))
})()
