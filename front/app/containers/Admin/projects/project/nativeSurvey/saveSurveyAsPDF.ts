import { saveAs } from 'file-saver';
import { SupportedLocale } from 'typings';

import { reportError } from 'utils/loggingUtils';
import { requestBlob } from 'utils/requestBlob';

interface Params {
  downloadPdfLink: string;
  locale: SupportedLocale;
  personal_data: boolean;
  phase_id?: string;
}

export async function saveSurveyAsPDF({
  downloadPdfLink,
  locale,
  personal_data,
}: Params) {
  try {
    const blob = await requestBlob(downloadPdfLink, 'application/pdf' as any, {
      locale,
      personal_data,
    });

    saveAs(blob, 'survey.pdf');
  } catch (error) {
    reportError(error);
    throw error;
  }
}
