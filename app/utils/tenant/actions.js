import {
  LOAD_CURRENT_TENANT_REQUEST,
  LOAD_CURRENT_TENANT_SUCCESS,
  LOAD_CURRENT_TENANT_ERROR,
} from './constants';


export function loadCurrentTenantRequest() {
  return {
    type: LOAD_CURRENT_TENANT_REQUEST,
  };
}

export function loadCurrentTenantSuccess(response) {
  return {
    type: LOAD_CURRENT_TENANT_SUCCESS,
    payload: response,
  };
}

export function loadCurrentTenantError(error) {
  return {
    type: LOAD_CURRENT_TENANT_ERROR,
    payload: error,
  };
}
