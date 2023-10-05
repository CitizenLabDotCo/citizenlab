// utils
import { requestBlob } from 'utils/request';
import { saveAs } from 'file-saver';
import { reportError } from 'utils/loggingUtils';

// typings
import { Locale } from 'typings';

interface Params {
  downloadPdfLink: string;
  locale: Locale;
  personal_data: boolean;
  phase_id?: string;
}

export async function saveSurveyAsPDF({
  downloadPdfLink,
  locale,
  personal_data,
}: Params) {
  try {
    const blob = await requestBlob(downloadPdfLink, 'application/pdf', {
      locale,
      personal_data,
    });

    saveAs(blob, 'survey.pdf');
  } catch (error) {
    reportError(error);
    throw error;
  }
}
