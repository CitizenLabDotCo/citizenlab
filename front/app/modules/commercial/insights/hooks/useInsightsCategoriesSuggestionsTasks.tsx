import { useState, useEffect, useRef } from 'react';
import { insightsCategoriesSuggestionsTasksStream } from '../services/insightsCategoriesSuggestionsTasks';

// services
import { insightsTriggerCategoriesSuggestionsTasks } from 'modules/commercial/insights/services/insightsCategoriesSuggestionsTasks';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from 'modules/commercial/insights/admin/containers/Insights/tracks';

import { BehaviorSubject } from 'rxjs';

import streams from 'utils/streams';

type ScannedCategories = Record<
  string,
  { status: 'idle' | 'isScanning' | 'isFinished' | 'isError' }
>;

const $scanCategory: BehaviorSubject<ScannedCategories> = new BehaviorSubject(
  {}
);

export const scannedCategoriesStream = () => ({
  observable: $scanCategory,
});

export type QueryParameters = {
  inputs: string[];
  categories: string[];
};

const useInsightsCatgeoriesSuggestionsTasks = (
  viewId: string,
  queryParameters?: Partial<QueryParameters>
) => {
  const [loading, setLoading] = useState(true);
  const scannedCategories = useRef<ScannedCategories>({});

  const categories = queryParameters?.categories;
  const category = categories && categories[0];
  const inputs = queryParameters?.inputs;

  useEffect(() => {
    const subscription = scannedCategoriesStream().observable.subscribe(
      (result) => {
        scannedCategories.current = result;
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const subscription = insightsCategoriesSuggestionsTasksStream(viewId, {
      queryParameters: { categories, inputs },
    }).observable.subscribe((tasks) => {
      console.log({ tasks: tasks.data });
      if (tasks.data.length > 0) {
        setLoading(true);
        //  category && $scanCategory.next({ ...scannedCategories, [category]: { status: 'isScanning' } })
        timeout = setTimeout(() => {
          streams.fetchAllWith({
            partialApiEndpoint: [
              `insights/views/${viewId}/tasks/category_suggestions`,
              `insights/views/${viewId}/inputs`,
            ],
            onlyFetchActiveStreams: true,
          });
        }, 4000);
      } else {
        if (category && scannedCategories.current[category]) {
          console.log('here');
          $scanCategory.next({
            ...scannedCategories.current,
            [category]: { status: 'isFinished' },
          });
        }
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [viewId, categories, inputs, category]);

  const triggerScan = async () => {
    try {
      setLoading(true);
      category &&
        $scanCategory.next({
          ...scannedCategories.current,
          [category]: { status: 'isScanning' },
        });
      await insightsTriggerCategoriesSuggestionsTasks(viewId, categories);
    } catch {
      // Do nothing
    }
    trackEventByName(tracks.scanForSuggestions);
  };
  console.log(scannedCategories.current);
  return { loading, triggerScan };
};

export default useInsightsCatgeoriesSuggestionsTasks;
