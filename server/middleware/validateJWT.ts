import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-key";

// Note: Supabase configuration incomplete - JWT validation will require valid credentials

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export async function validateJWT(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.substring(7);

    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Set user info on request
    req.user = {
      id: data.user.id,
      email: data.user.email || "",
      name: data.user.user_metadata?.name || data.user.email || "",
    };

    next();
  } catch (error) {
    console.error("JWT validation error:", error);
    return res.status(401).json({ message: "Token validation failed" });
  }
}
