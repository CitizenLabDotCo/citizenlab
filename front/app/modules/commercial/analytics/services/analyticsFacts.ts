import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

type AnalyticsResponse<T> = {
  data: T[];
};

export async function postsAnalyticsStream<T>(queryObject) {
  return await streams.add<AnalyticsResponse<T>>(
    `${API_PATH}/analytics/posts`,
    queryObject
  );
}

export async function participationsAnalyticsStream<T>(queryObject) {
  return await streams.add<AnalyticsResponse<T>>(
    `${API_PATH}/analytics/participations`,
    queryObject
  );
}
