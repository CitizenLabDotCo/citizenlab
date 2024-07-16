import { stringify } from 'qs';

import clHistory from 'utils/cl-router/history';

export const removeSearchParams = (paramsToBeDeleted: string[]) => {
  const searchString = window.location.search;
  const searchParams = new URLSearchParams(searchString);

  const newSearchParams: Record<string, string> = {};

  for (const [name, value] of searchParams.entries()) {
    if (!paramsToBeDeleted.includes(name)) {
      newSearchParams[name] = value;
    }
  }

  clHistory.replace({
    pathname: window.location.pathname,
    search: stringify(newSearchParams, { addQueryPrefix: true }),
  });
};
