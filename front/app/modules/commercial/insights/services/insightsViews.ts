import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship } from 'typings';

export interface IInsightsViewData {
  id: string;
  type: string;
  attributes: {
    name: string;
    updated_at: string;
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

interface IInsightsViewObject {
  scope_id: string;
  name: string;
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

export async function addInsightsView(object: IInsightsViewObject) {
  const response = await streams.add<IInsightsView>(
    `${API_PATH}/${insightsViewsEndpoint}`,
    {
      view: object,
    }
  );
  await streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/${insightsViewsEndpoint}`],
  });
  return response;
}

export function updateInsightsView(insightsViewId: string, name: string) {
  return streams.update<IInsightsView>(
    `${API_PATH}/${insightsViewsEndpoint}/${insightsViewId}`,
    insightsViewId,
    { view: { name } }
  );
}

export function deleteInsightsView(insightsViewId: string) {
  return streams.delete(
    `${API_PATH}/${insightsViewsEndpoint}/${insightsViewId}`,
    insightsViewId
  );
}
