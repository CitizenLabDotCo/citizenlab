// utils
import { API_PATH } from 'containers/App/constants';
import { requestBlob } from 'utils/request';
import { saveAs } from 'file-saver';
import { reportError } from 'utils/loggingUtils';

// typings
import { Locale } from 'typings';

interface Params {
  locale: Locale;
  projectId: string;
  personal_data: boolean;
  phase_id?: string;
}

export async function saveIdeaFormAsPDF({
  projectId,
  locale,
  personal_data,
  phase_id,
}: Params) {
  try {
    const blob = await requestBlob(
      `${API_PATH}/projects/${projectId}/custom_fields/to_pdf`,
      'application/pdf',
      { locale, personal_data, phase_id }
    );

    saveAs(blob, 'idea_form.pdf');
  } catch (error) {
    reportError(error);
    throw error;
  }
}
