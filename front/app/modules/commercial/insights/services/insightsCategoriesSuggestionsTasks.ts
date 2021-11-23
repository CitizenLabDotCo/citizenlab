import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship } from 'typings';

const getInsightsCategorySuggestionsTasksEndpoint = (viewId: string) =>
  `insights/views/${viewId}/tasks/category_suggestions`;

export interface IInsightsCategoriesSuggestionTasksData {
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

export interface IInsightsCategorySuggestionsTasks {
  data: IInsightsCategoriesSuggestionTasksData[];
}

export function insightsCategoriesSuggestionsTasksStream(
  insightsViewId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IInsightsCategorySuggestionsTasks>({
    apiEndpoint: `${API_PATH}/${getInsightsCategorySuggestionsTasksEndpoint(
      insightsViewId
    )}`,
    ...streamParams,
    cacheStream: false,
  });
}

export async function insightsTriggerCategoriesSuggestionsTasks(
  insightsViewId: string,
  categories?: string[],
  inputs?: string[]
) {
  const response = await streams.add(
    `${API_PATH}/${getInsightsCategorySuggestionsTasksEndpoint(
      insightsViewId
    )}`,
    {
      inputs,
      categories,
    }
  );

  await streams.fetchAllWith({
    partialApiEndpoint: [
      `insights/views/${insightsViewId}/tasks/category_suggestions`,
    ],
  });

  return response;
}
