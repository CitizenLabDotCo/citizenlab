import streams, { IStreamParams } from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

const getInsightsInputsEndpoint = (viewId: string) =>
  `insights/views/${viewId}/stats/inputs_count`;

export interface IInsightsInputsCount {
  count: number;
}

export function insightsInputsCountStream(
  insightsViewId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IInsightsInputsCount>({
    apiEndpoint: `${API_PATH}/${getInsightsInputsEndpoint(insightsViewId)}`,
    ...streamParams,
    skipSanitizationFor: ['categories'],
  });
}
