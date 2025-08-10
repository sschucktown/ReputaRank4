// server/routes.ts
import type { Express, Request, Response } from 'express'
import { supabase } from './storage'

export function registerRoutes(app: Express) {
  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ ok: true })
  })

  // ---- Clients ----

  // GET /api/clients
  app.get('/api/clients', async (_req: Request, res: Response) => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: error.message })
    }
    res.json({ data })
  })

  // POST /api/clients
  app.post('/api/clients', async (req: Request, res: Response) => {
    const { name, email, user_id } = req.body ?? {}

    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required' })
    }

    const { data, error } = await supabase
      .from('clients')
      .insert([{ name, email, user_id: user_id ?? null }])
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }
    res.status(201).json({ data })
  })

  // ---- Dashboard (example) ----
  // Simple counts example for a basic dashboard: requests by status
  app.get('/api/dashboard/stats', async (_req: Request, res: Response) => {
    const statuses = ['pending', 'in_review', 'completed'] as const

    try {
      const results = await Promise.all(
        statuses.map(async (status) => {
          const { count, error } = await supabase
            .from('requests')
            .select('*', { count: 'exact', head: true })
            .eq('status', status)

          if (error) throw error
          return { status, count: count ?? 0 }
        })
      )

      res.json({
        data: {
          requestsByStatus: results,
        },
      })
    } catch (err: any) {
      res.status(500).json({ error: err.message ?? 'Failed to load stats' })
    }
  })
}
