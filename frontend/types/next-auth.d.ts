import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string
      email: string
      name: string
      role?: string
    } & DefaultSession["user"];
  }

  interface User {
    id: string
    email: string
    name: string
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name: string
    role?: string
    accessToken?: string // Fix: Added for OAuth access tokens
    refreshToken?: string // Fix: Added for OAuth refresh tokens (offline access)
  }
}







