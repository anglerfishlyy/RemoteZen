import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // Using JWT strategy for custom User model compatibility
  },
  providers: [
    // ---------------- GOOGLE LOGIN ----------------
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    // ---------------- GITHUB LOGIN ----------------
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),

    // ---------------- EMAIL/PASSWORD LOGIN ----------------
    CredentialsProvider({
      name: "email-password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) throw new Error("Invalid credentials");

        // Check if user has a password (OAuth users have empty passwordHash)
        if (!user.passwordHash) {
          throw new Error("Please sign in with Google or GitHub");
        }

        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!valid) throw new Error("Invalid credentials");

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  // JWT CALLBACK (session control) 
  callbacks: {
    async jwt({ token, user, account }) {
      // User logged in (OAuth or Credentials)
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        if ('role' in user) {
          token.role = user.role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        if (token.role) {
          (session.user as any).role = token.role;
        }
      }

      return session;
      
    },
    async redirect({ url, baseUrl }) {
      // Always send user to dashboard after login
      return "/dashboard";
    }
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
