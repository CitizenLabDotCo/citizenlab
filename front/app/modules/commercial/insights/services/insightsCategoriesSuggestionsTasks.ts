import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship } from 'typings';

import { of } from 'rxjs';
import { delay, repeat, takeWhile } from 'rxjs/operators';

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
  const response = await streams.add(
    `${API_PATH}/${getInsightsCategorySuggestionsTasksEndpoint(
      insightsViewId
    )}`,
    {
      inputs,
      categories,
    }
  );

  const pollingSubscription = of({})
    .pipe(delay(3000), repeat())
    .subscribe(() => {
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
      // Only poll while there are remaining tasks
      takeWhile((response) => {
        // Refetch inputs when no tasks remain
        if (response.data.length === 0) {
          streams.fetchAllWith({
            partialApiEndpoint: [`insights/views/${insightsViewId}/inputs`],
          });
          pollingSubscription.unsubscribe();
        }
        return response.data.length > 0;
      })
    )
    .subscribe();

  return response;
}
