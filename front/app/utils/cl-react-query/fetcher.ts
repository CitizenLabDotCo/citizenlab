import { API_PATH } from 'containers/App/constants';
import { getJwt } from 'utils/auth/jwt';
import { stringify } from 'qs';
import { queryClient } from 'utils/cl-react-query/queryClient';
import { isArray, isNil, omitBy } from 'lodash-es';
import { reportError } from 'utils/loggingUtils';
import { handleBlockedUserError } from 'utils/errorUtils';
import { CLErrors } from 'typings';

// FETCHER

type Path = `/${string}`;
interface Get {
  path: Path;
  action: 'get';
  queryParams?: Record<string, any>;
  body?: never;
}
interface Patch {
  path: Path;
  action: 'patch';
  body: Record<string, any>;
  queryParams?: never;
}
interface Post {
  path: Path;
  action: 'post';
  body: Record<string, any> | null;
  queryParams?: never;
}
interface Delete {
  path: Path;
  action: 'delete';
  body?: Record<string, any> | null;
  queryParams?: never;
}

type FetcherArgs = Get | Patch | Post | Delete;

type BaseData = { id?: string; type: string };

type BaseResponseData =
  | { data: BaseData; included?: BaseData[] }
  | { data: BaseData[]; included?: BaseData[] };

function fetcher<TResponseData extends BaseResponseData>(
  args: FetcherArgs
): FetcherArgs['action'] extends 'delete'
  ? null
  : Promise<Omit<TResponseData, 'included'>>;

async function fetcher({ path, action, body, queryParams }) {
  const methodMap = {
    get: 'GET',
    patch: 'PATCH',
    post: 'POST',
    delete: 'DELETE',
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
  } catch {
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
      } else if (action === 'post' || action === 'patch') {
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
  const { included: _included, ...rest } = data;
  return rest as Omit<BaseResponseData, 'included'>;
}

export default fetcher;
