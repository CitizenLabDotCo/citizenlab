import { Keys } from 'utils/cl-react-query/types';

import jobsKeys from './keys';

export type JobsKeys = Keys<typeof jobsKeys>;

export interface IJobsQueryParams {
  ids?: string[];
}

export interface IJobData {
  id: string;
  type: string;
  attributes: {
    // See QueJob#status
    job_id: string;
    status: 'finished' | 'expired' | 'errored' | 'scheduled' | 'pending';
    active: boolean;
  };
}

export interface IJob {
  data: IJobData;
}

export interface IJobs {
  data: IJobData[];
}
