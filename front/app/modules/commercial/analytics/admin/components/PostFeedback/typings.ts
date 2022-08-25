import { DataRow } from 'components/admin/Graphs/PieChart/typings';
import { Multiloc } from 'typings';

type ResponseFeedback = {
  sum_feedback_none: number;
  sum_feedback_official: number;
  sum_feedback_status_change: number;
  avg_feedback_time_taken: number;
};

type ResponseStatus = {
  count: number;
  'status.id': string;
  first_status_title_multiloc: Multiloc;
};

export type Response = {
  data: [ResponseFeedback[], ResponseStatus[]];
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
