import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import fetcher from 'utils/cl-react-query/fetcher';
import categorySuggestionsKeys from './queryKeys';
import { IInsightsCategorySuggestionsTasks, QueryParameters } from './types';

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

export type ScanStatus =
  | 'isIdle'
  | 'isInitializingScanning'
  | 'isScanning'
  | 'isFinished'
  | 'isError'
  | 'isCancelling';

const useScanForCategorySuggestions = (
  viewId: string,
  category?: string,
  processed?: boolean
) => {
  const [initialCount, setInitialCount] = useState(0);
  const [status, setStatus] = useState<ScanStatus>('isIdle');

  const { data } = useQuery({
    queryFn: () =>
      fetchTasks(viewId, { categories: category ? [category] : [], processed }),
    queryKey: categorySuggestionsKeys.tasks(viewId, {
      categories: category ? [category] : [],
      processed,
    }),
    enabled: status === 'isScanning' || status === 'isInitializingScanning',
    refetchInterval: 5000,
    onSuccess: (data) => {
      if (status === 'isInitializingScanning') {
        setInitialCount(data.data.count);
        setStatus('isScanning');
      }
      if (data.data.count === 0) {
        setStatus('isFinished');
      }
    },
  });

  console.log(data);
  console.log(status);
  const { mutate: triggerScanMutate } = useMutation({
    mutationFn: triggerScanFetcher,
    onSuccess: () => {
      setStatus('isInitializingScanning');
    },
  });

  const { mutate: cancelScanMutate } = useMutation({
    mutationFn: cancelScanFetcher,
    onSuccess: () => {
      setStatus('isScanning');
    },
  });

  const triggerScan = () => triggerScanMutate({ viewId, category, processed });
  const cancelScan = () => cancelScanMutate({ viewId, category, processed });

  const onDone = () => {
    setStatus('isIdle');
  };

  return {
    triggerScan,
    status,
    cancelScan,
    progress: (initialCount - (data?.data.count || 0)) / initialCount || 0,
    onDone,
  };
};

export default useScanForCategorySuggestions;

// import { useEffect, useState, useRef } from 'react';
// import { API_PATH } from 'containers/App/constants';

// // services
// import {
//   insightsCategoriesSuggestionsTasksStream,
//   insightsTriggerCategoriesSuggestionsTasks,
//   insightsDeleteCategoriesSuggestionsTasks,
// } from 'modules/commercial/insights/services/insightsCategoriesSuggestionsTasks';

// tracking
// import { trackEventByName } from 'utils/analytics';
// import tracks from 'modules/commercial/insights/admin/containers/Insights/tracks';

// import { BehaviorSubject } from 'rxjs';
// import { tap, delay } from 'rxjs/operators';

// import streams from 'utils/streams';

// type ScanProps = Record<
//   string,
//   {
//     status: ScanStatus;
//     initialTasksCount: number;
//     completedTasksCount: number;
//   }
// >;

// const $scanCategory: BehaviorSubject<ScanProps> = new BehaviorSubject({});

// export const scanCategoriesStream = () => ({
//   observable: $scanCategory,
// });

// const useInsightsCategoriesSuggestionsTasks = (
//   viewId: string,
//   category?: string,
//   processed?: boolean
// ) => {
//   const scannedCategories = useRef<ScanProps>({});

//   const [status, setStatus] = useState<ScanStatus>('isIdle');
//   const [initialTasksCount, setInitialTasksCount] = useState(0);
//   const [completedTasksCount, setCompletedTasksCount] = useState(0);

//   const hash = `${category}-${processed}`;
//   // Initialize category
//   useEffect(() => {
//     if (!scannedCategories.current[hash]) {
//       $scanCategory.next({
//         ...scannedCategories.current,
//         [hash]: {
//           status: 'isIdle',
//           initialTasksCount: 0,
//           completedTasksCount: 0,
//         },
//       });
//     }
//   }, [hash, scannedCategories]);

//   // Subscribe to scannedCategoryStream
//   useEffect(() => {
//     const subscription = scanCategoriesStream().observable.subscribe(
//       (result) => {
//         scannedCategories.current = result;
//         setStatus(result[hash].status);
//         setInitialTasksCount(result[hash].initialTasksCount);
//         setCompletedTasksCount(result[hash].completedTasksCount);
//       }
//     );

//     return () => subscription.unsubscribe();
//   }, [hash]);

//   // Implement scan
//   useEffect(() => {
//     const subscription = insightsCategoriesSuggestionsTasksStream(viewId, {
//       queryParameters: category
//         ? { categories: [category] }
//         : { inputs: { processed, categories: [category] } },
//     })
//       .observable.pipe(
//         delay(status === 'isScanning' ? 5000 : 0),
//         tap(async (tasks) => {
//           if (tasks.count > 0 && status !== 'isCancelling') {
//             if (initialTasksCount > 0) {
//               $scanCategory.next({
//                 ...scannedCategories.current,
//                 [hash]: {
//                   status: 'isScanning',
//                   initialTasksCount:
//                     tasks.count > initialTasksCount
//                       ? tasks.count
//                       : initialTasksCount,
//                   completedTasksCount: initialTasksCount - tasks.count,
//                 },
//               });
//             } else {
//               $scanCategory.next({
//                 ...scannedCategories.current,
//                 [hash]: {
//                   status: 'isScanning',
//                   initialTasksCount: tasks.count,
//                   completedTasksCount: 0,
//                 },
//               });
//             }

//             await streams.fetchAllWith({
//               apiEndpoint: [`${API_PATH}/insights/views/${viewId}/categories`],
//               partialApiEndpoint: [
//                 `insights/views/${viewId}/stats/tasks/category_suggestions`,
//                 `insights/views/${viewId}/inputs`,
//                 `insights/views/${viewId}/stats/inputs_count`,
//               ],
//               onlyFetchActiveStreams: true,
//             });
//           } else if (status === 'isScanning') {
//             $scanCategory.next({
//               ...scannedCategories.current,
//               [hash]: {
//                 status: 'isFinished',
//                 initialTasksCount: 0,
//                 completedTasksCount: 0,
//               },
//             });
//           } else if (status === 'isCancelling' && tasks.count === 0) {
//             $scanCategory.next({
//               ...scannedCategories.current,
//               [hash]: {
//                 status: 'isIdle',
//                 initialTasksCount: 0,
//                 completedTasksCount: 0,
//               },
//             });
//           }
//         })
//       )
//       .subscribe();

//     return () => {
//       subscription.unsubscribe();
//     };
//   }, [viewId, category, initialTasksCount, status, processed, hash]);

//   // Trigger scan
//   const triggerScan = async () => {
//     try {
//       $scanCategory.next({
//         ...scannedCategories.current,
//         [hash]: {
//           status: 'isInitializingScanning',
//           initialTasksCount: 0,
//           completedTasksCount: 0,
//         },
//       });
//       await insightsTriggerCategoriesSuggestionsTasks(
//         viewId,
//         category,
//         processed
//       );

//       await streams.fetchAllWith({
//         partialApiEndpoint: [
//           `insights/views/${viewId}/stats/tasks/category_suggestions`,
//         ],
//       });
//     } catch {
//       $scanCategory.next({
//         ...scannedCategories.current,
//         [hash]: {
//           status: 'isError',
//           initialTasksCount: 0,
//           completedTasksCount: 0,
//         },
//       });
//     }
//     trackEventByName(tracks.scanForSuggestions);
//   };

//   // Cancel scan
//   const cancelScan = async () => {
//     try {
//       $scanCategory.next({
//         ...scannedCategories.current,
//         [hash]: {
//           status: 'isCancelling',
//           initialTasksCount: 0,
//           completedTasksCount: 0,
//         },
//       });
//       await insightsDeleteCategoriesSuggestionsTasks(
//         viewId,
//         category,
//         processed
//       );
//       await streams.fetchAllWith({
//         partialApiEndpoint: [
//           `insights/views/${viewId}/stats/tasks/category_suggestions`,
//         ],
//       });
//     } catch {
//       $scanCategory.next({
//         ...scannedCategories.current,
//         [hash]: {
//           status: 'isError',
//           initialTasksCount: 0,
//           completedTasksCount: 0,
//         },
//       });
//     }
//     trackEventByName(tracks.cancelScanForSuggestions);
//   };

//   // Done
//   const onDone = () => {
//     $scanCategory.next({
//       ...scannedCategories.current,
//       [hash]: {
//         status: 'isIdle',
//         initialTasksCount: 0,
//         completedTasksCount: 0,
//       },
//     });
//   };

//   return {
//     triggerScan,
//     cancelScan,
//     onDone,
//     status,
//     progress: completedTasksCount / initialTasksCount || 0,
//   };
// };

// export default useInsightsCategoriesSuggestionsTasks;
