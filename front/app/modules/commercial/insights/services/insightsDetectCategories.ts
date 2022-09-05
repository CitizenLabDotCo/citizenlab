import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const getInsightsDetectCategoriesEndpoint = (viewId: string) =>
  `insights/views/${viewId}/detected_categories`;

export type IInsightsDetectedCategoriesData = {
  id: string;
  attributes: {
    name: string;
  };
}[];

export interface IInsightsDetectedCategories {
  data: IInsightsDetectedCategoriesData;
}

export function insightsDetectedCategoriesStream(
  insightsViewId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IInsightsDetectedCategories>({
    apiEndpoint: `${API_PATH}/${getInsightsDetectCategoriesEndpoint(
      insightsViewId
    )}`,
    ...streamParams,
    cacheStream: false,
  });
}
