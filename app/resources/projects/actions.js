/*
 *
 * resources/projects actions
 *
 */

import {
  LOAD_PROJECTS_ERROR, LOAD_PROJECTS_REQUEST, LOAD_PROJECTS_SUCCESS, RESET_PROJECTS, LOAD_PROJECT_REQUEST, LOAD_PROJECT_SUCCESS, LOAD_PROJECT_ERROR, DELETE_PROJECT_REQUEST, DELETE_PROJECT_SUCCESS, DELETE_PROJECT_ERROR, CREATE_PROJECT_SUCCESS } from './constants';

export function loadProjectsRequest(nextPageNumber = 1, nextPageItemCount = 9) {
  return {
    type: LOAD_PROJECTS_REQUEST,
    nextPageNumber,
    nextPageItemCount,
  };
}

export function loadProjectsSuccess(response) {
  return {
    type: LOAD_PROJECTS_SUCCESS,
    payload: response,
  };
}

export function loadProjectsError(error) {
  return {
    type: LOAD_PROJECTS_ERROR,
    error,
  };
}

export function loadProjectRequest(id) {
  return {
    type: LOAD_PROJECT_REQUEST,
    id,
  };
}

export function loadProjectSuccess(response) {
  return {
    type: LOAD_PROJECT_SUCCESS,
    payload: response,
  };
}

export function loadProjectError(error) {
  return {
    type: LOAD_PROJECT_ERROR,
    error,
  };
}

export function createProjectSuccess(response) {
  return {
    type: CREATE_PROJECT_SUCCESS,
    payload: response,
  };
}

export function deleteProjectRequest(id) {
  return {
    type: DELETE_PROJECT_REQUEST,
    id,
  };
}

export function deleteProjectSuccess(id) {
  return {
    type: DELETE_PROJECT_SUCCESS,
    id,
  };
}

export function deleteProjectError(error) {
  return {
    type: DELETE_PROJECT_ERROR,
    error,
  };
}

export function resetProjects() {
  return {
    type: RESET_PROJECTS,
  };
}
