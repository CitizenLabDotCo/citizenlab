import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import backgroundJobsKeys from './keys';
import { IBackgroundJobs, BackgroundJobsKeys } from './types';

export const fetchJob = (ids?: string[]) => {
  return fetcher<IBackgroundJobs>({
    path: `/background_jobs`,
    queryParams: { ids },
    action: 'get',
  });
};

const useBackgroundJobs = (ids?: string[]) => {
  return useQuery<
    IBackgroundJobs,
    CLErrors,
    IBackgroundJobs,
    BackgroundJobsKeys
  >({
    queryKey: backgroundJobsKeys.list({ ids }),
    queryFn: () => fetchJob(ids),
    enabled: ids && ids.length > 0,
    // Refetch while any job is active
    refetchInterval: (data) => {
      return data?.data.some((job) => job.attributes.active) ? 2000 : false;
    },
  });
};

export default useBackgroundJobs;
