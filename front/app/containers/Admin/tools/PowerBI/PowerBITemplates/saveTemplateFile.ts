// utils
import { requestBlob } from 'utils/requestBlob';
import { saveAs } from 'file-saver';
import { reportError } from 'utils/loggingUtils';

// typings
import { API_PATH } from 'containers/App/constants';

interface Params {
  fileName: string;
  mimeType: string;
}

export async function saveTemplateFile({ fileName, mimeType }: Params) {
  const file = `${API_PATH}/power_bi_templates/${fileName}`;
  try {
    const blob = await requestBlob(file, mimeType as any);
    saveAs(blob, fileName);
  } catch (error) {
    reportError(error);
    throw error;
  }
}
