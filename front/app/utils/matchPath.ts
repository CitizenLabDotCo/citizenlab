// Adapted from https://github.com/ReactTraining/react-router/blob/master/packages/react-router/modules/commercial/matchPath.js
// Because I couldn't find an equivalent in react router v3

import { pathToRegexp } from 'path-to-regexp';

const cache = {};
const cacheLimit = 10000;
let cacheCount = 0;

interface CompilePathOptions {
  strict: boolean;
  sensitive: boolean;
  end: boolean;
}

function compilePath(path: string, options: CompilePathOptions) {
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
interface MatchPathOptions {
  paths: string[];
  exact: boolean;
}

function matchPath(pathname: string, { paths, exact }: MatchPathOptions) {
  return paths.reduce((matched, path) => {
    if (!path && path !== '') return null;
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (matched) return matched;

    const { regexp, keys } = compilePath(path, {
      strict: false,
      sensitive: false,
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

export default matchPath;
