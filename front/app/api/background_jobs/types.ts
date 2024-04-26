import { Keys } from 'utils/cl-react-query/types';

import backgroundJobsKeys from './keys';

export type BackgroundJobsKeys = Keys<typeof backgroundJobsKeys>;

export interface IBackgroundJobsQueryParams {
  ids?: string[];
}

export interface IBackgroundJobData {
  id: string;
  type: string;
  attributes: {
    job_id: string;
    failed: boolean;
    active: boolean;
  };
}

export interface IBackgroundJobs {
  data: IBackgroundJobData[];
}
