import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship } from 'typings';

const getInsightsCategoriesSuggestionsEndpoint = (viewId: string) =>
  `insights/views/${viewId}/tasks/category_suggestions`;

export interface IInsightsSuggestedCategoryData {
  id: string;
  type: string;
  attributes: {
    created_at: string;
  };
  relationships?: {
    categories: {
      data: IRelationship;
    };
    inputs: {
      data: IRelationship;
    };
  };
}

export interface IInsightsSuggestedCategory {
  data: IInsightsSuggestedCategoryData;
}

export interface IInsightsSuggestedCategories {
  data: IInsightsSuggestedCategoryData[];
}

export function insightsCategoriesSuggestionsStream(
  insightsViewId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IInsightsSuggestedCategories>({
    apiEndpoint: `${API_PATH}/${getInsightsCategoriesSuggestionsEndpoint(
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
  return await streams.add(
    `${API_PATH}/${getInsightsCategoriesSuggestionsEndpoint(insightsViewId)}`,
    {
      inputs,
      categories,
    }
  );
}
