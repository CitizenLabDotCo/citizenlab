import { IJobData } from 'api/jobs/types';

export const SURVEY_GENERATION_JOB_TYPE =
  'IdeaCustomFields::SurveyGenerationJob';

// Mirrors the backend's safety valve (see SurveyGenerationsController): a job
// whose tracker never completes (e.g. the worker died) stops counting as
// running after an hour.
const STALE_JOB_AGE_MS = 60 * 60 * 1000;

export const isSurveyGenerationInProgress = (job: IJobData | undefined) =>
  !!job &&
  job.attributes.completed_at === null &&
  Date.now() - new Date(job.attributes.created_at).getTime() < STALE_JOB_AGE_MS;
