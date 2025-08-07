import { supabase } from "./supabase";
import { User } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export class AuthService {
  private static instance: AuthService;
  private currentUser: AuthUser | null = null;
  private token: string | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async signIn(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error("Authentication failed");
    }

    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email || "",
      name: data.user.user_metadata?.name || data.user.email || "",
    };

    this.currentUser = user;
    this.token = data.session.access_token;

    return { user, token: data.session.access_token };
  }

  async signUp(email: string, password: string, name: string): Promise<{ user: AuthUser; token: string }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error("Registration failed");
    }

    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email || "",
      name: name,
    };

    this.currentUser = user;
    this.token = data.session.access_token;

    return { user, token: data.session.access_token };
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  async getCurrentSession(): Promise<{ user: AuthUser; token: string } | null> {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      this.currentUser = null;
      this.token = null;
      return null;
    }

    const user: AuthUser = {
      id: session.user.id,
      email: session.user.email || "",
      name: session.user.user_metadata?.name || session.user.email || "",
    };

    this.currentUser = user;
    this.token = session.access_token;

    return { user, token: session.access_token };
  }

  getToken(): string | null {
    return this.token;
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.token !== null;
  }
}

export const authService = AuthService.getInstance();
