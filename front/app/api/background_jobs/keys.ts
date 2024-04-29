import { QueryKeys } from 'utils/cl-react-query/types';

import { IBackgroundJobsQueryParams } from './types';

const baseKey = { type: 'job' };

const backgroundJobsKeys = {
  all: () => [baseKey],
  list: (queryParams: IBackgroundJobsQueryParams) => [
    {
      ...baseKey,
      operation: 'list',
      parameters: queryParams,
    },
  ],
} satisfies QueryKeys;

export default backgroundJobsKeys;
