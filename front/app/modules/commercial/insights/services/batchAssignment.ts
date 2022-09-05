import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

const getInsightsBatchEndpoint = (viewId: string) =>
  `insights/views/${viewId}/batch/`;

// Batch category assignment.
//
// Batch assignment is idempotent. It will not complain if some of the
// assignments already exist.
//
// Batch assignment is transactional. Either it succeeds at assigning all
// categories to all inputs, or the DB is rolled back to its previous state.

export async function batchAssignCategories(
  insightsViewId: string,
  inputs: string[],
  categories: string[]
) {
  const res = await streams.add(
    `${API_PATH}/${getInsightsBatchEndpoint(insightsViewId)}assign_categories`,
    {
      inputs,
      categories,
    }
  );
  streams.fetchAllWith({
    partialApiEndpoint: [
      `insights/views/${insightsViewId}/inputs`,
      `insights/views/${insightsViewId}/categories`,
      `insights/views/${insightsViewId}/stats/inputs_count`,
    ],
  });
  return res;
}

export async function batchUnassignCategories(
  insightsViewId: string,
  inputs: string[],
  categories: string[]
) {
  const res = await streams.add(
    `${API_PATH}/${getInsightsBatchEndpoint(insightsViewId)}remove_categories`,
    {
      inputs,
      categories,
    }
  );
  streams.fetchAllWith({
    partialApiEndpoint: [
      `insights/views/${insightsViewId}/inputs`,
      `insights/views/${insightsViewId}/categories`,
      `insights/views/${insightsViewId}/stats/inputs_count`,
    ],
  });
  return res;
}
