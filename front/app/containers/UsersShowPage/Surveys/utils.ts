import { saveAs } from 'file-saver';

import { API_PATH } from 'containers/App/constants';

import { requestBlob } from 'utils/requestBlob';

export const downloadSurveySubmission = async (id: string) => {
  const apiEndpoint = `${API_PATH}/ideas/${id}/as_xlsx`;
  const fileName = 'survey_response.xlsx';

  const blob = await requestBlob(
    apiEndpoint,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  saveAs(blob, fileName);
};
