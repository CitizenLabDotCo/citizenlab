import { saveAs } from 'file-saver';
import { IParticipationContextType } from 'typings';
import { requestBlob } from 'utils/request';
import { API_PATH } from 'containers/App/constants';

export const exportSurveyResults = async (queryParameter: {
  type: IParticipationContextType;
  id: string;
}) => {
  const blob = await requestBlob(
    `${API_PATH}/${queryParameter.type}s/${queryParameter.id}/survey_responses/as_xlsx`,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );

  saveAs(blob, 'survey-results-export.xlsx');
};
