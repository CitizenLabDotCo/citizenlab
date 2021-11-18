import { useEffect, useState, useRef } from 'react';

// services
import {
  insightsCategoriesSuggestionsTasksStream,
  insightsTriggerCategoriesSuggestionsTasks,
} from 'modules/commercial/insights/services/insightsCategoriesSuggestionsTasks';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from 'modules/commercial/insights/admin/containers/Insights/tracks';

import { BehaviorSubject } from 'rxjs';
import { tap, delay } from 'rxjs/operators';

import streams from 'utils/streams';

export type ScanStatus =
  | 'isIdle'
  | 'isInitializingScanning'
  | 'isScanning'
  | 'isFinished';

type ScanProps = Record<
  string,
  {
    status: ScanStatus;
    initialTasksCount: number;
    completedTasksCount: number;
  }
>;

const $scanCategory: BehaviorSubject<ScanProps> = new BehaviorSubject({});

export const scanCategoriesStream = () => ({
  observable: $scanCategory,
});

const useInsightsCatgeoriesSuggestionsTasks = (
  viewId: string,
  category: string,
  processed?: boolean
) => {
  const scannedCategories = useRef<ScanProps>({});

  const [status, setStatus] = useState<ScanStatus>('isIdle');
  const [initialTasksCount, setInitialTasksCount] = useState(0);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);

  const hash = `${category}-${processed}`;
  // Initialize category
  useEffect(() => {
    if (!scannedCategories.current[hash]) {
      $scanCategory.next({
        ...scannedCategories.current,
        [hash]: {
          status: 'isIdle',
          initialTasksCount: 0,
          completedTasksCount: 0,
        },
      });
    }
  }, [hash, scannedCategories]);

  // Subscribe to scannedCategoryStream
  useEffect(() => {
    const subscription = scanCategoriesStream().observable.subscribe(
      (result) => {
        scannedCategories.current = result;
        setStatus(result[hash].status);
        setInitialTasksCount(result[hash].initialTasksCount);
        setCompletedTasksCount(result[hash].completedTasksCount);
      }
    );

    return () => subscription.unsubscribe();
  }, [hash]);

  // Implement scan
  useEffect(() => {
    const subscription = insightsCategoriesSuggestionsTasksStream(viewId, {
      queryParameters: { categories: [category], processed },
    })
      .observable.pipe(
        delay(
          status === 'isScanning' || status === 'isInitializingScanning'
            ? 4000
            : 0
        ),
        tap(async (tasks) => {
          if (tasks.data.length > 0) {
            if (initialTasksCount > 0) {
              $scanCategory.next({
                ...scannedCategories.current,
                [hash]: {
                  status: 'isScanning',
                  initialTasksCount,
                  completedTasksCount: initialTasksCount - tasks.data.length,
                },
              });
            } else {
              $scanCategory.next({
                ...scannedCategories.current,
                [hash]: {
                  status: 'isScanning',
                  initialTasksCount: tasks.data.length,
                  completedTasksCount: 0,
                },
              });
            }

            await streams.fetchAllWith({
              partialApiEndpoint: [
                `insights/views/${viewId}/tasks/category_suggestions`,
                `insights/views/${viewId}/inputs`,
              ],
              onlyFetchActiveStreams: true,
            });
          } else {
            if (status === 'isScanning') {
              $scanCategory.next({
                ...scannedCategories.current,
                [hash]: {
                  status: 'isFinished',
                  initialTasksCount: 0,
                  completedTasksCount: 0,
                },
              });
            }
          }
        })
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [viewId, category, initialTasksCount, status, processed, hash]);

  // Trigger scan
  const triggerScan = async () => {
    try {
      $scanCategory.next({
        ...scannedCategories.current,
        [hash]: {
          status: 'isInitializingScanning',
          initialTasksCount: 0,
          completedTasksCount: 0,
        },
      });
      await insightsTriggerCategoriesSuggestionsTasks(viewId, [category]);
    } catch {
      // Do nothing
    }
    trackEventByName(tracks.scanForSuggestions);
  };

  // Done
  const onDone = () => {
    $scanCategory.next({
      ...scannedCategories.current,
      [hash]: {
        status: 'isIdle',
        initialTasksCount: 0,
        completedTasksCount: 0,
      },
    });
  };

  return {
    triggerScan,
    onDone,
    status,
    progress: completedTasksCount / initialTasksCount || 0,
  };
};

export default useInsightsCatgeoriesSuggestionsTasks;
