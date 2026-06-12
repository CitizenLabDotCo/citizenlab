import { router } from 'routes';

/**
 * Given a URL pathname, returns the matched TanStack Router route pattern
 * in :param format (e.g., '/en/ideas/my-idea' -> '/:locale/ideas/:slug').
 * Returns undefined if no route matches.
 */
export function getRoutePattern(pathname: string): string | undefined {
  const { foundRoute } = router.getMatchedRoutes(pathname);
  // Normalize TanStack Router's $param syntax to :param for backward compatibility
  return foundRoute?.fullPath?.replace(/\$(\w+)/g, ':$1');
}
