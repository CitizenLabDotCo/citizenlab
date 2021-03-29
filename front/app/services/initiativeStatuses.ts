import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { Multiloc } from 'typings';

export type InitiativeStatusCode =
  | 'proposed'
  | 'expired'
  | 'threshold_reached'
  | 'answered'
  | 'ineligible'
  | 'custom';

export interface IInitiativeStatusData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    color: string;
    code: InitiativeStatusCode;
    ordering: number;
    description_multiloc: Multiloc;
    transition_type: 'manual' | 'automatic';
  };
}

export interface IInitiativeStatuses {
  data: IInitiativeStatusData[];
}

export interface IInitiativeStatus {
  data: IInitiativeStatusData;
}

export function initiativeStatusStream(initiativeId: string) {
  return streams.get<IInitiativeStatus>({
    apiEndpoint: `${API_PATH}/initiative_statuses/${initiativeId}`,
  });
}

export function initiativeStatusesStream() {
  return streams.get<IInitiativeStatuses>({
    apiEndpoint: `${API_PATH}/initiative_statuses`,
  });
}
