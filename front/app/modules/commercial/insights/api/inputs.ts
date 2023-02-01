import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CLErrors, IRelationship } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';

const inputKeys = {
  all: () => [{ type: 'input' }] as const,
  lists: () => [{ ...inputKeys.all()[0], entity: 'list' }] as const,
  list: (filters: QueryParameters) =>
    [{ ...inputKeys.all()[0], entity: 'list', ...filters }] as const,
  details: () => [{ ...inputKeys.all()[0], entity: 'detail' }] as const,
  detail: (id: string) =>
    [
      {
        ...inputKeys.details()[0],
        id,
      },
    ] as const,
};

type InputKeys = ReturnType<typeof inputKeys[keyof typeof inputKeys]>;

export interface IInsightsInputData {
  id: string;
  type: string;
  relationships: {
    categories: { data: IRelationship[] };
    suggested_categories: { data: IRelationship[] };
    source: {
      data: IRelationship;
    };
  };
}

export interface IInsightsInput {
  data: IInsightsInputData;
}

export interface IInsightsInputLinks {
  self: string;
  first: string;
  prev: string | null;
  next: string | null;
  last: string;
}

export interface IInsightsInputs {
  data: IInsightsInputData[];
  links: IInsightsInputLinks;
}

export type QueryParameters = {
  category: string;
  pageSize?: number;
  pageNumber: number;
  search: string;
  processed?: boolean;
  sort?: 'approval' | '-approval';
};

export const defaultPageSize = 20;

const fetchInputs = async (
  viewId: string,
  { pageNumber, pageSize, category, ...queryParams }: QueryParameters
) =>
  fetcher<IInsightsInputs>({
    path: `/insights/views/${viewId}/inputs`,
    action: 'get',
    queryParams: {
      'page[number]': pageNumber || 1,
      'page[size]': pageSize || defaultPageSize,
      categories: typeof category === 'string' ? [category] : undefined,
      ...queryParams,
    },
  });

export const useInputs = (viewId: string, queryParams: QueryParameters) => {
  const queryClient = useQueryClient();

  const prefetchParams = {
    ...queryParams,
    pageNumber: queryParams.pageNumber + 1,
  };
  queryClient.prefetchQuery({
    queryKey: inputKeys.list(prefetchParams),
    queryFn: () => fetchInputs(viewId, prefetchParams),
  });

  return useQuery<IInsightsInputs, CLErrors, IInsightsInputs, InputKeys>({
    queryKey: inputKeys.list(queryParams),
    queryFn: () => fetchInputs(viewId, queryParams),
  });
};

const fetchInput = (viewId: string, id: string) =>
  fetcher<IInsightsInput>({
    path: `/insights/views/${viewId}/inputs/${id}`,
    action: 'get',
  });

export const useInput = (viewId: string, id: string) => {
  return useQuery<IInsightsInput, CLErrors, IInsightsInput, InputKeys>({
    queryKey: inputKeys.detail(id),
    queryFn: () => fetchInput(viewId, id),
  });
};

// const createView = async (requestBody: IInsightsViewObject) =>
//   fetcher<IInsightsView>({
//     path: '/insights/views',
//     action: 'create',
//     body: requestBody,
//   });

// interface IInsightsViewObject {
//   view: { data_sources: { origin_id: string }[]; name: string };
// }

// export const useCreateView = ({ onSuccess }: { onSuccess?: () => void }) => {
//   const queryClient = useQueryClient();
//   return useMutation<IInsightsView, CLErrors, IInsightsViewObject>({
//     mutationFn: createView,
//     onSuccess: () => {
//       onSuccess && onSuccess();
//       queryClient.invalidateQueries({ queryKey: viewKeys.lists() });
//     },
//   });
// };

// interface IInsightViewUpdateObject {
//   id: string;
//   requestBody: { view: { name: string } };
// }

// const updateView = async ({ id, requestBody }: IInsightViewUpdateObject) =>
//   fetcher<IInsightsView>({
//     path: `/insights/views/${id}`,
//     action: 'update',
//     body: requestBody,
//   });

// export const useUpdateView = ({ onSuccess }: { onSuccess?: () => void }) => {
//   const queryClient = useQueryClient();
//   return useMutation<IInsightsView, CLErrors, IInsightViewUpdateObject>({
//     mutationFn: updateView,
//     onSuccess: () => {
//       onSuccess && onSuccess();
//       queryClient.invalidateQueries({ queryKey: viewKeys.lists() });
//     },
//   });
// };

// const deleteView = async (id: string) =>
//   fetcher({
//     path: `/insights/views/${id}`,
//     action: 'delete',
//   });

// export const useDeleteView = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: deleteView,
//     onMutate: async (id: string) => {
//       // Cancel any outgoing refetches
//       // (so they don't overwrite our optimistic update)
//       await queryClient.cancelQueries({ queryKey: viewKeys.lists() });

//       // Snapshot the previous value
//       const previous = queryClient.getQueryData<IInsightsViews>(
//         viewKeys.lists()
//       );

//       // Optimistically update to the new value
//       queryClient.setQueryData(viewKeys.lists(), (old: IInsightsViews) => {
//         const newData = {
//           ...old,
//           data: old.data.filter((item) => item.id !== id),
//         };

//         return newData;
//       });

//       // Return a context object with the snapshotted value
//       return { previous };
//     },
//     onError: (_err, _newTodo, context) => {
//       if (context?.previous) {
//         queryClient.setQueryData<IInsightsViews>(
//           viewKeys.lists(),
//           context.previous
//         );
//       }
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: viewKeys.lists() });
//     },
//   });
// };
