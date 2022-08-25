import { Multiloc } from 'typings';

export type Response = {
  data: [ResponseFeedback[], ResponseStatus[]];
};

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

export type PostFeedback = {
  pieData: PieRow[];
  pieCenterValue: string;
  pieCenterLabel: string;
  progressBarsData: ProgressBarsRow[];
  days: number;
  xlsxData: object;
};

interface PieRow {
  name: string;
  value: number;
  color: string;
};

interface ProgressBarsRow {
  name: string;
  label: string;
  value: number;
  total: number;
};