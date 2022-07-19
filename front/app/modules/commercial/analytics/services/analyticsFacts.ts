import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

export const PostsAnalyticsApiEndpoint = `${API_PATH}/analytics/posts`;

export interface AnalyticsResponse {
  any;
}

export async function postsAnalyticsStream(queryObject) {
  return await streams.add<AnalyticsResponse>(
    PostsAnalyticsApiEndpoint,
    queryObject
  );
}
