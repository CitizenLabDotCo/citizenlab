import { saveAs } from 'file-saver';
import { CLLocale } from 'typings';

import { API_PATH } from 'containers/App/constants';

import { reportError } from 'utils/loggingUtils';
import { requestBlob } from 'utils/requestBlob';

interface Params {
  locale: CLLocale;
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
      'application/pdf' as any,
      { locale, personal_data, phase_id }
    );

    saveAs(blob, 'idea_form.pdf');
  } catch (error) {
    reportError(error);
    throw error;
  }
}
