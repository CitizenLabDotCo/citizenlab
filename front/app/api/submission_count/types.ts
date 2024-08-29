import { Keys } from 'utils/cl-react-query/types';

import submissionsCountKeys from './keys';

export type SubmissionsCountKeys = Keys<typeof submissionsCountKeys>;

export type IParameters = {
  phaseId?: string;
};

export interface IFormSubmissionCountData {
  totalSubmissions: number;
}

export interface IFormSubmissionCount {
  data: {
    type: 'submission_count';
    attributes: IFormSubmissionCountData;
  };
}
