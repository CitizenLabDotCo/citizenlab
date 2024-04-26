import { useEffect } from 'react';

import { IBackgroundJobData } from './types';
import useBackgroundJobs from './useBackgroundJobs';

const useTrackJobs = ({
  jobs,
  onChange,
}: {
  jobs: IBackgroundJobData[];
  onChange: () => void;
}) => {
  const trackedJobsIds = jobs.map((job) => job.attributes.job_id);

  const { data: polledJobs } = useBackgroundJobs(trackedJobsIds);

  useEffect(() => {
    onChange();
  }, [polledJobs?.data, onChange]);

  const active = !!polledJobs?.data.some((job) => job.attributes.active);
  const failed =
    polledJobs?.data &&
    polledJobs.data.length > 0 &&
    polledJobs.data.every((job) => job.attributes.failed);
  return { active, failed };
};

export default useTrackJobs;
