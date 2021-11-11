import { useState, useEffect } from 'react';
import { insightsCategoriesSuggestionsTasksStream } from '../services/insightsCategoriesSuggestionsTasks';

// services
import { insightsTriggerCategoriesSuggestionsTasks } from 'modules/commercial/insights/services/insightsCategoriesSuggestionsTasks';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from 'modules/commercial/insights/admin/containers/Insights/tracks';

import { BehaviorSubject } from 'rxjs';

import streams from 'utils/streams';

type ScannedCategory = {
  id: string;
  status: 'idle' | 'isScanning' | 'isFinished' | 'isError';
  initialTasksCount: number;
};

const $scanCategory: BehaviorSubject<ScannedCategory[]> = new BehaviorSubject(
  []
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

  const categories = queryParameters?.categories;
  const inputs = queryParameters?.inputs;

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const subscription = insightsCategoriesSuggestionsTasksStream(viewId, {
      queryParameters: { categories, inputs },
    }).observable.subscribe((tasks) => {
      if (tasks.data.length > 0) {
        //   if (categories) { $scanCategory.next([{ id: categories[0], status: 'isScanning', initialTasksCount: 0 }]); }
        setLoading(true);
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
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [viewId, categories, inputs]);

  const suggestCategories = async () => {
    try {
      setLoading(true);
      await insightsTriggerCategoriesSuggestionsTasks(viewId, categories);
    } catch {
      // Do nothing
    }
    trackEventByName(tracks.scanForSuggestions);
  };

  return { loading, suggestCategories };
};

export default useInsightsCatgeoriesSuggestionsTasks;
