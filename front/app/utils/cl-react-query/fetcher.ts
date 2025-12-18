import { isArray, isNil, omitBy } from 'lodash-es';
import { stringify } from 'qs';
import { CLErrors } from 'typings';

import { API_PATH } from 'containers/App/constants';

import { getJwt } from 'utils/auth/jwt';
import { queryClient } from 'utils/cl-react-query/queryClient';
import { handleBlockedUserError } from 'utils/errorUtils';
import { reportError } from 'utils/loggingUtils';

// FETCHER

type Path = `/${string}`;
interface Get {
  path: Path;
  action: 'get';
  queryParams?: Record<string, any>;
  body?: never;
  cacheIndividualItems?: boolean;
  apiPath?: Path;
}
interface Patch {
  path: Path;
  action: 'patch';
  body?: Record<string, any>;
  queryParams?: never;
  cacheIndividualItems?: never;
  apiPath?: Path;
}
interface Put {
  path: Path;
  action: 'put';
  body: Record<string, any>;
  queryParams?: never;
  cacheIndividualItems?: never;
  apiPath?: Path;
}
interface Post {
  path: Path;
  action: 'post';
  body: Record<string, any> | null;
  queryParams?: never;
  cacheIndividualItems?: never;
  apiPath?: Path;
}
interface Delete {
  path: Path;
  action: 'delete';
  body?: Record<string, any> | null;
  queryParams?: never;
  cacheIndividualItems?: never;
  apiPath?: Path;
}

type FetcherArgs = Get | Patch | Put | Post | Delete;

export type BaseData = { id?: string; type: string };

export type BaseResponseData =
  | { data: BaseData; included?: BaseData[] }
  | { data: BaseData[]; included?: BaseData[] };

function fetcher<TResponseData extends BaseResponseData>(
  args: FetcherArgs
): FetcherArgs['action'] extends 'delete' ? null : Promise<TResponseData>;

/**
 * @param cacheIndividualItems : When set to true, if the API response returns an array of items, these items will individually be added to the cache in addition to the whole request.
 * If the API response returns resources in the `included` array, these will also be added to the cache as individual items.
 * Defaults to true.
 */

/**
 *
 * @param apiPath : The path to the API. Defaults to '/web_api/v1'. If the API path is different it should be passed as an argument.
 */
async function fetcher({
  path,
  action,
  body,
  queryParams,
  cacheIndividualItems = true,
  apiPath = API_PATH as Path,
}) {
  const methodMap = {
    get: 'GET',
    patch: 'PATCH',
    post: 'POST',
    delete: 'DELETE',
    put: 'PUT',
  };
  const jwt = getJwt();
  // Remove query parameters that have an empty value from query object in order to keep
  // sanitization behaviour consistent current and previous data-fetchign setup
  const relevantQueryParams = omitBy(
    queryParams,
    (value) => isNil(value) || value === ''
  );

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const requestQueryParams = relevantQueryParams
    ? stringify(relevantQueryParams, {
        arrayFormat: 'brackets',
        addQueryPrefix: true,
      })
    : '';

  const response = await fetch(`${apiPath}${path}${requestQueryParams}`, {
    method: methodMap[action],
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
  });

  // Return null for scenarios where the back-end response is not valid JSON but the request is successful
  if (
    response.ok &&
    (action === 'delete' ||
      (response.status !== 200 && response.status !== 201))
  ) {
    return null;
  }

  let data: BaseResponseData;

  try {
    data = await response.json();
  } catch (e) {
    if (
      action === 'post' &&
      (response.status === 201 || response.status === 200)
    ) {
      return; // TODO temporary workaround
    }

    if (response.status === 504) {
      reportError('Gateway timeout');
      throw new Error('Gateway timeout');
    }

    if (path === '/users/me') {
      return null;
    }

    if (response.status === 204) {
      // No content
      return null;
    }

    reportError('Unsupported case. No valid JSON.');
    throw new Error('Unsupported case. No valid JSON.');
  }

  if (!response.ok) {
    const error = data as unknown as CLErrors;
    handleBlockedUserError(response.status, error);
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!error.errors) {
      reportError(data);
    }

    throw error;
  } else {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (data) {
      if (isArray(data.data)) {
        if (cacheIndividualItems) {
          data.data.forEach((entry) => {
            if (entry.id) {
              queryClient.setQueryData(
                [
                  {
                    type: entry.type,
                    parameters: { id: entry.id },
                    operation: 'item',
                  },
                ],
                () => ({ data: entry })
              );
            }
          });
        }
      } else if (action === 'get' || action === 'post' || action === 'patch') {
        if (data.data.id) {
          queryClient.setQueryData(
            [
              {
                type: data.data.type,
                parameters: { id: data.data.id },
                operation: 'item',
              },
            ],
            () => ({ data: data.data })
          );
        }
      }
      if (data.included) {
        if (cacheIndividualItems) {
          data.included.forEach((entry) => {
            if (entry.id) {
              queryClient.setQueryData(
                [
                  {
                    type: entry.type,
                    parameters: { id: entry.id },
                    operation: 'item',
                  },
                ],
                () => ({ data: entry })
              );
            }
          });
        }
      }
    }
  }

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!data) return null;
  return data;
}

export default fetcher;
