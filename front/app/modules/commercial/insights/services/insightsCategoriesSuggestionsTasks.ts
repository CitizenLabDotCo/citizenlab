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
    skipSanitizationFor: ['categories'],
  });
}

export async function insightsTriggerCategoriesSuggestionsTasks(
  insightsViewId: string,
  categories?: string[],
  processed?: boolean
) {
  const response = await streams.add(
    `${API_PATH}/${getInsightsCategorySuggestionsTasksEndpoint(
      insightsViewId
    )}`,
    {
      input_filter: { processed, categories },
    }
  );

  return response;
}
