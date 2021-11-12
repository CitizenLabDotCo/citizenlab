import { useEffect, useState, useRef } from 'react';
import { insightsCategoriesSuggestionsTasksStream } from '../services/insightsCategoriesSuggestionsTasks';

// services
import { insightsTriggerCategoriesSuggestionsTasks } from 'modules/commercial/insights/services/insightsCategoriesSuggestionsTasks';

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

export type QueryParameters = {
  inputs: string[];
  categories: string[];
};

const useInsightsCatgeoriesSuggestionsTasks = (
  viewId: string,
  category: string
) => {
  const scannedCategories = useRef<ScanProps>({});

  const [status, setStatus] = useState<
    'isIdle' | 'isInitializingScanning' | 'isScanning' | 'isFinished'
  >('isIdle');
  const [initialTasksCount, setInitialTasksCount] = useState(0);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);

  // Initialize category
  useEffect(() => {
    if (!scannedCategories.current[category]) {
      $scanCategory.next({
        ...scannedCategories.current,
        [category]: {
          status: 'isIdle',
          initialTasksCount: 0,
          completedTasksCount: 0,
        },
      });
    }
  }, [category, scannedCategories]);

  // Subscribe to scannedCategoryStream
  useEffect(() => {
    const subscription = scanCategoriesStream().observable.subscribe(
      (result) => {
        scannedCategories.current = result;
        setStatus(result[category].status);
        setInitialTasksCount(result[category].initialTasksCount);
        setCompletedTasksCount(result[category].completedTasksCount);
      }
    );

    return () => subscription.unsubscribe();
  }, [category]);

  // Implement scan
  useEffect(() => {
    const subscription = insightsCategoriesSuggestionsTasksStream(viewId, {
      queryParameters: { categories: [category] },
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
                [category]: {
                  status: 'isScanning',
                  initialTasksCount,
                  completedTasksCount: initialTasksCount - tasks.data.length,
                },
              });
            } else {
              $scanCategory.next({
                ...scannedCategories.current,
                [category]: {
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
                [category]: {
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
  }, [viewId, category, initialTasksCount, status]);

  // Trigger scan
  const triggerScan = async () => {
    try {
      $scanCategory.next({
        ...scannedCategories.current,
        [category]: {
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
      [category]: {
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
    progress: completedTasksCount / initialTasksCount,
  };
};

export default useInsightsCatgeoriesSuggestionsTasks;
