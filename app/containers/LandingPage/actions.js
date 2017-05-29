import {
  LOAD_IDEAS_REQUEST, LOAD_IDEAS_SUCCESS, LOAD_IDEAS_ERROR,
} from './constants';

export function loadIdeas(nextPageNumber, nextPageItemCount) {
  return {
    type: LOAD_IDEAS_REQUEST,
    nextPageNumber,
    nextPageItemCount,
  };
}

export function ideasLoaded(ideas) {
  return {
    type: LOAD_IDEAS_SUCCESS,
    payload: { ideas },
  };
}

export function ideasLoadError(error) {
  return {
    type: LOAD_IDEAS_ERROR,
    payload: error,
  };
}
