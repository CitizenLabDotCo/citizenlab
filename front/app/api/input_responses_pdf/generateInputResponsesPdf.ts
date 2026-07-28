import { saveAs } from 'file-saver';

import { API_PATH } from 'containers/App/constants';

import { requestBlob } from 'utils/requestBlob';

export type InputPdfCover = {
  include: boolean;
  title: string;
  subtitle: string;
  date: string;
  preparedBy: string;
  notes: string;
};

// Downloads the PDF produced by a completed export job (see
// useGenerateInputResponsesPdf / useInputResponsesPdfJob for starting and
// tracking the job).
export const downloadInputResponsesPdfResult = async ({
  phaseId,
  fileName,
}: {
  phaseId: string;
  fileName: string;
}): Promise<void> => {
  const blob = await requestBlob(
    `${API_PATH}/phases/${phaseId}/input_responses_pdf_result`,
    'application/pdf'
  );
  saveAs(blob, fileName);
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
