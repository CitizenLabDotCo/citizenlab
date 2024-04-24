import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import jobsKeys from './keys';
import { IJobs, JobsKeys } from './types';

export const fetchJob = (ids?: string[]) => {
  return fetcher<IJobs>({
    path: `/jobs`,
    queryParams: { ids },
    action: 'get',
  });
};

const useJobs = (ids?: string[]) => {
  return useQuery<IJobs, CLErrors, IJobs, JobsKeys>({
    queryKey: jobsKeys.list({ ids }),
    queryFn: () => fetchJob(ids),
    enabled: ids && ids.length > 0,
    // Refetch every 5 seconds when any job is active
    refetchInterval: (data) => {
      return data?.data.some((job) => job.attributes.active) ? 5000 : false;
    },
  });
};

export default useJobs;
