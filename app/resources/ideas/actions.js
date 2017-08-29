/*
 *
 * resources/ideas actions
 *
 */

import {
  LOAD_IDEAS_ERROR, LOAD_IDEAS_REQUEST, LOAD_IDEAS_SUCCESS, RESET_IDEAS, LOAD_IDEA_REQUEST, LOAD_IDEA_SUCCESS, LOAD_IDEA_ERROR, DELETE_IDEA_REQUEST, DELETE_IDEA_SUCCESS, DELETE_IDEA_ERROR, CREATE_IDEA_SUCCESS } from './constants';

export function loadIdeasRequest(nextPageNumber, nextPageItemCount) {
  return {
    type: LOAD_IDEAS_REQUEST,
    nextPageNumber,
    nextPageItemCount,
  };
}

export function loadIdeasSuccess(response) {
  return {
    type: LOAD_IDEAS_SUCCESS,
    payload: response,
  };
}

export function loadIdeasError(error) {
  return {
    type: LOAD_IDEAS_ERROR,
    error,
  };
}

export function loadIdeaRequest(id) {
  return {
    type: LOAD_IDEA_REQUEST,
    id,
  };
}

export function loadIdeaSuccess(response) {
  return {
    type: LOAD_IDEA_SUCCESS,
    payload: response,
  };
}

export function loadIdeaError(error) {
  return {
    type: LOAD_IDEA_ERROR,
    error,
  };
}

export function createIdeaSuccess(response) {
  return {
    type: CREATE_IDEA_SUCCESS,
    payload: response,
  };
}

export function deleteIdeaRequest(id) {
  return {
    type: DELETE_IDEA_REQUEST,
    id,
  };
}

export function deleteIdeaSuccess(id) {
  return {
    type: DELETE_IDEA_SUCCESS,
    id,
  };
}

export function deleteIdeaError(error) {
  return {
    type: DELETE_IDEA_ERROR,
    error,
  };
}

export function resetIdeas() {
  return {
    type: RESET_IDEAS,
  };
}
