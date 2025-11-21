import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/landing", "/login", "/register"];

const PROTECTED_ROUTES = [
  "/dashboard",
  "/tasks",
  "/timer",
  "/analytics",
  "/teams",
  "/profile",
  "/notifications",
];

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Redirect logged-in user away from login/register
    if (token && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow NextAuth internal API
        if (pathname.startsWith("/api/auth")) {
          return true;
        }

        // Allow all public routes
        if (
          PUBLIC_ROUTES.some(
            (route) =>
              pathname === route || pathname.startsWith(`${route}/`)
          )
        ) {
          return true;
        }

        // Protected routes → user MUST be logged in
        if (
          PROTECTED_ROUTES.some(
            (route) =>
              pathname === route || pathname.startsWith(`${route}/`)
          )
        ) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
