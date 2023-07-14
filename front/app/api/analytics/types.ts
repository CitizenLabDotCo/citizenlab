// Query
export interface Query {
  query: QuerySchema | QuerySchema[];
}

export interface QuerySchema {
  fields?: string | string[];
  fact:
    | 'post'
    | 'participation'
    | 'visit'
    | 'registration'
    | 'event'
    | 'project_status'
    | 'email_delivery';
  filters?: {
    [k: string]:
      | string
      | unknown[]
      | unknown
      | {
          from: number | string;
          to: number | string;
        };
  };
  groups?: string | string[];
  aggregations?: AggregationsConfig;
  sort?: {
    [k: string]: 'ASC' | 'DESC';
  };
  page?: {
    size?: number;
    number?: number;
  };
}

export type AggregationsConfig = {
  [k: string]: Aggregation | Aggregation[];
};

type Aggregation = 'min' | 'max' | 'avg' | 'sum' | 'count' | 'first';
