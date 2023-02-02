import {
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { CLErrors, IRelationship } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

const inputKeys = {
  all: () => [{ type: 'input' }] as const,
  lists: () => [{ ...inputKeys.all()[0], entity: 'list' }] as const,
  list: (filters: QueryParameters) =>
    [{ ...inputKeys.all()[0], entity: 'list', ...filters }] as const,
  infiniteList: (filters: InfiniteQueryParameters) =>
    [
      {
        ...inputKeys.all()[0],
        entity: 'list',
        queryType: 'infinite',
        ...filters,
      },
    ] as const,
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

export type InfiniteQueryParameters = {
  pageSize?: number;
  pageNumber?: number;
  search?: string;
  categories: string[];
  keywords: string[];
};

const fetchInfiniteInputs = async (
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
    queryKey: inputKeys.detail(id),
    queryFn: () => fetchInput(viewId, id),
  });
};
