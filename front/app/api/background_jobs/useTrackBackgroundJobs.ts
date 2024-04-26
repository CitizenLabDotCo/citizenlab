import { useEffect } from 'react';

import { IBackgroundJobData } from './types';
import useBackgroundJobs from './useBackgroundJobs';

const useTrackJobs = ({
  trackedJobs,
  onChange,
}: {
  trackedJobs: IBackgroundJobData[];
  onChange: () => void;
}) => {
  const trackedJobsIds = trackedJobs.map((job) => job.attributes.job_id);

  const { data: polledJobs } = useBackgroundJobs(trackedJobsIds);

  useEffect(() => {
    onChange();
  }, [polledJobs?.data, onChange]);

  const active = !!polledJobs?.data.some((job) => job.attributes.active);
  return { active, polledJobs: polledJobs?.data ?? [] };
};

export default useTrackJobs;
