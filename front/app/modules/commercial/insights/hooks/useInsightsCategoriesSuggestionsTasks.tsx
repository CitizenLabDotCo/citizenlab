import { useState, useEffect } from 'react';
import {
  insightsCategoriesSuggestionsTasksStream,
  IInsightsCategoriesSuggestionTasksData,
} from '../services/insightsCategoriesSuggestionsTasks';

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
    const subscription = insightsCategoriesSuggestionsTasksStream(viewId, {
      queryParameters: { categories, inputs },
    }).observable.subscribe((insightsCategories) => {
      setInsightsCategoriesSuggestions(insightsCategories.data);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [viewId, categories, inputs]);

  return insightsCategoriesSuggestions;
};

export default useInsightsCatgeoriesSuggestionsTasks;
