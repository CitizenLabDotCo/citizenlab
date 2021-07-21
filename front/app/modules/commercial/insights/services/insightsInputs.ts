import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship } from 'typings';

export interface IInsightsInputData {
  id: string;
  type: string;
  relationships?: {
    categories: { data: IRelationship[] };
    source: {
      data: IRelationship;
    };
  };
}

export interface IInsightsInput {
  data: IInsightsInputData;
}

export interface IInsightsInputLinks {
  self: string;
  first: string;
  prev: string | null;
  next: string | null;
  last: string;
}

export interface IInsightsInputs {
  data: IInsightsInputData[];
  links: IInsightsInputLinks;
}

const getInsightsInputsEndpoint = (viewId: string) =>
  `insights/views/${viewId}/inputs`;

export function insightsInputsStream(
  insightsViewId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IInsightsInputs>({
    apiEndpoint: `${API_PATH}/${getInsightsInputsEndpoint(insightsViewId)}`,
    ...streamParams,
    skipSanitizationFor: ['category'],
  });
}

export function insightsInputStream(
  insightsViewId: string,
  insightsInputId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IInsightsInput>({
    apiEndpoint: `${API_PATH}/${getInsightsInputsEndpoint(
      insightsViewId
    )}/${insightsInputId}`,
    skipSanitizationFor: ['category'],
    cacheStream: false,
    ...streamParams,
  });
}

export async function deleteInsightsInputCategory(
  insightsViewId: string,
  insightsInputId: string,
  insightsCategoryId: string
) {
  const response = await streams.delete(
    `${API_PATH}/${getInsightsInputsEndpoint(
      insightsViewId
    )}/${insightsInputId}/categories/${insightsCategoryId}`,
    insightsCategoryId
  );

  streams.fetchAllWith({
    partialApiEndpoint: [
      `${API_PATH}/${getInsightsInputsEndpoint(insightsViewId)}`,
      `insights/views/${insightsViewId}/categories`,
    ],
  });

  return response;
}

export async function addInsightsInputCategory(
  insightsViewId: string,
  insightsInputId: string,
  insightsCategoryId: string
) {
  const response = await streams.add(
    `${API_PATH}/${getInsightsInputsEndpoint(
      insightsViewId
    )}/${insightsInputId}/categories`,
    { data: [{ id: insightsCategoryId, type: 'category' }] }
  );

  streams.fetchAllWith({
    partialApiEndpoint: [
      `${API_PATH}/${getInsightsInputsEndpoint(insightsViewId)}`,
      `insights/views/${insightsViewId}/categories`,
    ],
  });

  return response;
}
