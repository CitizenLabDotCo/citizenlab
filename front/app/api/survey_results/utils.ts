import { API_PATH } from 'containers/App/constants';
import { requestBlob } from 'utils/requestBlob';
import { saveAs } from 'file-saver';
import { snakeCase } from 'lodash-es';
import moment from 'moment';
import { IPhaseData } from 'api/phases/types';

// External surveys
export const exportSurveyResults = async (queryParameter: {
  phaseId: string;
}) => {
  const blob = await requestBlob(
    `${API_PATH}/phases/${queryParameter.phaseId}/survey_responses/as_xlsx`,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );

  saveAs(blob, 'survey-results-export.xlsx');
};

// Native surveys
export const downloadSurveyResults = async (
  locale: string,
  phase: IPhaseData
) => {
  const apiEndpoint = `${API_PATH}/phases/${phase.id}/as_xlsx`;
  const fileNameTitle = phase.attributes.title_multiloc;
  const fileName = `${snakeCase(fileNameTitle[locale])}_${moment().format(
    'YYYY-MM-DD'
  )}.xlsx`;

  const blob = await requestBlob(
    apiEndpoint,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  saveAs(blob, fileName);
};
