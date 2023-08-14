import { API_PATH } from 'containers/App/constants';
import { requestBlob } from 'utils/request';
import { saveAs } from 'file-saver';
import { reportError } from 'utils/loggingUtils';
import { Locale } from 'typings';

interface Params {
  locale: Locale;
  projectId: string;
  name?: boolean;
  email?: boolean;
}

export async function saveIdeaFormAsPDF({
  projectId,
  locale,
  name,
  email,
}: Params) {
  try {
    const blob = await requestBlob(
      `${API_PATH}/projects/${projectId}/custom_fields/to_pdf`,
      'application/pdf',
      { locale, name, email }
    );

    saveAs(blob, 'idea_form.pdf');
  } catch (error) {
    reportError(error);
  }
}
