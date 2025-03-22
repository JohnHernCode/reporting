import { NextResponse } from "next/server";

export function middleware(request) {
  const { cookies, nextUrl } = request;

  // Check for NextAuth session cookie
  const isLoggedIn = cookies.get("next-auth.session-token");

  // Define routes to exclude from authentication
  const publicRoutes = [
    "/authentication/sign-in",
    "/authentication/forgot-password",
    "/authentication/lock-screen",
    "/authentication/audio-screen",
  ];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // Redirect to sign-in page if user is not logged in and the route is not public
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/authentication/sign-in", nextUrl));
  }

  console.log("Middleware is running... Path:", request.nextUrl.pathname);

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images/|fonts/|public/).*)",
  ],
};

