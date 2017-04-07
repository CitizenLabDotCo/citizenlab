/*
 *
 * IdeasShow actions
 *
 */

import {
  LOAD_IDEA_REQUEST,
  LOAD_IDEA_SUCCESS,
  LOAD_IDEA_ERROR,
} from './constants';

export function loadIdea(payload) {
  return {
    type: LOAD_IDEA_REQUEST,
    payload,
  };
}

export function loadIdeaSuccess(payload) {
  return {
    type: LOAD_IDEA_SUCCESS,
    payload,
  };
}

export function loadIdeaError(payload) {
  return {
    type: LOAD_IDEA_ERROR,
    payload,
    error: true,
  };
}
