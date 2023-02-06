import {
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { CLErrors, IRelationship } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

export const inputKeys = {
  all: () => [{ type: 'input' }] as const,
  lists: () => [{ ...inputKeys.all()[0], entity: 'list' }] as const,
  list: (viewId: string, filters?: QueryParameters) =>
    [{ ...inputKeys.all()[0], entity: 'list', viewId, ...filters }] as const,
  infiniteList: (filters: InfiniteQueryParameters) =>
    [
      {
        ...inputKeys.all()[0],
        entity: 'list',
        queryType: 'infinite',
        ...filters,
      },
    ] as const,
  details: (viewId: string) =>
    [{ ...inputKeys.all()[0], viewId, entity: 'detail' }] as const,
  detail: (viewId: string, id: string) =>
    [
      {
        ...inputKeys.details(viewId)[0],
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

const fetchInputs = (
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
    queryKey: inputKeys.list(viewId, prefetchParams),
    queryFn: () => fetchInputs(viewId, prefetchParams),
  });

  return useQuery<IInsightsInputs, CLErrors, IInsightsInputs, InputKeys>({
    queryKey: inputKeys.list(viewId, queryParams),
    queryFn: () => fetchInputs(viewId, queryParams),
  });
};

export type InfiniteQueryParameters = {
  pageSize?: number;
  pageNumber?: number;
  search?: string;
  categories: string[];
  keywords: string[];
};

const fetchInfiniteInputs = (
  viewId: string,
  { pageNumber, pageSize, ...queryParams }: InfiniteQueryParameters
) =>
  fetcher<IInsightsInputs>({
    path: `/insights/views/${viewId}/inputs`,
    action: 'get',
    queryParams: {
      'page[number]': pageNumber || 1,
      'page[size]': pageSize || defaultPageSize,
      ...queryParams,
    },
  });

export const useInfiniteInputs = (
  viewId: string,
  queryParams: InfiniteQueryParameters
) => {
  return useInfiniteQuery<
    IInsightsInputs,
    CLErrors,
    IInsightsInputs,
    InputKeys
  >({
    queryKey: inputKeys.infiniteList(queryParams),
    queryFn: ({ pageParam }) =>
      fetchInfiniteInputs(viewId, { ...queryParams, pageNumber: pageParam }),
    getNextPageParam: (lastPage) => {
      const hasNextPage = lastPage.links?.next;
      const pageNumber = getPageNumberFromUrl(lastPage.links.self);
      return hasNextPage && pageNumber ? pageNumber + 1 : null;
    },
    keepPreviousData: true,
  });
};

const fetchInput = (viewId: string, id: string) =>
  fetcher<IInsightsInput>({
    path: `/insights/views/${viewId}/inputs/${id}`,
    action: 'get',
  });

export const useInput = (viewId: string, id: string) => {
  return useQuery<IInsightsInput, CLErrors, IInsightsInput, InputKeys>({
    queryKey: inputKeys.detail(viewId, id),
    queryFn: () => fetchInput(viewId, id),
  });
};

// const deleteInputCategory = ({
//   viewId,
//   inputId,
//   categoryId,
// }: {
//   viewId: string;
//   inputId: string;
//   categoryId: string;
// }) =>
//   fetcher({
//     path: `/insights/views/${viewId}/${inputId}/${categoryId}`,
//     action: 'delete',
//   });

// export const useDeleteInputCategory = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: deleteInputCategory,
//     onSuccess: (_data, variables) => {
//       queryClient.invalidateQueries({ queryKey: inputKeys.lists() });
//       queryClient.invalidateQueries({ queryKey: statsKeys.details() });
//       queryClient.invalidateQueries({
//         queryKey: inputKeys.detail(variables.viewId, variables.inputId),
//       });
//     },
//   });
// };

// export async function deleteInsightsInputCategory(
//   insightsViewId: string,
//   insightsInputId: string,
//   insightsCategoryId: string
// ) {
//   const response = await streams.delete(
//     `${API_PATH}/${getInsightsInputsEndpoint(
//       insightsViewId
//     )}/${insightsInputId}/categories/${insightsCategoryId}`,
//     insightsCategoryId
//   );

//   streams.fetchAllWith({
//     partialApiEndpoint: [
//       `${API_PATH}/${getInsightsInputsEndpoint(insightsViewId)}`,
//       `insights/views/${insightsViewId}/categories`,
//       `insights/views/${insightsViewId}/stats/inputs_count`,
//     ],
//   });

//   return response;
// }

// export async function addInsightsInputCategory(
//   insightsViewId: string,
//   insightsInputId: string,
//   insightsCategoryId: string
// ) {
//   const response = await streams.add(
//     `${API_PATH}/${getInsightsInputsEndpoint(
//       insightsViewId
//     )}/${insightsInputId}/categories`,
//     { data: [{ id: insightsCategoryId, type: 'category' }] }
//   );

//   streams.fetchAllWith({
//     partialApiEndpoint: [
//       `${API_PATH}/${getInsightsInputsEndpoint(insightsViewId)}`,
//       `insights/views/${insightsViewId}/categories`,
//       `insights/views/${insightsViewId}/stats/inputs_count`,
//     ],
//   });

//   return response;
// }

// export async function addInsightsInputCategories(
//   insightsViewId: string,
//   insightsInputId: string,
//   insightsCategories: { id: string; type: string }[]
// ) {
//   const response = await streams.add(
//     `${API_PATH}/${getInsightsInputsEndpoint(
//       insightsViewId
//     )}/${insightsInputId}/categories`,
//     { data: insightsCategories }
//   );

//   await streams.fetchAllWith({
//     partialApiEndpoint: [
//       `${API_PATH}/${getInsightsInputsEndpoint(insightsViewId)}`,
//       `insights/views/${insightsViewId}/categories`,
//       `insights/views/${insightsViewId}/stats/inputs_count`,
//     ],
//   });

//   return response;
// }
