// server/middleware/validateJWT.ts
import { Request, Response, NextFunction } from 'express'
import { createClient } from '@supabase/supabase-js'

// Use the public anon key for verifying JWTs from the client.
// SERVICE_KEY is only for privileged server calls (not for user auth verification).
const supabaseUrl =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey =
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase URL or anon key for JWT validation. Check your .env.'
  )
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    name?: string
  }
}

export async function validateJWT(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const token = authHeader.substring(7)

    // Verify token via Supabase Auth API
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }

    req.user = {
      id: user.id,
      email: user.email ?? '',
      name: user.user_metadata?.name ?? ''
    }

    next()
  } catch (err) {
    console.error('JWT validation error:', err)
    res.status(500).json({ message: 'Failed to validate token' })
  }
}
