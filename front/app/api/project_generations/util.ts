import { IJobData } from 'api/jobs/types';

// Must match the backend job class (see ProjectGenerationsController /
// ProjectGenerationJob). Generating a whole project is slower than a survey, so
// the safety valve below is generous.
export const PROJECT_GENERATION_JOB_TYPE =
  'ProjectGeneration::ProjectGenerationJob';

// Mirrors the backend's safety valve: a job whose tracker never completes (e.g.
// the worker died) stops counting as running after an hour.
const STALE_JOB_AGE_MS = 60 * 60 * 1000;

export const isProjectGenerationInProgress = (job: IJobData | undefined) =>
  !!job &&
  job.attributes.completed_at === null &&
  Date.now() - new Date(job.attributes.created_at).getTime() < STALE_JOB_AGE_MS;
