import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import jobsKeys from './keys';
import { IJob, JobsKeys } from './types';

export const fetchJob = (id?: string) => {
  return fetcher<IJob>({
    path: `/jobs/${id}`,
    action: 'get',
  });
};

const useJob = (jobId?: string) => {
  return useQuery<IJob, CLErrors, IJob, JobsKeys>({
    queryKey: jobsKeys.item({ id: jobId }),
    queryFn: () => fetchJob(jobId),
    enabled: !!jobId,
    // Refetch every 5 seconds when job is active
    refetchInterval: (data) => {
      return data?.data.attributes.active ? 5000 : false;
    },
  });
};

export default useJob;
