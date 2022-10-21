import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';
import { XlsxData } from 'components/admin/ReportExportMenu';
import { Moment } from 'moment';
import { Multiloc } from 'typings';

export interface QueryParameters {
  projectId: string | undefined;
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null | undefined;
}

// Response
export type Response = {
  data: [[FeedbackRow], StatusRow[]];
};

export type EmptyResponse = {
  data: [
    {
      sum_feedback_none: null;
      sum_feedback_official: null;
      sum_feedback_status_change: null;
      avg_feedback_time_taken: null;
    },
    []
  ];
};

export interface FeedbackRow {
  sum_feedback_none: number;
  sum_feedback_official: number;
  sum_feedback_status_change: number;
  avg_feedback_time_taken: number;
}

export interface StatusRow {
  count: number;
  'status.id': string;
  first_status_title_multiloc: Multiloc;
  first_status_color: string;
}

// Hook return value
export interface PostFeedback {
  pieData: PieRow[];
  progressBarsData: ProgressBarsRow[];
  stackedBarsData: [StackedBarsRow];
  pieCenterValue: string;
  pieCenterLabel: string;
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
