import { isInitiativeAction } from 'api/initiative_action_descriptors/utils';
import { Action } from 'api/permissions/types';

export const getPath = (parameters: {
  action: Action;
  phaseId?: string;
}): `/${string}` => {
  if (isInitiativeAction(parameters.action)) {
    return `/permissions/${parameters.action}/permissions_fields`;
  }

  return `/phases/${parameters.phaseId}/permissions/${parameters.action}/permissions_fields`;
};
