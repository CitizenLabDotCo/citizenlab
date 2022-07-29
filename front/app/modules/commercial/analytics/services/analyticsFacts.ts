import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

type AnalyticsResponse<T> = {
  data: T[];
};

export interface Query {
  query: {
    dimensions?: {
      [k: string]: {
        [k: string]:
          | string
          | unknown[]
          | {
              from: number | string;
              to: number | string;
            };
      };
    };
    groups?: {
      key: string | string[];
      aggregations: {
        [k: string]:
          | ('min' | 'max' | 'avg' | 'sum' | 'count')
          | ('min' | 'max' | 'avg' | 'sum' | 'count')[];
      };
    };
    sort?: {
      [k: string]: 'ASC' | 'DESC';
    };
    limit?: number;
  };
}

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
