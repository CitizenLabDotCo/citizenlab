import { API_PATH } from 'containers/App/constants';
import { getJwt } from 'utils/auth/jwt';
import { stringify } from 'qs';
import { queryClient } from 'utils/cl-react-query/queryClient';
import { isArray, pickBy, identity } from 'lodash-es';
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
interface Update {
  path: Path;
  action: 'update';
  body: Record<string, any>;
  queryParams?: never;
}
interface Create {
  path: Path;
  action: 'create';
  body: Record<string, any>;
  queryParams?: never;
}
interface Delete {
  path: Path;
  action: 'delete';
  body?: never;
  queryParams?: never;
}

type FetcherArgs = Get | Update | Create | Delete;

type BaseData = { id: string; type: string };

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
    update: 'PATCH',
    create: 'POST',
    delete: 'DELETE',
  };

  // Remove falsy values from query parameters
  const truthyQueryParams = pickBy(queryParams, identity);

  const requestQueryParams = truthyQueryParams
    ? stringify(truthyQueryParams, {
        arrayFormat: 'brackets',
        addQueryPrefix: true,
        encodeValuesOnly: true,
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

  if (action === 'delete' && response.ok) {
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
          queryClient.setQueryData(
            [{ type: entry.type, id: entry.id, entity: 'detail' }],
            () => ({ data: entry })
          );
        });
      } else if (action === 'create' || action === 'update') {
        queryClient.setQueryData(
          [{ type: data.data.type, id: data.data.id, entity: 'detail' }],
          () => ({ data: data.data })
        );
      }
      if (data.included) {
        data.included.forEach((entry: BaseData) =>
          queryClient.setQueryData(
            [{ type: entry.type, id: entry.id, entity: 'detail' }],
            () => ({ data: entry })
          )
        );
      }
    }
  }
  const { included: _included, ...rest } = data;
  return rest;
}

export default fetcher;
