import { Multiloc } from 'typings';

import { ProjectId, Dates } from 'components/admin/GraphCards/typings';
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';
import { XlsxData } from 'components/admin/ReportExportMenu';

export type QueryParameters = ProjectId & Dates;

// Response
export type Response = {
  data: {
    type: 'analytics';
    attributes: [[FeedbackRow], StatusRow[]];
  };
};

export type EmptyResponse = {
  data: {
    type: 'analytics';
    attributes: [
      {
        sum_feedback_none: null;
        sum_feedback_official: null;
        sum_feedback_status_change: null;
        avg_feedback_time_taken: null;
      },
      []
    ];
  };
};

export interface FeedbackRow {
  sum_feedback_none: number;
  sum_feedback_official: number;
  sum_feedback_status_change: number;
  avg_feedback_time_taken: number;
}

export interface StatusRow {
  count: number;
  'dimension_status.id': string;
  first_dimension_status_title_multiloc: Multiloc;
  first_dimension_status_color: string;
}

// Hook return value
export interface PostFeedback {
  pieData: PieRow[];
  progressBarsData: ProgressBarsRow[];
  stackedBarsData: [StackedBarsRow];
  pieCenterValue: string;
  days: number;
  stackedBarColumns: string[];
  statusColorById: Record<string, string>;
  stackedBarPercentages: number[];
  stackedBarsLegendItems: LegendItem[];
  xlsxData: XlsxData;
}

interface PieRow {
  name: string;
  value: number;
  color: string;
}

interface ProgressBarsRow {
  name: string;
  label: string;
  value: number;
  total: number;
}

export type StackedBarsRow = Record<string, number>;
