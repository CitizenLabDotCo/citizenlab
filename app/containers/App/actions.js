import {
  LOADED_CURRENT_TENANT,
} from './constants';

export function loadCurrentTenant(payload) {
  return {
    type: LOADED_CURRENT_TENANT,
    payload,
  };
}
