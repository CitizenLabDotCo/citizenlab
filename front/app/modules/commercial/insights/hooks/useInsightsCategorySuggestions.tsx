import { useState, useEffect } from 'react';
import {
  insightsCategorySuggestionsStream,
  IInsightsCategorySuggestionData,
} from '../services/insightsCategorySuggestions';

export type QueryParameters = {
  inputs: string[];
  categories: string[];
};
const useInsightsCategoriesSuggestions = (
  viewId: string,
  queryParameters?: Partial<QueryParameters>
) => {
  const [
    insightsCategoriesSuggestions,
    setInsightsCategoriesSuggestions,
  ] = useState<IInsightsCategorySuggestionData[] | undefined | null | Error>(
    undefined
  );
  const categories = queryParameters?.categories;
  const inputs = queryParameters?.inputs;

  useEffect(() => {
    const subscription = insightsCategorySuggestionsStream(viewId, {
      queryParameters: { categories, inputs },
    }).observable.subscribe((insightsCategories) => {
      setInsightsCategoriesSuggestions(insightsCategories.data);
    });

    return () => subscription.unsubscribe();
  }, [viewId, categories, inputs]);

  return insightsCategoriesSuggestions;
};

export default useInsightsCategoriesSuggestions;
