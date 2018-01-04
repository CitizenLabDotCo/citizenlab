import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { Multiloc } from 'typings';

export interface IIdeaStatusData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    color: string;
    code: string;
    ordering: number;
    description_multiloc: Multiloc
  };
}

export interface IIdeaStatuses {
  data: IIdeaStatusData[];
}

export interface IIdeaStatus {
  data: IIdeaStatusData;
}

export function ideaStatusStream(ideaId: string) {
  return streams.get<IIdeaStatus>({ apiEndpoint: `${API_PATH}/idea_statuses/${ideaId}` });
}

export function ideaStatusesStream() {
  return streams.get<IIdeaStatuses>({ apiEndpoint: `${API_PATH}/idea_statuses` });
}
