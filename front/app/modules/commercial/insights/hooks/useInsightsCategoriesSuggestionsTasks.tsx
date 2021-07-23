import { useState, useEffect } from 'react';
import {
  insightsCategoriesSuggestionsTasksStream,
  IInsightsCategoriesSuggestionTasksData,
} from '../services/insightsCategoriesSuggestionsTasks';
import { isNilOrError } from 'utils/helperUtils';
import streams from 'utils/streams';
import { timer } from 'rxjs';

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
  const categories = queryParameters?.categories;
  const inputs = queryParameters?.inputs;

  useEffect(() => {
    let data:
      | IInsightsCategoriesSuggestionTasksData[]
      | undefined
      | null
      | Error;
    const subscription = insightsCategoriesSuggestionsTasksStream(viewId, {
      queryParameters: { categories, inputs },
    }).observable.subscribe((insightsCategories) => {
      data = insightsCategories.data;
      setInsightsCategoriesSuggestions(insightsCategories.data);
    });

    const pollingTimer = timer(5000, 5000).subscribe(() => {
      if (!isNilOrError(data) && data.length > 0) {
        streams.fetchAllWith({
          partialApiEndpoint: [
            `insights/views/${viewId}/tasks/category_suggestions`,
            `insights/views/${viewId}/inputs`,
          ],
        });
      }
    });
    return () => {
      subscription.unsubscribe();
      pollingTimer.unsubscribe();
    };
  }, [viewId, categories, inputs]);

  return insightsCategoriesSuggestions;
};

export default useInsightsCatgeoriesSuggestionsTasks;
