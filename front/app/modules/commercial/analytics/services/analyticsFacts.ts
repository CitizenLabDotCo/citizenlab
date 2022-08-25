import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

type AnalyticsResponse<T> = {
  data: T[];
};

// Build automatically using json schema backend validator
export interface Query {
  query: QuerySchema | QuerySchema[];
}

interface QuerySchema {
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
    [k: string]: Aggregation | Aggregation[];
  };
  sort?: {
    [k: string]: 'ASC' | 'DESC';
  };
  limit?: number;
}

type Aggregation = 'min' | 'max' | 'avg' | 'sum' | 'count' | 'first';

export async function analyticsStream<T>(queryObject) {
  return await streams.add<AnalyticsResponse<T>>(
    `${API_PATH}/analytics`,
    queryObject
  );
}
