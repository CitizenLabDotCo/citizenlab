import { useState, useEffect } from 'react';
import {
  insightsCategoriesSuggestionsStream,
  IInsightsSuggestedCategoryData,
} from '../services/insightsCategorySuggestions';

type QueryParameters = {
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
  ] = useState<IInsightsSuggestedCategoryData[] | undefined | null | Error>(
    undefined
  );
  const categories = queryParameters?.categories;
  const inputs = queryParameters?.inputs;

  useEffect(() => {
    const subscription = insightsCategoriesSuggestionsStream(viewId, {
      queryParameters: { categories, inputs },
    }).observable.subscribe((insightsCategories) => {
      setInsightsCategoriesSuggestions(insightsCategories.data);
    });

    return () => subscription.unsubscribe();
  }, [viewId, categories, inputs]);

  return insightsCategoriesSuggestions;
};

export default useInsightsCategoriesSuggestions;
