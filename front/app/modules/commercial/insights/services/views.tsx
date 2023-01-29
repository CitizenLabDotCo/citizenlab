import {
  QueryFunction,
  QueryKey,
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult,
  UseMutationOptions,
} from '@tanstack/react-query';
import { API_PATH } from 'containers/App/constants';
import { CLErrors, IRelationship } from 'typings';
import { getJwt } from 'utils/auth/jwt';
import { stringify } from 'qs';

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

export interface IInsightsView {
  data: IInsightsViewData;
}

export interface IInsightsViews {
  data: IInsightsViewData[];
}

const jwt = getJwt();

const viewKeys = {
  all: () => [{ type: 'view' }] as const,
  lists: () => [{ ...viewKeys.all()[0], entity: 'list' }] as const,
  details: () => [{ ...viewKeys.all()[0], entity: 'detail' }] as const,
  detail: (id: number) =>
    [
      {
        ...viewKeys.details()[0],
        id,
      },
    ] as const,
};

// Fetcher

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
    return data;
  }
};

// GET
const fetchViews = () => fetcher({ path: 'insights/views', action: 'get' });

const useGet = <TData,>({
  queryKey,
  queryFn,
  ...rest
}: UseQueryOptions<TData, unknown, TData, QueryKey> & {
  queryKey: ReturnType<typeof viewKeys[keyof typeof viewKeys]>;
  queryFn: QueryFunction<TData, QueryKey> | undefined;
}): UseQueryResult<TData, CLErrors> => {
  return useQuery<TData, CLErrors>({
    queryKey,
    queryFn,
    ...rest,
  });
};

export const useViews = () => {
  return useGet<IInsightsViews>({
    queryKey: viewKeys.lists(),
    queryFn: fetchViews,
  });
};

// CREATE
interface IInsightsViewObject {
  view: { data_sources: { origin_id: string }[]; name: string };
}

const createView = async (requestBody: IInsightsViewObject) =>
  fetcher({ path: 'insights/views', action: 'create', body: requestBody });

const useCreate = <TData, TRequestBody>({
  queryKeysToInvalidate,
  mutationFn,
  onSuccess,
  ...rest
}: UseMutationOptions<TData, CLErrors, TRequestBody> & {
  queryKeysToInvalidate: ReturnType<typeof viewKeys[keyof typeof viewKeys]>[];
}): UseMutationResult<TData, CLErrors, TRequestBody> => {
  const queryClient = useQueryClient();

  return useMutation<TData, CLErrors, TRequestBody>({
    mutationFn,
    onSuccess: (data, variables, context) => {
      onSuccess && onSuccess(data, variables, context);
      queryKeysToInvalidate.map((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      );
    },
    ...rest,
  });
};

export const useCreateView = ({
  onSuccess,
}: {
  onSuccess: UseMutationOptions<
    IInsightsView,
    CLErrors,
    IInsightsViewObject
  >['onSuccess'];
}) => {
  return useCreate<IInsightsView, IInsightsViewObject>({
    mutationFn: createView,
    queryKeysToInvalidate: [viewKeys.lists()],
    onSuccess,
  });
};

// UPDATE
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

export const useUpdateView = () => {
  const queryClient = useQueryClient();

  return useMutation<IInsightsView, CLErrors, IInsightViewUpdateObject>({
    mutationFn: updateView,
    onSuccess: () => {
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
