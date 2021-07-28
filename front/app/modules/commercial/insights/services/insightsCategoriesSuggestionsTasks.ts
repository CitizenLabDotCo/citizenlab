import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship } from 'typings';

import { of } from 'rxjs';
import { delay, repeat, takeWhile, skip } from 'rxjs/operators';

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
  const pollingStream = of({}).pipe(delay(3000), repeat());

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
        if (response.data.length === 0) {
          // Refetch inputs when there are no pending tasks
          streams.fetchAllWith({
            partialApiEndpoint: [`insights/views/${insightsViewId}/inputs`],
          });
          subscription.unsubscribe();
        }
        return response.data.length > 0;
      })
    )
    .subscribe();

  return response;
}
