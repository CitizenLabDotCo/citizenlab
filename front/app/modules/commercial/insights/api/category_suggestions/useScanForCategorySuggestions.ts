import { useMutation, useQuery } from '@tanstack/react-query';
import { CLError } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { queryClient } from 'utils/cl-react-query/queryClient';
import categorySuggestionsKeys from './keys';
import {
  IInsightsCategorySuggestionsTasks,
  QueryParameters,
  ScanStatus,
  CategorySuggestionsKeys,
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
    path: `/insights/views/${viewId}/tasks/category_suggestions/bla`,
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

  const cachedQueryData = queryClient.getQueryData(queryKey);

  const { data, isError, refetch } = useQuery<
    IInsightsCategorySuggestionsTasks,
    CLError,
    IInsightsCategorySuggestionsTasks,
    CategorySuggestionsKeys
  >({
    queryFn: () =>
      fetchTasks(viewId, { categories: category ? [category] : [], processed }),
    queryKey,
    enabled: cachedQueryData
      ? (cachedQueryData as IInsightsCategorySuggestionsTasks).data.status ===
        'isScanning'
      : false,
    refetchInterval: 5000,
    keepPreviousData: false,
    onSuccess: (data) => {
      if (data.data.count === 0 && data.data.status === 'isScanning') {
        queryClient.setQueryData(queryKey, () => {
          return {
            data: { ...data.data, status: 'isFinished' },
          };
        });
      }
    },
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

  const {
    mutate: triggerScanMutate,
    isLoading: triggerScanLoading,
    isError: isTriggerError,
    reset: resetTriggerScan,
  } = useMutation({
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

  const {
    mutate: cancelScanMutate,
    isLoading: cancelScanLoading,
    isError: isCancelError,
    reset: resetCancelScan,
  } = useMutation({
    mutationFn: cancelScanFetcher,
    onSuccess: () => {
      if (data) {
        queryClient.setQueryData(
          queryKey,
          (data: IInsightsCategorySuggestionsTasks) => {
            return {
              data: { ...data.data, status: 'isIdle' },
            };
          }
        );
      }
    },
  });

  const onDone = async () => {
    resetTriggerScan();
    resetCancelScan();
    queryClient.setQueryData(
      queryKey,
      (data: IInsightsCategorySuggestionsTasks) => {
        return {
          data: { ...(data ? data.data : {}), status: 'isIdle' },
        };
      }
    );
  };

  const triggerScan = () => triggerScanMutate({ viewId, category, processed });
  const cancelScan = () => cancelScanMutate({ viewId, category, processed });

  const initialCount = data ? data.data.initialCount : 0;
  const isLoading = cancelScanLoading || triggerScanLoading;
  const status = (
    isError || isTriggerError || isCancelError
      ? 'isError'
      : data
      ? data.data.status
      : 'isIdle'
  ) as ScanStatus;

  return {
    isLoading,
    triggerScan,
    status,
    cancelScan,
    progress: (initialCount - (data?.data.count || 0)) / initialCount || 0,
    onDone,
  };
};

export default useScanForCategorySuggestions;
