import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

import { Multiloc, IParticipationContextType } from 'typings';
import { IInitiativeAction } from 'api/initiative_action_descriptors/types';
import { IPCPermissionAction } from './actionPermissions';

export interface Response {
  data: {
    attributes: {
      participation_conditions: Multiloc[][];
    };
  };
}

export type ParticipationConditions = Multiloc[][];

export function getPCParticipationConditions(
  id: string,
  type: IParticipationContextType,
  action: IPCPermissionAction
) {
  return streams.get<Response>({
    apiEndpoint: `${API_PATH}/${type}s/${id}/permissions/${action}/participation_conditions`,
  });
}

// TODO
export function getGlobalParticipationConditions(action: IInitiativeAction) {
  return streams.get<Response>({
    apiEndpoint: `${API_PATH}/permissions/${action}/participation_conditions`,
  });
}
