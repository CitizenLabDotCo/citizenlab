import { API_PATH } from 'containers/App/constants';
import { requestBlob } from 'utils/request';
import { saveAs } from 'file-saver';
import { reportError } from 'utils/loggingUtils';

interface Params {
  projectId: string;
}

export async function saveSurveyAsPDF({ projectId }: Params) {
  try {
    const blob = await requestBlob(
      `${API_PATH}/projects/${projectId}/custom_fields/to_pdf`,
      'application/pdf'
    );

    saveAs(blob, 'survey.pdf');
  } catch (error) {
    reportError(error);
  }
}
