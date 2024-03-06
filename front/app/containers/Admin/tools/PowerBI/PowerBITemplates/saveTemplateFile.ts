import { saveAs } from 'file-saver';

import { API_PATH } from 'containers/App/constants';

import { reportError } from 'utils/loggingUtils';
import { requestBlob } from 'utils/requestBlob';

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
