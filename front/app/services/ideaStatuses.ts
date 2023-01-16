import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { Multiloc } from 'typings';

export const ideaStatusCodes = [
  'proposed',
  'viewed',
  'under_consideration',
  'accepted',
  'implemented',
  'rejected',
  'custom',
] as const;

export type TIdeaStatusCode = typeof ideaStatusCodes[number];

export interface IIdeaStatusData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    color: string;
    code: TIdeaStatusCode;
    ordering: number;
    description_multiloc: Multiloc;
    ideas_count?: number;
  };
}

export interface IIdeaStatus {
  data: IIdeaStatusData;
}

export interface IIdeaStatuses {
  data: IIdeaStatusData[];
}

export function ideaStatusStream(statusId: string) {
  return streams.get<IIdeaStatus>({
    apiEndpoint: `${API_PATH}/idea_statuses/${statusId}`,
  });
}

export function ideaStatusesStream() {
  return streams.get<IIdeaStatuses>({
    apiEndpoint: `${API_PATH}/idea_statuses`,
  });
}
