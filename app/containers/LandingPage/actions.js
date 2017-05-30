import {
  LOAD_IDEAS_REQUEST, LOAD_IDEAS_SUCCESS, LOAD_IDEAS_ERROR,
  LOAD_PROJECTS_REQUEST, LOAD_PROJECTS_SUCCESS, LOAD_PROJECTS_ERROR,
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

export function loadProjects(nextPageNumber, nextPageItemCount) {
  return {
    type: LOAD_PROJECTS_REQUEST,
    nextPageNumber,
    nextPageItemCount,
  };
}

export function projectsLoaded(projects) {
  return {
    type: LOAD_PROJECTS_SUCCESS,
    payload: { projects },
  };
}

export function projectsLoadError(error) {
  return {
    type: LOAD_PROJECTS_ERROR,
    payload: error,
  };
}
