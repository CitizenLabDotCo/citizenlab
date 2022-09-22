import { API_PATH } from 'containers/App/constants';
import { ProcessType } from 'services/projects';
import streams, { IStreamParams } from 'utils/streams';

export interface IFormSubmissionCountData {
  totalSubmissions: string;
}

export interface IFormSubmissionCount {
  data: IFormSubmissionCountData;
}

export function formSubmissionCountStream(
  projectId: string,
  projectType: ProcessType | undefined,
  phaseId?: string | null,
  streamParams: IStreamParams | null = null
) {
  if (projectType === 'timeline') {
    return streams.get<IFormSubmissionCount>({
      apiEndpoint: `${API_PATH}/phases/${phaseId}/submission_count`,
      ...streamParams,
    });
  } else {
    return streams.get<IFormSubmissionCount>({
      apiEndpoint: `${API_PATH}/projects/${projectId}/submission_count`,
      cacheStream: false,
      ...streamParams,
    });
  }
}
