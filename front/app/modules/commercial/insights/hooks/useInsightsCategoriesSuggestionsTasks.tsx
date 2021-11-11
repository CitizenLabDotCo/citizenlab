import { useState, useEffect } from 'react';
import {
  insightsCategoriesSuggestionsTasksStream,
  IInsightsCategoriesSuggestionTasksData,
} from '../services/insightsCategoriesSuggestionsTasks';

// services
import { insightsTriggerCategoriesSuggestionsTasks } from 'modules/commercial/insights/services/insightsCategoriesSuggestionsTasks';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from 'modules/commercial/insights/admin/containers/Insights/tracks';

import { interval } from 'rxjs';
import { takeWhile, finalize } from 'rxjs/operators';

import streams from 'utils/streams';

const pollingStream = interval(4000);

export type QueryParameters = {
  inputs: string[];
  categories: string[];
};

const useInsightsCatgeoriesSuggestionsTasks = (
  viewId: string,
  queryParameters?: Partial<QueryParameters>
) => {
  const [
    insightsCategoriesSuggestions,
    setInsightsCategoriesSuggestions,
  ] = useState<
    IInsightsCategoriesSuggestionTasksData[] | undefined | null | Error
  >(undefined);
  const [loading, setLoading] = useState(true);

  const categories = queryParameters?.categories;
  const inputs = queryParameters?.inputs;

  useEffect(() => {
    const subscription = insightsCategoriesSuggestionsTasksStream(viewId, {
      queryParameters: { categories, inputs },
    }).observable.subscribe((insightsCategories) => {
      if (!loading) {
        setInsightsCategoriesSuggestions(insightsCategories.data);
      }
    });

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
        // Poll while there are pending tasks
        takeWhile((response) => {
          return response.data.length > 0;
        }),
        // Refetch network when there are no pending tasks
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

  return { loading, insightsCategoriesSuggestions, suggestCategories };
};

export default useInsightsCatgeoriesSuggestionsTasks;
