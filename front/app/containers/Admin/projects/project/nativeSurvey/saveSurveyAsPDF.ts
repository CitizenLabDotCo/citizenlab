// utils
import { requestBlob } from 'utils/request';
import { saveAs } from 'file-saver';
import { reportError } from 'utils/loggingUtils';

// typings
import { Locale } from 'typings';

interface Params {
  downloadPdfLink: string;
  locale: Locale;
  name?: boolean;
  email?: boolean;
  phase_id?: string;
}

export async function saveSurveyAsPDF({
  downloadPdfLink,
  locale,
  name,
  email,
}: Params) {
  try {
    const blob = await requestBlob(downloadPdfLink, 'application/pdf', {
      locale,
      name,
      email,
    });

    saveAs(blob, 'survey.pdf');
  } catch (error) {
    reportError(error);
    throw error;
  }
}
