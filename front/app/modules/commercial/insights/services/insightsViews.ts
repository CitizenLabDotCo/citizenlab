import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship } from 'typings';

export interface IInsightsViewData {
  id: string;
  type: string;
  attributes: {
    name: string;
  };
  relationships?: {
    scope: {
      data: IRelationship;
    };
  };
}

export interface IInsightsView {
  data: IInsightsViewData;
}

export interface IInsightsViews {
  data: IInsightsViewData[];
}

export interface IInsightsView {
  data: IInsightsViewData;
}

interface IInsightsViewObject {
  id: string;
  name: string;
}

export interface IInsightsViewPayload {
  view: IInsightsViewObject;
}

const insightsViewsEndpoint = 'insights/views';

export function insightsViewsStream(streamParams: IStreamParams | null = null) {
  return streams.get<IInsightsViews>({
    apiEndpoint: `${API_PATH}/${insightsViewsEndpoint}`,
    ...streamParams,
  });
}

export function insightsViewStream(
  insightsViewId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IInsightsView>({
    apiEndpoint: `${API_PATH}/${insightsViewsEndpoint}/${insightsViewId}`,
    ...streamParams,
  });
}

export function addInsightsView(data: IInsightsViewObject) {
  return streams.add<IInsightsView>(`${API_PATH}/${insightsViewsEndpoint}`, {
    view: data,
  });
}

export function updateInsightsView(
  insightsViewId: string,
  object: IInsightsViewObject
) {
  return streams.update<IInsightsView>(
    `${API_PATH}/${insightsViewsEndpoint}/${insightsViewId}`,
    insightsViewId,
    { view: object }
  );
}

export function deleteInsightsViews(insightsViewId: string) {
  return streams.delete(
    `${API_PATH}/${insightsViewsEndpoint}/${insightsViewId}`,
    insightsViewId
  );
}
