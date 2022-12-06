import { IRelationship } from 'typings';
import streams, { IStreamParams } from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

export interface IInsightsCategoryData {
  id: string;
  type: string;
  attributes: {
    name: string;
    inputs_count: number;
  };
  relationships?: {
    view: {
      data: IRelationship;
    };
  };
}

export interface IInsightsCategory {
  data: IInsightsCategoryData;
}

export interface IInsightsCategories {
  data: IInsightsCategoryData[];
}

const getInsightsCategoriesEndpoint = (viewId: string) =>
  `insights/views/${viewId}/categories`;

export function insightsCategoriesStream(
  insightsViewId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IInsightsCategories>({
    apiEndpoint: `${API_PATH}/${getInsightsCategoriesEndpoint(insightsViewId)}`,
    ...streamParams,
  });
}

export function insightsCategoryStream(
  insightsViewId: string,
  insightsCategoryId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IInsightsCategory>({
    apiEndpoint: `${API_PATH}/${getInsightsCategoriesEndpoint(
      insightsViewId
    )}/${insightsCategoryId}`,
    ...streamParams,
  });
}

interface AddInsightsCategoryParams {
  insightsViewId: string;
  name: string;
  inputs?: {
    keywords?: string[];
    categories?: string[];
    search?: string;
  };
}

export async function addInsightsCategory({
  insightsViewId,
  name,
  inputs,
}: AddInsightsCategoryParams) {
  const response = await streams.add<IInsightsCategory>(
    `${API_PATH}/${getInsightsCategoriesEndpoint(insightsViewId)}`,
    {
      category: { name, inputs },
    }
  );
  streams.fetchAllWith({
    partialApiEndpoint: [
      `insights/views/${insightsViewId}/inputs`,
      `insights/views/${insightsViewId}/categories`,
    ],
  });
  return response;
}

export function updateInsightsCategory(
  insightsViewId: string,
  insightsCategoryId: string,
  name: string
) {
  return streams.update<IInsightsCategories>(
    `${API_PATH}/${getInsightsCategoriesEndpoint(
      insightsViewId
    )}/${insightsCategoryId}`,
    insightsCategoryId,
    { category: { name } }
  );
}

export async function deleteInsightsCategories(insightsViewId: string) {
  const response = await streams.delete(
    `${API_PATH}/${getInsightsCategoriesEndpoint(insightsViewId)}`,
    ''
  );

  streams.fetchAllWith({
    partialApiEndpoint: [
      `insights/views/${insightsViewId}/inputs`,
      `insights/views/${insightsViewId}/categories`,
      `insights/views/${insightsViewId}/stats/inputs_count`,
    ],
  });

  return response;
}

export function deleteInsightsCategory(
  insightsViewId: string,
  insightsCategoryId: string
) {
  return streams.delete(
    `${API_PATH}/${getInsightsCategoriesEndpoint(
      insightsViewId
    )}/${insightsCategoryId}`,
    insightsCategoryId
  );
}
