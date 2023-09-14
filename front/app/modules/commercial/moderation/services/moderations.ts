import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

export interface IModerationsCount {
  data: {
    type: 'moderations_count';
    attributes: { count: number };
  };
}

export function moderationsCountStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<IModerationsCount>({
    apiEndpoint: `${API_PATH}/moderations/moderations_count`,
    ...streamParams,
  });
}
