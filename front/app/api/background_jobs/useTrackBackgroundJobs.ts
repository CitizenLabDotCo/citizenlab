import { useEffect } from 'react';

import { IBackgroundJobData } from './types';
import useBackgroundJobs from './useBackgroundJobs';

const useTrackBackgroundJobs = ({
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

  // When a job is successfully completed, we delete it from the DB.
  // So, if the polled jobs list is empty, it means that all jobs have been completed.
  const active = !!polledJobs?.data.some((job) => job.attributes.active);
  const failed =
    polledJobs?.data &&
    polledJobs.data.length > 0 &&
    polledJobs.data.every((job) => job.attributes.failed);
  return { active, failed };
};

export default useTrackBackgroundJobs;
