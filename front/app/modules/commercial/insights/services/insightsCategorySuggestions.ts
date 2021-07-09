import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

const getInsightsCategoriesSuggestionsEndpoint = (viewId: string) =>
  `insights/views/${viewId}/tasks/category_suggestions`;

export async function insightsSuggestCategories(
  insightsViewId: string,
  inputs: string[],
  categories: string[]
) {
  const result = await streams.add(
    `${API_PATH}/${getInsightsCategoriesSuggestionsEndpoint(insightsViewId)}`,
    {
      inputs,
      categories,
    }
  );
  streams.fetchAllWith({
    partialApiEndpoint: [
      `insights/views/${insightsViewId}/inputs`,
      `insights/views/${insightsViewId}/categories`,
    ],
  });
  return result;
}
