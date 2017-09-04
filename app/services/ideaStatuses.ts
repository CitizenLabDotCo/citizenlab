import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/idea_statuses`;

export interface IIdeaStatusData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: {
      [key: string]: string;
    };
    color?: string;
    code?: string;
    ordering?: number;
  };
}

export interface IIdeaStatuses {
  data: IIdeaStatusData[];
}
export interface IIdeaStatus {
  data: IIdeaStatusData;
}

export function ideaStatusesStream(streamParams: IStreamParams<IIdeaStatuses> | null = null) {
  return streams.get<IIdeaStatuses>({ apiEndpoint, ...streamParams });
}
