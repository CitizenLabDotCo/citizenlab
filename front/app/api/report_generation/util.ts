import { IJobData } from 'api/jobs/types';

// Mirrors the backend's safety valve (see ReportsController): a job whose
// tracker never completes (e.g. the worker died) stops blocking new runs
// after an hour.
const STALE_JOB_AGE_MS = 60 * 60 * 1000;

export const isReportGenerationInProgress = (
  job: IJobData | undefined
): job is IJobData =>
  !!job &&
  job.attributes.completed_at === null &&
  Date.now() - new Date(job.attributes.created_at).getTime() < STALE_JOB_AGE_MS;

// A run that finished with errors: the tracker completes either way, so the
// errors are what separates a finished report from a failed one.
export const reportGenerationFailed = (job: IJobData | undefined): boolean =>
  !!job &&
  job.attributes.completed_at !== null &&
  job.attributes.errors.length > 0;
