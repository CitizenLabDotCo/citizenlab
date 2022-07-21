import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
export interface AnalyticsResponse {
  data: any[];
}

export async function postsAnalyticsStream(queryObject) {
  return await streams.add<AnalyticsResponse>(
    `${API_PATH}/analytics/posts`,
    queryObject
  );
}

export async function participationsAnalyticsStream(queryObject) {
  return await streams.add<AnalyticsResponse>(
    `${API_PATH}/analytics/participations`,
    queryObject
  );
}
