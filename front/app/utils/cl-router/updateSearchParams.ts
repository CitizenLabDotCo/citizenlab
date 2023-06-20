import { isNil } from 'utils/helperUtils';
import { isString } from 'lodash-es';
import clHistory from 'utils/cl-router/history';
import { stringify } from 'qs';

export const updateSearchParams = (updatedParams: Record<string, any>) => {
  const searchString = window.location.search;
  const searchParams = new URLSearchParams(searchString);

  const newSearchParams: Record<string, string> = {};

  for (const [key, value] of searchParams.entries()) {
    if (!(key in updatedParams)) {
      newSearchParams[key] = value;
    }
  }

  for (const key in updatedParams) {
    const newValue = updatedParams[key];

    if (!isNil(newValue)) {
      newSearchParams[key] = isString(newValue)
        ? newValue
        : JSON.stringify(newValue);
    }
  }

  clHistory.push({
    pathname: window.location.pathname,
    search: stringify(newSearchParams, { addQueryPrefix: true }),
  });
};
