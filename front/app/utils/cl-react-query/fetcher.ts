import { API_PATH } from 'containers/App/constants';
import { getJwt } from 'utils/auth/jwt';
import { stringify } from 'qs';
import { queryClient } from 'utils/cl-react-query/queryClient';
import { isArray, isNil, omitBy } from 'lodash-es';
import { CLErrors } from 'typings';

// FETCHER

const jwt = getJwt();

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
  body: Record<string, any>;
  queryParams?: never;
}
interface Delete {
  path: Path;
  action: 'delete';
  body?: Record<string, any>;
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

  // Remove unnecessary query parameters from object
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

  if ((action === 'delete' && response.ok) || response.status === 202) {
    return null;
  }

  let data: any;

  try {
    data = await response.json();
  } catch {
    throw new Error('Unsupported case. No valid JSON.');
  }

  if (!response.ok) {
    throw data as CLErrors;
  } else {
    if (data) {
      if (isArray(data.data)) {
        data.data.forEach((entry: BaseData) => {
          if (entry.id) {
            queryClient.setQueryData(
              [{ type: entry.type, id: entry.id, entity: 'detail' }],
              () => ({ data: entry })
            );
          }
        });
      } else if (action === 'post' || action === 'patch') {
        if (data.data.id) {
          queryClient.setQueryData(
            [{ type: data.data.type, id: data.data.id, entity: 'detail' }],
            () => ({ data: data.data })
          );
        }
      }
      if (data.included) {
        data.included.forEach((entry: BaseData) => {
          if (entry.id) {
            queryClient.setQueryData(
              [{ type: entry.type, id: entry.id, entity: 'detail' }],
              () => ({ data: entry })
            );
          }
        });
      }
    }
  }
  const { included: _included, ...rest } = data;
  return rest;
}

export default fetcher;
