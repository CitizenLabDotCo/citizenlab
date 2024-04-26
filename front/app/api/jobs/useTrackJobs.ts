import { useEffect } from 'react';

import { IJobData } from './types';
import useJobs from './useJobs';

const useTrackJobs = ({
  trackedJobs,
  onChange,
}: {
  trackedJobs: IJobData[];
  onChange: () => void;
}) => {
  const trackedJobsIds = trackedJobs.map((job) => job.attributes.job_id);

  const { data: polledJobs } = useJobs(trackedJobsIds);

  useEffect(() => {
    onChange();
  }, [polledJobs?.data, onChange]);

  const active = !!polledJobs?.data.some((job) => job.attributes.active);
  return { active };
};

export default useTrackJobs;
