/*
 *
 * resources/areas actions
 *
 */

import {
  LOAD_AREAS_ERROR, LOAD_AREAS_REQUEST, LOAD_AREAS_SUCCESS, RESET_AREAS, LOAD_AREA_REQUEST, LOAD_AREA_SUCCESS, LOAD_AREA_ERROR, DELETE_AREA_REQUEST, DELETE_AREA_SUCCESS, DELETE_AREA_ERROR, CREATE_AREA_SUCCESS } from './constants';

export function loadAreasRequest(nextPageNumber, nextPageItemCount) {
  return {
    type: LOAD_AREAS_REQUEST,
    nextPageNumber,
    nextPageItemCount,
  };
}

export function loadAreasSuccess(response) {
  return {
    type: LOAD_AREAS_SUCCESS,
    payload: response,
  };
}

export function loadAreasError(error) {
  return {
    type: LOAD_AREAS_ERROR,
    error,
  };
}

export function loadAreaRequest(id) {
  return {
    type: LOAD_AREA_REQUEST,
    id,
  };
}

export function loadAreaSuccess(response) {
  return {
    type: LOAD_AREA_SUCCESS,
    payload: response,
  };
}

export function loadAreaError(error) {
  return {
    type: LOAD_AREA_ERROR,
    error,
  };
}

export function createAreaSuccess(response) {
  return {
    type: CREATE_AREA_SUCCESS,
    payload: response,
  };
}

export function deleteAreaRequest(id) {
  return {
    type: DELETE_AREA_REQUEST,
    id,
  };
}

export function deleteAreaSuccess(id) {
  return {
    type: DELETE_AREA_SUCCESS,
    id,
  };
}

export function deleteAreaError(error) {
  return {
    type: DELETE_AREA_ERROR,
    error,
  };
}

export function resetAreas() {
  return {
    type: RESET_AREAS,
  };
}
