import {
  SAVE_SETTINGS_REQUEST, SAVE_SETTINGS_SUCCESS, SAVE_SETTINGS_ERROR,
} from './constants';

export function saveSettings(tenantId, locale, organizationName, accentColorHex) {
  return {
    type: SAVE_SETTINGS_REQUEST,
    tenantId,
    locale,
    organizationName,
    accentColorHex,
  };
}

export function saveSettingsSuccess(response) {
  return {
    type: SAVE_SETTINGS_SUCCESS,
    payload: response,
  };
}

export function saveSettingsError(error) {
  return {
    type: SAVE_SETTINGS_ERROR,
    payload: error,
  };
}
