import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Cookie configuration for both localhost and production (Vercel)
  // Fix: Ensures cookies work correctly in all environments
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production", // Only secure in production (HTTPS)
      },
    },
  },

  providers: [
    // Google OAuth Provider with proper configuration
    // Fix: Added prompt, access_type, and PKCE support for better OAuth flow
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // Force consent screen to ensure refresh tokens are granted
          prompt: "consent",
          // Request offline access to get refresh tokens
          access_type: "offline",
          // Use authorization code flow (required for PKCE)
          response_type: "code",
        },
      },
      // PKCE is automatically enabled by NextAuth.js v4, but we ensure it's working
      checks: ["pkce", "state"],
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "email-password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const email = credentials.email.toLowerCase().trim();
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!valid) return null;

        return {
          id: user.id,
          email: user.email ?? "",
          name: user.name ?? "",
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    // Sign in callback - control if a user is allowed to sign in
    async signIn({ user, account, profile }) {
      // For OAuth providers, ensure user exists and account is linked
      if (account && account.provider !== "credentials") {
        try {
          const email = user.email?.toLowerCase().trim();
          if (!email) {
            console.error("OAuth provider did not return an email");
            return false;
          }

          // Get profile data safely
          const profileData = profile as any;
          const profileName = profileData?.name || profileData?.login || user.name || null;
          const profileImage = profileData?.picture || profileData?.avatar_url || user.image || null;

          // Ensure user exists (upsert to avoid conflicts)
          const dbUser = await prisma.user.upsert({
            where: { email },
            update: {
              name: user.name ?? profileName ?? undefined,
              image: user.image ?? profileImage ?? undefined,
              emailVerified: (user as any).emailVerified ?? new Date(),
            },
            create: {
              name: user.name ?? profileName ?? email.split("@")[0],
              email: email,
              emailVerified: new Date(),
              image: user.image ?? profileImage ?? null,
            },
          });

          // Update user.id so JWT callback gets the correct ID
          user.id = dbUser.id;
          // Fix: Update user object with database values to ensure correct session
          user.email = dbUser.email;
          user.name = dbUser.name;

          // Fix: Create default team for new OAuth users if they don't have any teams
          const isNewUser = !(await prisma.teamMember.findFirst({
            where: { userId: dbUser.id },
          }));

          if (isNewUser) {
            // Create a personal team for the user
            const personalTeam = await prisma.team.create({
              data: {
                name: `${dbUser.name}'s Team`,
                members: {
                  create: {
                    userId: dbUser.id,
                    role: "ADMIN",
                  },
                },
              },
            });
            console.log(`[NextAuth] Created default team for new OAuth user:`, {
              userId: dbUser.id,
              teamId: personalTeam.id,
            });
          }

          // Manually link account (PrismaAdapter handles this with database sessions, but with JWT we need to do it)
          if (account.providerAccountId) {
            await prisma.account.upsert({
              where: {
                provider_providerAccountId: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                },
              },
              update: {
                access_token: account.access_token ?? undefined,
                refresh_token: account.refresh_token ?? undefined,
                expires_at: account.expires_at ?? undefined,
                token_type: account.token_type ?? undefined,
                scope: account.scope ?? undefined,
                id_token: account.id_token ?? undefined,
              },
              create: {
                userId: dbUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token ?? null,
                refresh_token: account.refresh_token ?? null,
                expires_at: account.expires_at ?? null,
                token_type: account.token_type ?? null,
                scope: account.scope ?? null,
                id_token: account.id_token ?? null,
              },
            });
          }

          return true;
        } catch (err) {
          // Fix: Better error logging for OAuth callback debugging
          console.error("Error in signIn callback (OAuth):", {
            error: err,
            provider: account.provider,
            email: user.email,
            hasAccountId: !!account.providerAccountId,
          });
          return false;
        }
      }

      // Allow credentials login (already validated in authorize)
      return true;
    },

    // JWT callback - called when JWT is created or updated
    // Fix: Always fetch fresh user data from database to ensure correct session
    async jwt({ token, user, account, profile, trigger }) {
      // Fix: Clear token data when updating session to prevent stale data
      if (trigger === "update") {
        // When session is updated, refresh user data from database
        if (token.id) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.id as string },
              select: { id: true, name: true, email: true, role: true },
            });
            if (dbUser) {
              token.id = dbUser.id;
              token.email = dbUser.email;
              token.name = dbUser.name;
              token.role = dbUser.role;
            }
          } catch (error) {
            console.error("Error refreshing user data in JWT callback:", error);
          }
        }
        return token;
      }

      // Initial sign in - account and user are only available on first call
      // Fix: Clear any existing token data to prevent mixing old and new user data
      if (account && user) {
        // Fix: Completely reset token to prevent stale data from previous user
        // Clear old token properties by setting to undefined/empty
        token.id = undefined as any;
        token.email = undefined as any;
        token.name = undefined as any;
        token.role = undefined;
        token.accessToken = undefined;
        token.refreshToken = undefined;
        // Persist the OAuth access_token to the token right after signin
        if (account.access_token) {
          token.accessToken = account.access_token;
        }
        
        // Store refresh token if available (for offline access)
        if (account.refresh_token) {
          token.refreshToken = account.refresh_token;
        }

        // Fix: Always fetch fresh user data from database using user.id
        // This ensures we get the correct email, name, and role from the database
        if (user.id) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: user.id },
              select: { id: true, name: true, email: true, role: true },
            });
            if (dbUser) {
              token.id = dbUser.id;
              token.email = dbUser.email;
              token.name = dbUser.name;
              token.role = dbUser.role;
            } else {
              // Fallback to user object if DB fetch fails
              token.id = user.id;
              token.email = user.email ?? "";
              token.name = user.name ?? "";
              token.role = (user as any).role;
            }
          } catch (error) {
            console.error("Error fetching user by ID in JWT callback:", error);
            // Fallback to user object
            token.id = user.id;
            token.email = user.email ?? "";
            token.name = user.name ?? "";
            token.role = (user as any).role;
          }
        }
      }
      // For credentials provider, user object is available without account
      else if (user) {
        // Fix: Always fetch fresh user data from database
        if (user.id) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: user.id },
              select: { id: true, name: true, email: true, role: true },
            });
            if (dbUser) {
              token.id = dbUser.id;
              token.email = dbUser.email;
              token.name = dbUser.name;
              token.role = dbUser.role;
            } else {
              token.id = user.id;
              token.email = user.email ?? "";
              token.name = user.name ?? "";
              token.role = (user as any).role;
            }
          } catch (error) {
            console.error("Error fetching user by ID in JWT callback:", error);
            token.id = user.id;
            token.email = user.email ?? "";
            token.name = user.name ?? "";
            token.role = (user as any).role;
          }
        }
      }

      // Fix: If token has id but missing other data, refresh from database
      if (token.id && (!token.email || !token.name)) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { id: true, name: true, email: true, role: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.email = dbUser.email;
            token.name = dbUser.name;
            token.role = dbUser.role;
          } else {
            // If user not found, clear token to force re-authentication
            console.error("User not found in database, clearing token");
            token.id = undefined as any;
            token.email = undefined as any;
            token.name = undefined as any;
            token.role = undefined;
          }
        } catch (error) {
          console.error("Error refreshing user data in JWT callback:", error);
        }
      }

      // Fix: Ensure token always has valid user data, otherwise clear it
      if (!token.id || !token.email) {
        console.error("Invalid token state, clearing user data");
        token.id = undefined as any;
        token.email = undefined as any;
        token.name = undefined as any;
        token.role = undefined;
      }

      return token;
    },

    // Session callback - called whenever a session is checked
    // Fix: Always validate and refresh user data from database
    async session({ session, token }) {
      // Fix: If token doesn't have valid user data, don't return session
      if (!token.id || !token.email) {
        console.error("Invalid token in session callback, returning null session");
        return null as any;
      }

      // Send properties to the client, like access_token and user id from the token
      // Fix: Always fetch fresh user data from database to ensure correct session
      if (session.user && token) {
        // Fix: Always fetch fresh user data from database to ensure correct session
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { id: true, name: true, email: true, role: true },
          });
          
          if (dbUser) {
            session.user.id = dbUser.id;
            session.user.email = dbUser.email;
            session.user.name = dbUser.name;
            (session.user as any).role = dbUser.role;
          } else {
            // User not found in database, return null session
            console.error("User not found in database during session callback");
            return null as any;
          }
        } catch (error) {
          console.error("Error fetching user in session callback:", error);
          // Fallback to token data
          session.user.id = token.id as string;
          session.user.email = (token.email as string) ?? "";
          session.user.name = (token.name as string) ?? "";
          (session.user as any).role = token.role;
        }
      }
      
      // Expose accessToken to client
      (session as any).accessToken = token.accessToken;
      
      return session;
    },

    // Redirect callback - called anytime the user is redirected to a callback URL
    // Fix: Properly handle callbackUrl parameter and ensure secure redirects
    async redirect({ url, baseUrl }) {
      // Use NEXTAUTH_URL if available, otherwise use baseUrl
      // Fix: Ensures correct base URL for OAuth callbacks on Vercel
      const siteUrl = process.env.NEXTAUTH_URL || baseUrl;
      
      // Handle callbackUrl from OAuth providers
      if (url.includes("callbackUrl=")) {
        try {
          const urlObj = new URL(url, siteUrl);
          const callbackUrl = urlObj.searchParams.get("callbackUrl");
          if (callbackUrl) {
            const decoded = decodeURIComponent(callbackUrl);
            // Only allow relative paths for security
            if (decoded.startsWith("/") && !decoded.startsWith("//")) {
              return `${siteUrl}${decoded}`;
            }
          }
        } catch (error) {
          console.error("Error parsing callbackUrl:", error);
        }
      }

      // Allows relative callback URLs (e.g., /dashboard)
      if (url.startsWith("/")) {
        return `${siteUrl}${url}`;
      }
      
      // Allows callback URLs on the same origin
      try {
        const urlObj = new URL(url);
        if (urlObj.origin === new URL(siteUrl).origin) {
          return url;
        }
      } catch (error) {
        // Invalid URL, fall through to default
      }
      
      // Default redirect to dashboard
      return `${siteUrl}/dashboard`;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  // Secret for JWT encryption - required for production
  // Fix: Use AUTH_SECRET as fallback (Vercel convention)
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  
  // Debug mode for development
  debug: process.env.NODE_ENV === "development",
  
  // Note: For Vercel deployment, ensure NEXTAUTH_URL is set to your production URL
  // Example: NEXTAUTH_URL=https://your-app.vercel.app
  // NextAuth will automatically detect the host in most cases, but explicit URL helps with OAuth callbacks

  // Events for debugging OAuth flow
  // Fix: Log OAuth events to help diagnose callback issues
  events: {
    async signIn({ user, account, isNewUser }) {
      if (account && account.provider !== "credentials") {
        console.log(`[NextAuth] OAuth sign-in:`, {
          provider: account.provider,
          email: user.email,
          isNewUser,
          userId: user.id,
        });
      }
    },
    async createUser({ user }) {
      console.log(`[NextAuth] User created:`, {
        email: user.email,
        id: user.id,
      });
    },
    async linkAccount({ user, account }) {
      console.log(`[NextAuth] Account linked:`, {
        provider: account.provider,
        userId: user.id,
      });
    },
    async session({ session, token }) {
      // Optional: Log session creation for debugging
      if (process.env.NODE_ENV === "development") {
        console.log(`[NextAuth] Session created for:`, session.user?.email);
      }
    },
  },
};
