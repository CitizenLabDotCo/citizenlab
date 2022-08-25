import { API_PATH } from 'containers/App/constants';
import { Multiloc } from 'typings';
import streams from 'utils/streams';

// Query
export interface Query {
  query: QuerySchema | QuerySchema[];
}

export interface QuerySchema {
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

// Response
export type Response = {
  data: [FeedbackRow[], StatusRow[]];
};

export interface FeedbackRow {
  sum_feedback_none: number;
  sum_feedback_official: number;
  sum_feedback_status_change: number;
  avg_feedback_time_taken: number;
}

interface StatusRow {
  count: number;
  'status.id': string;
  first_status_title_multiloc: Multiloc;
}

export async function analyticsStream(queryObject) {
  return await streams.add<Response>(`${API_PATH}/analytics`, queryObject);
}
