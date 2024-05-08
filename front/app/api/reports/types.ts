import { Keys } from 'utils/cl-react-query/types';

import reportsKeys from './keys';

export type ReportsKeys = Keys<typeof reportsKeys>;

type EditingReportEnabled = {
  enabled: true;
  disabled_reason: null;
};

type EditingReportDisabled = {
  enabled: false;
  disabled_reason: 'report_has_unauthorized_data';
};

type EditingReport = EditingReportEnabled | EditingReportDisabled;

export interface Report {
  id: string;
  type: 'report';
  attributes: {
    name: string | null;
    created_at: string;
    updated_at: string;
    action_descriptor: {
      editing_report: EditingReport;
    };
    visible: boolean;
  };
  relationships: {
    layout: {
      data: {
        id: string;
        type: 'content-builder-layout';
      };
    };
    owner?: {
      data: {
        id: string;
        type: 'user';
      };
    } | null;
    phase?: {
      data: {
        id: string;
        type: 'phase';
      } | null;
    };
  };
}

export interface ReportsResponse {
  data: Report[];
}

export interface ReportResponse {
  data: Report;
}
