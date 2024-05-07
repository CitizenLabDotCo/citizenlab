import { useEffect } from 'react';

import { IBackgroundJobData } from './types';
import useBackgroundJobs from './useBackgroundJobs';
import { CLError } from 'typings';

interface JobErrorParams {
  value?: string;
  row?: number;
}

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
          if (!!job.attributes.last_error_message) {
            // Remove the Ruby error class
            const splitError = job.attributes.last_error_message.split(': ');

            // When a bulk import error - there will be additional params
            const splitErrorParams = splitError[1].split('#');
            if (splitErrorParams.length > 1) {
              const params = JSON.parse(splitErrorParams[1]) as JobErrorParams;
              return {
                error: splitErrorParams[0],
                value: params?.value,
                row: params?.row,
              };
            } else {
              return { error: splitErrorParams[0] };
            }
          } else {
            return [];
          }
        })
      : [];

  return { active, failed, errors };
};

export default useTrackBackgroundJobs;
