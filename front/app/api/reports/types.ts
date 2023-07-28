import { Keys } from 'utils/cl-react-query/types';
import reportsKeys from './keys';

export type ReportsKeys = Keys<typeof reportsKeys>;

export interface Report {
  id: string;
  type: 'report';
  attributes: {
    name: string;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    layout: {
      data: {
        id: string;
        type: 'content-builder-layout';
      };
    };
    owner: {
      data: {
        id: string;
        type: 'user';
      };
    };
  };
}

export interface ReportsResponse {
  data: Report[];
}

export interface ReportResponse {
  data: Report;
}
