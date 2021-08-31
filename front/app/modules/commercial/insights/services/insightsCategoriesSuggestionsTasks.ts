import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship } from 'typings';

import { interval } from 'rxjs';
import { takeWhile, skip, finalize } from 'rxjs/operators';

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

export interface IInsightsCategoriesSuggestionTasks {
  data: IInsightsCategoriesSuggestionTasksData;
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
  const pollingStream = interval(3000);

  const response = await streams.add(
    `${API_PATH}/${getInsightsCategorySuggestionsTasksEndpoint(
      insightsViewId
    )}`,
    {
      inputs,
      categories,
    }
  );

  // Refetch pending tasks at an interval
  const subscription = pollingStream.subscribe(() => {
    streams.fetchAllWith({
      partialApiEndpoint: [
        `insights/views/${insightsViewId}/tasks/category_suggestions`,
      ],
    });
  });

  insightsCategoriesSuggestionsTasksStream(insightsViewId, {
    queryParameters: { categories, inputs },
  })
    .observable.pipe(
      // Ignore the first emitted value coming from the hook
      skip(1),
      // Poll while there are pending tasks
      takeWhile((response) => {
        return response.data.length > 0;
      }),
      // Refetch inputs when there are no pending tasks
      finalize(() => {
        streams.fetchAllWith({
          apiEndpoint: [
            `${API_PATH}/insights/views/${insightsViewId}/categories`,
          ],
          partialApiEndpoint: [`insights/views/${insightsViewId}/inputs`],
        });
        subscription.unsubscribe();
      })
    )
    .subscribe();

  return response;
}
