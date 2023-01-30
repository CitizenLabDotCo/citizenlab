import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { API_PATH } from 'containers/App/constants';
import { CLErrors, IRelationship } from 'typings';
import { getJwt } from 'utils/auth/jwt';
import { stringify } from 'qs';
import { queryClient } from 'root';
import { isArray } from 'lodash-es';

const viewKeys = {
  all: () => [{ type: 'view' }] as const,
  lists: () => [{ ...viewKeys.all()[0], entity: 'list' }] as const,
  details: () => [{ ...viewKeys.all()[0], entity: 'detail' }] as const,
  detail: (id: string) =>
    [
      {
        ...viewKeys.details()[0],
        id,
      },
    ] as const,
};

const ab: typeof viewKeys[keyof typeof viewKeys] = viewKeys.detail;

ab('id');

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

type BaseData = { data: { id: string } };

const fetcher = async ({ path, action, body, queryParams }: Fetcher) => {
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

  let data;

  try {
    data = await response.json();
  } catch {
    // Do nothng
  }
  if (!response.ok) {
    throw data;
  } else {
    if (isArray(data.data)) {
      data.data.forEach((entry) =>
        queryClient.setQueryData(
          [{ type: entry.type, id: entry.id, entity: 'detail' }],
          () => ({ data: entry })
        )
      );
    }
    if (data.included) {
      data.included.forEach((entry) =>
        queryClient.setQueryData(
          [{ type: entry.type, id: entry.id, entity: 'detail' }],
          () => ({ data: entry })
        )
      );
    }

    if (action === 'create' || action === 'update') {
      queryClient.setQueryData(
        [{ type: data.data.type, id: data.data.id, entity: 'detail' }],
        () => ({ data })
      );
    }

    return data;
  }
};

export interface IInsightsViewData {
  id: string;
  type: 'view';
  attributes: {
    name: string;
    updated_at: string;
  };
  relationships?: {
    data_sources: {
      data: IRelationship[];
    };
  };
}

type IInsightsView = { data: IInsightsViewData };
export type IInsightsViews = { data: IInsightsViewData[] };

// GET VIEWS

const fetchViews = () => fetcher({ path: 'insights/views', action: 'get' });

export const useViews = () => {
  return useQuery<IInsightsViews, CLErrors>({
    queryKey: viewKeys.lists(),
    queryFn: fetchViews,
  });
};

const fetchView = (id: string) =>
  fetcher({ path: `insights/views/${id}`, action: 'get' });

export const useView = (id: string) => {
  return useQuery<IInsightsView, CLErrors>({
    queryKey: viewKeys.detail(id),
    queryFn: () => fetchView(id),
  });
};

// CREATE VIEWS

const createView = async (requestBody: IInsightsViewObject) =>
  fetcher({ path: 'insights/views', action: 'create', body: requestBody });

interface IInsightsViewObject {
  view: { data_sources: { origin_id: string }[]; name: string };
}

export const useCreateView = ({ onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation<IInsightsViewData, CLErrors, IInsightsViewObject>({
    mutationFn: createView,
    onSuccess: () => {
      onSuccess && onSuccess();
      queryClient.invalidateQueries({ queryKey: viewKeys.lists() });
    },
  });
};

interface IInsightViewUpdateObject {
  id: string;
  requestBody: { view: { name: string } };
}

const updateView = async ({ id, requestBody }: IInsightViewUpdateObject) =>
  fetcher({
    path: `insights/views/${id}`,
    action: 'update',
    body: requestBody,
  });

export const useUpdateView = ({ onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation<IInsightsViewData, CLErrors, IInsightViewUpdateObject>({
    mutationFn: updateView,
    onSuccess: () => {
      onSuccess && onSuccess();
      queryClient.invalidateQueries({ queryKey: viewKeys.lists() });
    },
  });
};

// DELETE
const deleteView = async (id: string) =>
  fetcher({
    path: `insights/views/${id}`,
    action: 'delete',
  });

export const useDeleteView = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteView,
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: viewKeys.lists() });

      // Snapshot the previous value
      const previous = queryClient.getQueryData<IInsightsViews>(
        viewKeys.lists()
      );

      // Optimistically update to the new value
      queryClient.setQueryData(viewKeys.lists(), (old: IInsightsViews) => {
        const newData = {
          ...old,
          data: old.data.filter((item) => item.id !== id),
        };

        return newData;
      });

      // Return a context object with the snapshotted value
      return { previous };
    },
    onError: (_err, _newTodo, context) => {
      if (context?.previous) {
        queryClient.setQueryData<IInsightsViews>(
          viewKeys.lists(),
          context.previous
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: viewKeys.lists() });
    },
  });
};
