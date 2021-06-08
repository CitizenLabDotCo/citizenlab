import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship } from 'typings';

export interface IInsightsCategoryData {
  id: string;
  type: string;
  attributes: {
    name: string;
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

const getInsightsCategoriesEndpoint = (viewId) =>
  `insights/views/${viewId}/categories/`;

export function insightsCategoriesStream(
  insightsViewId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IInsightsCategories>({
    apiEndpoint: `${API_PATH}/${getInsightsCategoriesEndpoint(insightsViewId)}`,
    ...streamParams,
    cacheStream: false,
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
    cacheStream: false,
  });
}

export function addInsightsCategory(insightsViewId: string, name: string) {
  return streams.add<IInsightsCategory>(
    `${API_PATH}/${getInsightsCategoriesEndpoint(insightsViewId)}`,
    {
      category: { name },
    }
  );
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

export function deleteInsightsCategories(
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
