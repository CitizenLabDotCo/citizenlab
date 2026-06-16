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

type Params = {
  phaseId: string;
  cover: SurveyPdfCover;
  redactedFieldKeys: string[];
  fileName: string;
};

// POSTs the cover settings + redacted field keys and downloads the PDF the
// backend generates. Uses XHR (like requestBlob) to get a binary response.
export const generateSurveyResponsesPdf = ({
  phaseId,
  cover,
  redactedFieldKeys,
  fileName,
}: Params): Promise<void> =>
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
        saveAs(new Blob([xhr.response], { type: 'application/pdf' }), fileName);
        resolve();
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
      })
    );
  });
