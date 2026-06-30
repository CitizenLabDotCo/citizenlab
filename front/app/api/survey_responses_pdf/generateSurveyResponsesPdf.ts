import { saveAs } from 'file-saver';

import { API_PATH } from 'containers/App/constants';

import { requestBlob } from 'utils/requestBlob';

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

// POSTs the cover/redaction options and resolves with the PDF blob.
const requestPdfBlob = ({
  phaseId,
  cover,
  redactedFieldKeys = [],
  coverOnly = false,
}: RequestParams): Promise<Blob> =>
  requestBlob(
    `${API_PATH}/phases/${phaseId}/survey_responses_pdf`,
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
        redacted_field_keys: redactedFieldKeys,
        cover_only: coverOnly,
      },
    }
  );

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

// Cover-only PDF for the live preview.
export const fetchCoverPreviewPdf = (params: {
  phaseId: string;
  cover: SurveyPdfCover;
}): Promise<Blob> => requestPdfBlob({ ...params, coverOnly: true });
