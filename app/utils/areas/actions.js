import {
  LOAD_AREAS_REQUEST,
  LOAD_AREAS_SUCCESS,
  LOAD_AREAS_ERROR,
} from './constants';

export function loadAreas() {
  return {
    type: LOAD_AREAS_REQUEST,
  };
}

export function areasLoaded(areas) {
  return {
    type: LOAD_AREAS_SUCCESS,
    payload: { areas },
  };
}

export function loadAreasError(error) {
  return {
    type: LOAD_AREAS_ERROR,
    payload: error,
  };
}
