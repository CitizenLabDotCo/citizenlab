import { useEffect, useState, useRef } from 'react';
import { insightsCategoriesSuggestionsTasksStream } from '../services/insightsCategoriesSuggestionsTasks';

// services
import { insightsTriggerCategoriesSuggestionsTasks } from 'modules/commercial/insights/services/insightsCategoriesSuggestionsTasks';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from 'modules/commercial/insights/admin/containers/Insights/tracks';

import { BehaviorSubject } from 'rxjs';

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

  // Implement polling
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const subscription = insightsCategoriesSuggestionsTasksStream(viewId, {
      queryParameters: { categories: [category] },
    }).observable.subscribe((tasks) => {
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

        timeout = setTimeout(async () => {
          await streams.fetchAllWith({
            partialApiEndpoint: [
              `insights/views/${viewId}/tasks/category_suggestions`,
              `insights/views/${viewId}/inputs`,
            ],
            onlyFetchActiveStreams: true,
          });
        }, 4000);
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
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [viewId, category, initialTasksCount, status]);

  // Trigger tasks method
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

  // Done method
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
