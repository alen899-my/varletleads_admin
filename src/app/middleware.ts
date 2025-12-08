import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;

  const url = req.nextUrl.clone();
  const path = url.pathname;

  // Only protect /admin routes
  if (path.startsWith("/admin")) {
    // Not logged in → redirect to signin
    if (!token) {
      url.pathname = "/signin";
      return NextResponse.redirect(url);
    }

    // Logged in but not admin → redirect to no-access
    if (role !== "admin") {
      url.pathname = "/no-access";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
