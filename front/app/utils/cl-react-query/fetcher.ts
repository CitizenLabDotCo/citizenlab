import { API_PATH } from 'containers/App/constants';
import { getJwt } from 'utils/auth/jwt';
import { stringify } from 'qs';
import { queryClient } from 'root';
import { isArray } from 'lodash-es';

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
type BaseResponse =
  | { data: BaseData; included?: BaseData[] }
  | { data: BaseData[]; included?: BaseData[] };

const fetcher = async <TResponseData extends BaseResponse>({
  path,
  action,
  body,
  queryParams,
}: Fetcher) => {
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

  let data: TResponseData | undefined;

  try {
    data = await response.json();
    if (data) {
      if (!response.ok) {
        throw data;
      } else {
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
            () => ({ data })
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
      return data;
    }
  } catch {
    // Do nothing
  }
  return data as TResponseData;
};

export default fetcher;
