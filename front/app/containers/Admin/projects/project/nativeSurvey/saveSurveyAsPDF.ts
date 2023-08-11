import { API_PATH } from 'containers/App/constants';
import { requestBlob } from 'utils/request';
import { saveAs } from 'file-saver';
import { reportError } from 'utils/loggingUtils';
import { Locale } from 'typings';

interface Params {
  locale: Locale;
  projectId: string;
}

export async function saveSurveyAsPDF({ projectId, locale }: Params) {
  try {
    const blob = await requestBlob(
      `${API_PATH}/projects/${projectId}/custom_fields/to_pdf`,
      'application/pdf',
      { locale }
    );

    saveAs(blob, 'survey.pdf');
  } catch (error) {
    reportError(error);
  }
}
