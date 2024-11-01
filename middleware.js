import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Update to exclude the homepage from the protected routes
const isProtectedRoute = createRouteMatcher(['/create-blog(.*)', '/blog/(.*)', '/communities/(.*)','/profile/(.*)', '/activity', '/search']);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)'
  ],
};