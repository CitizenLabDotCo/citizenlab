import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { Multiloc } from 'typings';
import { saveAs } from 'file-saver';
import moment from 'moment';
import { requestBlob } from 'utils/request';
import { IProjectData } from 'api/projects/types';
import { isNilOrError } from 'utils/helperUtils';
import { IPhaseData } from 'api/phases/types';
import { snakeCase } from 'lodash-es';

export async function updateFormCustomFields(
  projectId: string,
  customFields,
  phaseId?: string
) {
  const apiEndpoint = phaseId
    ? `${API_PATH}/admin/phases/${phaseId}/custom_fields/update_all`
    : `${API_PATH}/admin/projects/${projectId}/custom_fields/update_all`;
  return streams.update(apiEndpoint, `${projectId}/custom_fields`, {
    custom_fields: customFields,
  });
}

export interface Answer {
  answer: Multiloc;
  responses: number;
}

export interface Result {
  inputType: string;
  question: Multiloc;
  totalResponses: number;
  answers: Answer[];
  required: boolean;
  customFieldId: string;
}

export interface SurveyResultData {
  results: Result[];
  totalSubmissions: number;
}

export interface SurveyResultsType {
  data: SurveyResultData;
}

export function formCustomFieldsResultsStream(
  projectId: string,
  streamParams: IStreamParams | null = null,
  phaseId?: string | null
) {
  const apiEndpoint = phaseId
    ? `${API_PATH}/phases/${phaseId}/survey_results`
    : `${API_PATH}/projects/${projectId}/survey_results`;
  return streams.get<SurveyResultsType>({
    apiEndpoint,
    cacheStream: false,
    ...streamParams,
  });
}

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

export interface IFormSubmissionCountData {
  totalSubmissions: number;
}

export interface IFormSubmissionCount {
  data: IFormSubmissionCountData;
}

const getSubmissionCountEndpoint = (
  projectId: string,
  phaseId?: string | null
) => {
  return phaseId
    ? `${API_PATH}/phases/${phaseId}/submission_count`
    : `${API_PATH}/projects/${projectId}/submission_count`;
};

export function formSubmissionCountStream(
  projectId: string,
  phaseId?: string | null,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IFormSubmissionCount>({
    apiEndpoint: getSubmissionCountEndpoint(projectId, phaseId),
    cacheStream: false,
    ...streamParams,
  });
}

export async function deleteFormResults(projectId: string, phaseId?: string) {
  const deleteApiEndpoint = phaseId
    ? `${API_PATH}/phases/${phaseId}/inputs`
    : `${API_PATH}/projects/${projectId}/inputs`;

  const response = await streams.delete(
    deleteApiEndpoint,
    `${projectId}/${phaseId}`
  );

  await streams.fetchAllWith({
    apiEndpoint: [getSubmissionCountEndpoint(projectId, phaseId)],
  });

  return response;
}
