import { DataRow } from 'components/admin/Graphs/PieChart/typings';

export type Response = {
  'project.id'?: string;
  sum_feedback_none: number;
  sum_feedback_official: number;
  sum_feedback_status_change: number;
  avg_feedback_time_taken: number;
};

type ProgressBarsItem = {
  name: string;
  label: string;
  value: number;
  total: number;
};

export type PostFeedback = {
  pieData: DataRow[];
  pieCenterValue: string;
  pieCenterLabel: string;
  progressBarsData: ProgressBarsItem[];
  days: number;
  xlsxData: object;
};
