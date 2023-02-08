import { useMutation, useQuery } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import { queryClient } from 'utils/cl-react-query/queryClient';
import categorySuggestionsKeys from './queryKeys';
import {
  IInsightsCategorySuggestionsTasks,
  QueryParameters,
  ScanStatus,
} from './types';

const fetchTasks = (viewId: string, queryParams: QueryParameters) =>
  fetcher<IInsightsCategorySuggestionsTasks>({
    path: `/insights/views/${viewId}/stats/tasks/category_suggestions`,
    action: 'get',
    queryParams,
  });

const triggerScanFetcher = ({
  viewId,
  category,
  processed,
}: {
  viewId: string;
  category?: string;
  processed?: boolean;
}) =>
  fetcher({
    path: `/insights/views/${viewId}/tasks/category_suggestions`,
    action: 'post',
    body: category
      ? { categories: [category] }
      : typeof category === 'string'
      ? {
          inputs: {
            processed,
            categories: [category],
          },
        }
      : { inputs: { processed } },
  });

const cancelScanFetcher = ({
  viewId,
  category,
  processed,
}: {
  viewId: string;
  category?: string;
  processed?: boolean;
}) =>
  fetcher({
    path: `/insights/views/${viewId}/tasks/category_suggestions`,
    action: 'delete',
    body: category
      ? { categories: [category] }
      : typeof category === 'string'
      ? {
          inputs: {
            processed,
            categories: [category],
          },
        }
      : { inputs: { processed } },
  });

const useScanForCategorySuggestions = (
  viewId: string,
  category?: string,
  processed?: boolean
) => {
  const queryKey = categorySuggestionsKeys.tasks(viewId, {
    categories: category ? [category] : [],
    processed,
  });

  const cachedQueryData = queryClient.getQueryData(
    queryKey
  ) as IInsightsCategorySuggestionsTasks;

  const { data, refetch } = useQuery({
    queryFn: () =>
      fetchTasks(viewId, { categories: category ? [category] : [], processed }),
    queryKey,
    enabled: cachedQueryData
      ? cachedQueryData.data.status === 'isScanning'
      : false,
    refetchInterval: 5000,
    keepPreviousData: false,
    structuralSharing: (oldData, newData) => {
      if (!oldData) {
        return {
          data: {
            ...newData.data,
            initialCount: newData.data.count,
            status: 'isScanning',
          },
        };
      } else {
        return {
          data: {
            ...oldData.data,
            ...newData.data,
          },
        };
      }
    },
  });

  const { mutate: triggerScanMutate, isLoading: triggerScanLoading } =
    useMutation({
      mutationFn: triggerScanFetcher,

      onSuccess: async () => {
        if (data) {
          queryClient.setQueryData(
            queryKey,
            (data: IInsightsCategorySuggestionsTasks) => {
              return {
                data: { ...data.data, status: 'isScanning' },
              };
            }
          );
        }
        await refetch();
      },
    });

  const { mutate: cancelScanMutate, isLoading: cancelScanLoading } =
    useMutation({
      mutationFn: cancelScanFetcher,
      onSuccess: () => {
        if (data) {
          queryClient.setQueryData(
            queryKey,
            (data: IInsightsCategorySuggestionsTasks) => {
              return {
                data: { ...data.data, status: 'isFinished' },
              };
            }
          );
        }
      },
    });

  const triggerScan = () => triggerScanMutate({ viewId, category, processed });
  const cancelScan = () => cancelScanMutate({ viewId, category, processed });

  const onDone = async () => {
    queryClient.setQueryData(
      queryKey,
      (data: IInsightsCategorySuggestionsTasks) => {
        return {
          data: { ...data.data, status: 'isIdle' },
        };
      }
    );
  };

  const initialCount = data ? data.data.initialCount : 0;

  return {
    isLoading: cancelScanLoading || triggerScanLoading,
    triggerScan,
    status: (data ? data.data.status : 'isIdle') as ScanStatus,
    cancelScan,
    progress: (initialCount - (data?.data.count || 0)) / initialCount || 0,
    onDone,
  };
};

export default useScanForCategorySuggestions;
