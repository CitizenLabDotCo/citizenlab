import { saveAs } from 'file-saver';

import { API_PATH } from 'containers/App/constants';

import { requestBlob } from 'utils/requestBlob';

// POSTs the redaction options and downloads the responses xlsx (the regular
// full data dump, minus the redacted fields).
export const generateInputResponsesXlsx = async ({
  phaseId,
  redactedFieldKeys,
  fileName,
}: {
  phaseId: string;
  redactedFieldKeys: string[];
  fileName: string;
}): Promise<void> => {
  const blob = await requestBlob(
    `${API_PATH}/phases/${phaseId}/input_responses_xlsx`,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    undefined,
    {
      method: 'POST',
      body: { redacted_field_keys: redactedFieldKeys },
    }
  );
  saveAs(blob, fileName);
};
