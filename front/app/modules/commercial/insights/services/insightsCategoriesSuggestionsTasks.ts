import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
export interface IInsightsCategorySuggestionsTasks {
  count: number;
}

export function insightsCategoriesSuggestionsTasksStream(
  insightsViewId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IInsightsCategorySuggestionsTasks>({
    apiEndpoint: `${API_PATH}/insights/views/${insightsViewId}/stats/tasks/category_suggestions`,
    ...streamParams,
    cacheStream: false,
    skipSanitizationFor: ['categories'],
  });
}

export async function insightsTriggerCategoriesSuggestionsTasks(
  insightsViewId: string,
  category?: string,
  processed?: boolean
) {
  const response = await streams.add(
    `${API_PATH}/insights/views/${insightsViewId}/tasks/category_suggestions`,
    category
      ? { categories: [category] }
      : typeof category === 'string'
      ? {
          inputs: {
            processed,
            categories: [category],
          },
        }
      : { inputs: { processed } },
    true
  );

  return response;
}

export async function insightsDeleteCategoriesSuggestionsTasks(
  insightsViewId: string,
  category?: string,
  processed?: boolean
) {
  const response = await streams.delete(
    `${API_PATH}/insights/views/${insightsViewId}/tasks/category_suggestions`,
    '',
    true,
    category
      ? { categories: [category] }
      : typeof category === 'string'
      ? {
          inputs: {
            processed,
            categories: [category],
          },
        }
      : { inputs: { processed } }
  );

  return response;
}
