import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship } from 'typings';

const getInsightsCategorySuggestionsEndpoint = (viewId: string) =>
  `insights/views/${viewId}/tasks/category_suggestions`;

export interface IInsightsCategorySuggestionData {
  id: string;
  type: string;
  attributes: {
    created_at: string;
  };
  relationships?: {
    categories: {
      data: IRelationship[];
    };
    inputs: {
      data: IRelationship[];
    };
  };
}

export interface IInsightsCategorySuggestion {
  data: IInsightsCategorySuggestionData;
}

export interface IInsightsCategorySuggestions {
  data: IInsightsCategorySuggestionData[];
}

export function insightsCategorySuggestionsStream(
  insightsViewId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IInsightsCategorySuggestions>({
    apiEndpoint: `${API_PATH}/${getInsightsCategorySuggestionsEndpoint(
      insightsViewId
    )}`,
    ...streamParams,
    cacheStream: false,
  });
}

export async function insightsSuggestCategories(
  insightsViewId: string,
  categories?: string[],
  inputs?: string[]
) {
  const response = await streams.add(
    `${API_PATH}/${getInsightsCategorySuggestionsEndpoint(insightsViewId)}`,
    {
      inputs,
      categories,
    }
  );

  streams.fetchAllWith({
    partialApiEndpoint: [
      `insights/views/${insightsViewId}/tasks/category_suggestions`,
      `insights/views/${insightsViewId}/inputs`,
    ],
  });
  return response;
}
