// server/vite.ts
import type { Express } from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function mountStaticClient(app: Express) {
  // Adjust if your client build path differs
  const distPath = path.resolve(__dirname, '..', 'client', 'dist')

  app.use(express.static(distPath))

  // SPA fallback
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}
