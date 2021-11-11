import { useState, useEffect } from 'react';
import { insightsCategoriesSuggestionsTasksStream } from '../services/insightsCategoriesSuggestionsTasks';

// services
import { insightsTriggerCategoriesSuggestionsTasks } from 'modules/commercial/insights/services/insightsCategoriesSuggestionsTasks';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from 'modules/commercial/insights/admin/containers/Insights/tracks';

import { interval, BehaviorSubject } from 'rxjs';
import { takeWhile, finalize, skip } from 'rxjs/operators';

import streams from 'utils/streams';

type ScannedCategory = {
  id: string;
  status: 'isScanning' | 'isFinished' | 'isError';
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

const pollingStream = interval(4000);

const useInsightsCatgeoriesSuggestionsTasks = (
  viewId: string,
  queryParameters?: Partial<QueryParameters>
) => {
  const [loading, setLoading] = useState(true);

  const categories = queryParameters?.categories;
  const inputs = queryParameters?.inputs;

  useEffect(() => {
    const subscription = insightsCategoriesSuggestionsTasksStream(viewId, {
      queryParameters: { categories, inputs },
    }).observable.subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [viewId, categories, inputs, loading]);

  useEffect(() => {
    // Refetch pending tasks at an interval
    const subscription = pollingStream.subscribe(() => {
      streams.fetchAllWith({
        partialApiEndpoint: [
          `insights/views/${viewId}/tasks/category_suggestions`,
        ],
      });
    });

    const streamSubscription = insightsCategoriesSuggestionsTasksStream(
      viewId,
      {
        queryParameters: { categories, inputs },
      }
    )
      .observable.pipe(
        skip(1),
        takeWhile((response) => {
          return response.data.length > 0;
        }),
        finalize(() => {
          subscription.unsubscribe();
          setLoading(false);
        })
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      streamSubscription.unsubscribe();
    };
  }, [viewId, categories, inputs, loading]);

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
