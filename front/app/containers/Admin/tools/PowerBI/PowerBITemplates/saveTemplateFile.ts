// utils
import { requestBlob } from 'utils/requestBlob';
import { saveAs } from 'file-saver';
import { reportError } from 'utils/loggingUtils';

// typings
import { API_PATH } from 'containers/App/constants';

interface Params {
  fileName: string;
  fileExtension: string;
}

export async function saveTemplateFile({ fileName, fileExtension }: Params) {
  const file = `${API_PATH}/power_bi_templates/${fileName}`;
  try {
    const mimeType =
      fileExtension === 'pbit' ? 'application/pbit' : 'application/json';
    const blob = await requestBlob(file, mimeType as any);
    saveAs(blob, `${fileName}.${fileExtension}`);
  } catch (error) {
    reportError(error);
    throw error;
  }
}
