import { QueryKeys } from 'utils/cl-react-query/types';

import { IJobsQueryParams } from './types';

const baseKey = { type: 'job' };

const jobsKeys = {
  all: () => [baseKey],
  list: (queryParams: IJobsQueryParams) => [
    {
      ...baseKey,
      operation: 'list',
      parameters: queryParams,
    },
  ],
  item: ({ id }: { id?: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id },
    },
  ],
} satisfies QueryKeys;

export default jobsKeys;
