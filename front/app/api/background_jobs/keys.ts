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
  item: ({ id }: { id?: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id },
    },
  ],
} satisfies QueryKeys;

export default backgroundJobsKeys;
