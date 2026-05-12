import { CLError } from 'typings';

export interface IBackgroundJobData {
  id: string;
  type: string;
  attributes: {
    job_id: string;
    failed: boolean;
    active: boolean;
    last_error: CLError | null;
  };
}
