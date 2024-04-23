import { Keys } from 'utils/cl-react-query/types';

import jobsKeys from './keys';

export type JobsKeys = Keys<typeof jobsKeys>;

export interface IJobData {
  id: string;
  type: string;
  attributes: {
    // See QueJob#status
    // status: 'finished' | 'expired' | 'errored' | 'scheduled' | 'pending';
    active: boolean;
  };
}

export interface IJob {
  data: IJobData;
}
