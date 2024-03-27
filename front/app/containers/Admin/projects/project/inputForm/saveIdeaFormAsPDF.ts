import { saveAs } from 'file-saver';
import { Locale } from 'typings';

import { API_PATH } from 'containers/App/constants';

import { reportError } from 'utils/loggingUtils';
import { requestBlob } from 'utils/requestBlob';

interface Params {
  locale: Locale;
  phaseId: string;
  personal_data: boolean;
}

export async function saveIdeaFormAsPDF({
  phaseId,
  locale,
  personal_data,
}: Params) {
  try {
    const blob = await requestBlob(
      `${API_PATH}/phases/${phaseId}/custom_fields/to_pdf`,
      'application/pdf' as any,
      { locale, personal_data, phaseId }
    );

    saveAs(blob, 'idea_form.pdf');
  } catch (error) {
    reportError(error);
    throw error;
  }
}
