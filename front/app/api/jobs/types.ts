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
    job_id: string;
    // See QueJob#status, but not all statuses make sense in this context.
    status: 'errored' | 'scheduled';
    active: boolean;
  };
}

export interface IJobs {
  data: IJobData[];
}
