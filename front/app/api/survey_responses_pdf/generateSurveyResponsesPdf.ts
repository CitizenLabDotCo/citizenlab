import { saveAs } from 'file-saver';

import { API_PATH } from 'containers/App/constants';

import { getJwt } from 'utils/auth/jwt';

export type SurveyPdfCover = {
  include: boolean;
  title: string;
  subtitle: string;
  date: string;
  preparedBy: string;
  notes: string;
};

type RequestParams = {
  phaseId: string;
  cover: SurveyPdfCover;
  redactedFieldKeys?: string[];
  coverOnly?: boolean;
};

// POSTs to the survey_responses_pdf endpoint and resolves with the PDF blob.
// Uses XHR (like utils/requestBlob) to enforce a binary response type.
const requestPdfBlob = ({
  phaseId,
  cover,
  redactedFieldKeys = [],
  coverOnly = false,
}: RequestParams): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      'POST',
      `${API_PATH}/phases/${phaseId}/survey_responses_pdf`,
      true
    );
    xhr.responseType = 'blob';
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', `Bearer ${getJwt()}`);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(new Blob([xhr.response], { type: 'application/pdf' }));
      } else {
        reject(new Error(`Export failed: ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(
      JSON.stringify({
        cover: {
          include: cover.include,
          title: cover.title,
          subtitle: cover.subtitle,
          date: cover.date,
          prepared_by: cover.preparedBy,
          notes: cover.notes,
        },
        redacted_field_keys: redactedFieldKeys,
        cover_only: coverOnly,
      })
    );
  });

// Full export — downloads the PDF.
export const generateSurveyResponsesPdf = async ({
  phaseId,
  cover,
  redactedFieldKeys,
  fileName,
}: {
  phaseId: string;
  cover: SurveyPdfCover;
  redactedFieldKeys: string[];
  fileName: string;
}): Promise<void> => {
  const blob = await requestPdfBlob({ phaseId, cover, redactedFieldKeys });
  saveAs(blob, fileName);
};

// Cover-only PDF — used for the live preview (rendered in an iframe).
export const fetchCoverPreviewPdf = (params: {
  phaseId: string;
  cover: SurveyPdfCover;
}): Promise<Blob> => requestPdfBlob({ ...params, coverOnly: true });
