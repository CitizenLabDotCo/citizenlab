import { Action } from 'api/permissions/types';

export const getPath = (parameters: {
  action: Action;
  phaseId?: string;
}): `/${string}` => {
  return `/phases/${parameters.phaseId}/permissions/${parameters.action}/permissions_custom_fields`;
};
