import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

export const apiEndpoint = `${API_PATH}/stats`;

// Users

export interface IUsersByTime {
  series: {
    users: {
      [key: string]: number;
    };
  };
}

export const activeUsersByTimeXlsxEndpoint = `${apiEndpoint}/active_users_by_time_as_xlsx`;

export function activeUsersByTimeStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<IUsersByTime>({
    apiEndpoint: `${apiEndpoint}/active_users_by_time`,
    ...streamParams,
  });
}

export const activeUsersByTimeCumulativeXlsxEndpoint = `${apiEndpoint}/active_users_by_time_cumulative_as_xlsx`;
