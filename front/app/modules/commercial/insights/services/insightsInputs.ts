import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship } from 'typings';
import { uuidRegExp } from 'utils/helperUtils';

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

export interface IInsightsInputs {
  data: IInsightsInputData[];
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
    cacheStream: false,
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

  const inputsEndpointRegexp = new RegExp(
    `\/insights\/views\/${uuidRegExp}\/inputs$`
  );
  streams.fetchAllWith({
    regexApiEndpoint: [inputsEndpointRegexp],
    onlyFetchActiveStreams: true,
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

  const inputsEndpointRegexp = new RegExp(
    `\/insights\/views\/${uuidRegExp}\/inputs$`
  );
  streams.fetchAllWith({
    regexApiEndpoint: [inputsEndpointRegexp],
    onlyFetchActiveStreams: true,
  });

  return response;
}
