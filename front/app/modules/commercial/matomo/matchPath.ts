// Adapted from https://github.com/ReactTraining/react-router/blob/master/packages/react-router/modules/matchPath.js
// Because I couldn't find an equivalent in react router v3

import { pathToRegexp } from 'path-to-regexp';
import { RouteConfiguration } from 'utils/moduleUtils';

const cache = {};
const cacheLimit = 10000;
let cacheCount = 0;

function compilePath(path, options) {
  const cacheKey = `${options.end}${options.strict}${options.sensitive}`;
  const pathCache = cache[cacheKey] || (cache[cacheKey] = {});

  if (pathCache[path]) return pathCache[path];

  const keys = [];
  const regexp = pathToRegexp(path, keys, options);
  const result = { regexp, keys };

  if (cacheCount < cacheLimit) {
    pathCache[path] = result;
    cacheCount += 1;
  }

  return result;
}

/**
 * Public API for matching a URL pathname to a path.
 */
function matchPath(pathname, options = {} as any) {
  if (typeof options === 'string' || Array.isArray(options)) {
    // eslint-disable-next-line no-param-reassign
    options = { path: options };
  }

  const { path, exact = false, strict = false, sensitive = false } = options;

  const paths = [].concat(path);

  return paths.reduce((matched, path) => {
    if (!path && path !== '') return null;
    if (matched) return matched;

    const { regexp, keys } = compilePath(path, {
      strict,
      sensitive,
      end: exact,
    });
    const match = regexp.exec(pathname);

    if (!match) return null;

    const [url, ...values] = match;
    const isExact = pathname === url;

    if (exact && !isExact) return null;

    return {
      path, // the path used to match
      isExact, // whether or not we matched exactly
      url: path === '/' && url === '' ? '/' : url, // the matched portion of the URL
      params: keys.reduce((memo, key, index) => {
        memo[key.name] = values[index];
        return memo;
      }, {}),
    };
  }, null);
}

export function getAllPathsFromRoutes(route) {
  const res = [] as string[];
  function makeRoute(head: string, path: string | undefined) {
    if (path?.startsWith('/')) {
      return path;
    } else {
      return `${head}/${path || ''}`;
    }
  }
  function paths(route: RouteConfiguration, head: string) {
    if (route.childRoutes) {
      if (route.indexRoute) {
        res.push(makeRoute(head, route.path));
      }
      route.childRoutes.forEach((r) => paths(r, makeRoute(head, route.path)));
    } else {
      res.push(makeRoute(head, route.path));
    }
  }
  paths(route, '');
  return res.map((path) => path.replaceAll('/*', ''));
}

export default matchPath;
