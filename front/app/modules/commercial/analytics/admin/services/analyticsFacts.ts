import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

// Query
export interface Query {
  query: QuerySchema | QuerySchema[];
}

export interface QuerySchema {
  fields?: string | string[];
  fact: 'post' | 'participation' | 'visit';
  filters?: {
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
  aggregations?: AggregationsConfig;
  sort?: {
    [k: string]: 'ASC' | 'DESC';
  };
  limit?: number;
}

export type AggregationsConfig = {
  [k: string]: Aggregation | Aggregation[];
};

type Aggregation = 'min' | 'max' | 'avg' | 'sum' | 'count' | 'first';

export function analyticsStream<Response>(query: Query) {
  return streams.get<Response>({
    apiEndpoint: `${API_PATH}/analytics`,
    queryParameters: query,
  });
}
