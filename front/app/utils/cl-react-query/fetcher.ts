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
}
interface Patch {
  path: Path;
  action: 'patch';
  body?: Record<string, any>;
  queryParams?: never;
  cacheIndividualItems?: never;
}
interface Put {
  path: Path;
  action: 'put';
  body: Record<string, any>;
  queryParams?: never;
  cacheIndividualItems?: never;
}
interface Post {
  path: Path;
  action: 'post';
  body: Record<string, any> | null;
  queryParams?: never;
  cacheIndividualItems?: never;
}
interface Delete {
  path: Path;
  action: 'delete';
  body?: Record<string, any> | null;
  queryParams?: never;
  cacheIndividualItems?: never;
}

type FetcherArgs = Get | Patch | Put | Post | Delete;

type BaseData = { id?: string; type: string };

export type BaseResponseData =
  | { data: BaseData; included?: BaseData[] }
  | { data: BaseData[]; included?: BaseData[] };

function fetcher<TResponseData extends BaseResponseData>(
  args: FetcherArgs
): FetcherArgs['action'] extends 'delete'
  ? null
  : Promise<Omit<TResponseData, 'included'>>;

/**
 * @param cacheIndividualItems : When set to true, if the API response returns an array of items, these items will individually be added to the cache in addition to the whole request.
 * If the API response returns resources in the `included` array, these will also be added to the cache as individual items.
 * Defaults to true.
 */

async function fetcher({
  path,
  action,
  body,
  queryParams,
  cacheIndividualItems = true,
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

  const requestQueryParams = relevantQueryParams
    ? stringify(relevantQueryParams, {
        arrayFormat: 'brackets',
        addQueryPrefix: true,
      })
    : '';

  const response = await fetch(`${API_PATH}${path}${requestQueryParams}`, {
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

    reportError('Unsupported case. No valid JSON.');
    throw new Error('Unsupported case. No valid JSON.');
  }

  if (!response.ok) {
    const error = data as unknown as CLErrors;
    handleBlockedUserError(response.status, error);
    if (!error.errors) {
      reportError(data);
    }

    throw error;
  } else {
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
        if (
          data.data !== null && // TODO fix this in the backend
          data.data.id
        ) {
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
  const { included: _included, ...rest } = data;
  return rest as Omit<BaseResponseData, 'included'>;
}

export default fetcher;
