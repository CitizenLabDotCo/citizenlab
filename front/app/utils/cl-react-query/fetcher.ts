import { API_PATH } from 'containers/App/constants';
import { getJwt } from 'utils/auth/jwt';
import { stringify } from 'qs';
import { queryClient } from 'root';
import { isArray } from 'lodash-es';
import { CLErrors } from 'typings';

// FETCHER

const jwt = getJwt();
interface Get {
  path: string;
  action: 'get';
  queryParams?: Record<string, any>;
  body?: never;
}
interface Update {
  path: string;
  action: 'update';
  body: Record<string, any>;
  queryParams?: never;
}
interface Create {
  path: string;
  action: 'create';
  body: Record<string, any>;
  queryParams?: never;
}
interface Delete {
  path: string;
  action: 'delete';
  body?: never;
  queryParams?: never;
}

type Fetcher = Get | Update | Create | Delete;

type BaseData = { id: string; type: string };

type BaseDataResponse =
  | { data: BaseData; included?: BaseData[] }
  | { data: BaseData[]; included?: BaseData[] };

function fetcher<TResponseData extends BaseDataResponse>(
  args: Fetcher
): Fetcher['action'] extends 'delete'
  ? null
  : Promise<Omit<TResponseData, 'included'>>;

async function fetcher({ path, action, body, queryParams }) {
  const methodMap = {
    get: 'GET',
    update: 'PATCH',
    create: 'POST',
    delete: 'DELETE',
  };
  const requestQueryParams = queryParams
    ? stringify(queryParams, { addQueryPrefix: true, indices: false })
    : '';

  const response = await fetch(`${API_PATH}/${path}${requestQueryParams}`, {
    method: methodMap[action],
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
  });

  if (action === 'delete') {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw data as unknown as CLErrors;
  } else {
    if (data) {
      if (isArray(data.data)) {
        data.data.forEach((entry: BaseData) =>
          queryClient.setQueryData(
            [{ type: entry.type, id: entry.id, entity: 'detail' }],
            () => ({ data: entry })
          )
        );
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
