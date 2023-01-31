import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CLErrors, IRelationship } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';

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

type ViewKeys = ReturnType<typeof viewKeys[keyof typeof viewKeys]>;

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

const fetchViews = async () =>
  fetcher<IInsightsViews>({ path: '/insights/views', action: 'get' });

export const useViews = () => {
  return useQuery<IInsightsViews, CLErrors, IInsightsViews, ViewKeys>({
    queryKey: viewKeys.lists(),
    queryFn: fetchViews,
  });
};

const fetchView = (id: string) =>
  fetcher<IInsightsView>({ path: `/insights/views/${id}`, action: 'get' });

export const useView = (id: string) => {
  return useQuery<IInsightsView, CLErrors, IInsightsView, ViewKeys>({
    queryKey: viewKeys.detail(id),
    queryFn: () => fetchView(id),
  });
};

// CREATE VIEWS

const createView = async (requestBody: IInsightsViewObject) =>
  fetcher<IInsightsView>({
    path: '/insights/views',
    action: 'create',
    body: requestBody,
  });

interface IInsightsViewObject {
  view: { data_sources: { origin_id: string }[]; name: string };
}

export const useCreateView = ({ onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation<IInsightsView, CLErrors, IInsightsViewObject>({
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
  fetcher<IInsightsView>({
    path: `/insights/views/${id}`,
    action: 'update',
    body: requestBody,
  });

export const useUpdateView = ({ onSuccess }: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation<IInsightsView, CLErrors, IInsightViewUpdateObject>({
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
    path: `/insights/views/${id}`,
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
