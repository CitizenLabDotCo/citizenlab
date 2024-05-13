import { useEffect } from 'react';

import { IBackgroundJobData } from './types';
import useBackgroundJobs from './useBackgroundJobs';
import { CLError } from 'typings';

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
  const errors: CLError[] =
    polledJobs?.data && polledJobs.data.length > 0
      ? polledJobs.data.flatMap((job) => {
          if (!!job.attributes.last_error) {
            return job.attributes.last_error;
          } else {
            return [];
          }
        })
      : [];

  return { active, failed, errors };
};

export default useTrackBackgroundJobs;
