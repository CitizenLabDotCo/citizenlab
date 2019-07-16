import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { Multiloc } from 'typings';

export interface IInitiativeStatusData {
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

export interface IInitiativeStatuses {
  data: IInitiativeStatusData[];
}

export interface IInitiativeStatus {
  data: IInitiativeStatusData;
}

export function initiativeStatusStream(initiativeId: string) {
  return streams.get<IInitiativeStatus>({ apiEndpoint: `${API_PATH}/initiative_statuses/${initiativeId}` });
}

export function initiativeStatusesStream() {
  return streams.get<IInitiativeStatuses>({ apiEndpoint: `${API_PATH}/initiative_statuses` });
}
