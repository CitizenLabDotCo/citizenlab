import { saveAs } from 'file-saver';
import { CLErrorsWrapper } from 'typings';

import { IJobData } from 'api/jobs/types';

import { API_PATH } from 'containers/App/constants';

import { requestBlob } from 'utils/requestBlob';

import { InputPdfCover } from './types';

// Mirrors the backend's safety valve (see PhasesController): a job whose
// tracker never completes (e.g. the worker died) stops blocking new exports
// after an hour.
const STALE_JOB_AGE_MS = 60 * 60 * 1000;

export const isPdfExportInProgress = (
  job: IJobData | undefined
): job is IJobData =>
  !!job &&
  job.attributes.completed_at === null &&
  Date.now() - new Date(job.attributes.created_at).getTime() < STALE_JOB_AGE_MS;

// Downloads the PDF of a completed export job; the backend only serves it to
// the user who started the job (it reflects their redaction choices).
export const downloadInputResponsesPdfResult = async ({
  phaseId,
  jobId,
  fileName,
}: {
  phaseId: string;
  jobId: string;
  fileName: string;
}): Promise<void> => {
  const blob = await requestBlob(
    `${API_PATH}/phases/${phaseId}/input_responses_pdf_result`,
    'application/pdf',
    { tracker_id: jobId }
  );
  saveAs(blob, fileName);
};

// The backend refuses (409) to start an export while one is already running.
export const isExportInProgressError = (error: unknown): boolean => {
  const base = (error as Partial<CLErrorsWrapper> | undefined)?.errors?.base;
  return (
    Array.isArray(base) && base.some((e) => e.error === 'export_in_progress')
  );
};

// Cover-only PDF for the live preview (rendered synchronously).
export const fetchCoverPreviewPdf = ({
  phaseId,
  cover,
}: {
  phaseId: string;
  cover: InputPdfCover;
}): Promise<Blob> =>
  requestBlob(
    `${API_PATH}/phases/${phaseId}/input_responses_pdf`,
    'application/pdf',
    undefined,
    {
      method: 'POST',
      body: {
        cover: {
          include: cover.include,
          title: cover.title,
          subtitle: cover.subtitle,
          date: cover.date,
          prepared_by: cover.preparedBy,
          notes: cover.notes,
        },
        cover_only: true,
      },
    }
  );
