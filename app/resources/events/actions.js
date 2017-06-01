/*
 *
 * resources/events actions
 *
 */

import {
  LOAD_EVENTS_ERROR, LOAD_EVENTS_REQUEST, LOAD_EVENTS_SUCCESS, RESET_EVENTS, LOAD_EVENT_REQUEST, LOAD_EVENT_SUCCESS, LOAD_EVENT_ERROR, DELETE_EVENT_REQUEST, DELETE_EVENT_SUCCESS, DELETE_EVENT_ERROR, CREATE_EVENT_SUCCESS } from './constants';

export function loadAreasRequest(nextPageNumber, nextPageItemCount) {
  return {
    type: LOAD_EVENTS_REQUEST,
    nextPageNumber,
    nextPageItemCount,
  };
}

export function loadAreasSuccess(response) {
  return {
    type: LOAD_EVENTS_SUCCESS,
    payload: response,
  };
}

export function loadAreasError(error) {
  return {
    type: LOAD_EVENTS_ERROR,
    error,
  };
}

export function loadAreaRequest(id) {
  return {
    type: LOAD_EVENT_REQUEST,
    id,
  };
}

export function loadAreaSuccess(response) {
  return {
    type: LOAD_EVENT_SUCCESS,
    payload: response,
  };
}

export function loadAreaError(error) {
  return {
    type: LOAD_EVENT_ERROR,
    error,
  };
}

export function createAreaSuccess(response) {
  return {
    type: CREATE_EVENT_SUCCESS,
    payload: response,
  };
}

export function deleteAreaRequest(id) {
  return {
    type: DELETE_EVENT_REQUEST,
    id,
  };
}

export function deleteAreaSuccess(id) {
  return {
    type: DELETE_EVENT_SUCCESS,
    id,
  };
}

export function deleteAreaError(error) {
  return {
    type: DELETE_EVENT_ERROR,
    error,
  };
}

export function resetAreas() {
  return {
    type: RESET_EVENTS,
  };
}
