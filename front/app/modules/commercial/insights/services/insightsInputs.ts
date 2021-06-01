import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship } from 'typings';

// This will be imported from the categories service once we merge everything
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

// interface IInsightsInputObject {
//   scope_id: string;
//   name: string;
// }

const getInsightsInputsEndpoint = (viewId: string) =>
  `insights/views/${viewId}/inputs`;

export function insightsInputsStream(
  insightsViewId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IInsightsInputs>({
    apiEndpoint: `${API_PATH}/${getInsightsInputsEndpoint(insightsViewId)}`,
    ...streamParams,
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

// export function addInsightsInput(object: IInsightsInputObject) {
//   return streams.add<IInsightsInput>(`${API_PATH}/${InsightsInputsEndpoint}`, {
//     view: object,
//   });
// }

// export function updateInsightsInput(InsightsInputId: string, name: string) {
//   return streams.update<IInsightsInput>(
//     `${API_PATH}/${InsightsInputsEndpoint}/${InsightsInputId}`,
//     InsightsInputId,
//     { view: { name } }
//   );
// }

// export function deleteInsightsInput(InsightsInputId: string) {
//   return streams.delete(
//     `${API_PATH}/${InsightsInputsEndpoint}/${InsightsInputId}`,
//     InsightsInputId
//   );
// }
