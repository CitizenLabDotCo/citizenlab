import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

type AnalyticsResponse<T> = {
  data: T[];
};

// Build automatically using json schema backend validator
export interface Query {
  fields?: string | string[];
  fact: 'post' | 'participation';
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
  groups?: string | string[];
  aggregations?: {
    [k: string]:
      | ('min' | 'max' | 'avg' | 'sum' | 'count' | 'first')
      | ('min' | 'max' | 'avg' | 'sum' | 'count' | 'first')[];
  };
  sort?: {
    [k: string]: 'ASC' | 'DESC';
  };
  limit?: number;
}

export async function analyticsStream<T>(queryObject) {
  return await streams.add<AnalyticsResponse<T>>(
    `${API_PATH}/analytics`,
    queryObject
  );
}
