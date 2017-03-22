import {
  LOADED_CURRENT_TENANT,
  LOAD_CURRENT_USER,
} from './constants';

export function loadCurrentTenant(payload) {
  return {
    type: LOADED_CURRENT_TENANT,
    payload,
  };
}

export function loadCurrentUser(payload) {
  return {
    type: LOAD_CURRENT_USER,
    payload,
  };
}
