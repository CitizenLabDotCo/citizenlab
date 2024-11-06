import { RouteType } from 'routes';

export function getProjectUrl(slug: string): RouteType {
  return `/projects/${slug}`;
}
