import { API_PATH } from 'containers/App/constants';
import { requestBlob } from 'utils/requestBlob';
import { saveAs } from 'file-saver';
import { isNilOrError } from 'utils/helperUtils';
import { snakeCase } from 'lodash-es';
import moment from 'moment';
import { IProjectData } from 'api/projects/types';
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
// TODO: JS - do this later
export const downloadSurveyResults = async (
  project: IProjectData,
  locale: string,
  phase?: IPhaseData
) => {
  const apiEndpoint = !isNilOrError(phase)
    ? `${API_PATH}/phases/${phase.id}/as_xlsx`
    : `${API_PATH}/projects/${project.id}/as_xlsx`;
  const fileNameTitle = !isNilOrError(phase)
    ? phase.attributes.title_multiloc
    : project.attributes.title_multiloc;
  const fileName = `${snakeCase(fileNameTitle[locale])}_${moment().format(
    'YYYY-MM-DD'
  )}.xlsx`;

  const blob = await requestBlob(
    apiEndpoint,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  saveAs(blob, fileName);
};
