/*
 *
 * IdeasShow actions
 *
 */

import {
  LOAD_IDEA_PENDING,
  LOAD_IDEA_FULFILLED,
  LOAD_IDEA_REJECTED,
} from './constants';

export function loadIdea(payload) {
  return {
    type: LOAD_IDEA_PENDING,
    payload,
  };
}

export function loadIdeaFullfilled(payload) {
  return {
    type: LOAD_IDEA_FULFILLED,
    payload,
  };
}

export function loadIdeaRejected(payload) {
  return {
    type: LOAD_IDEA_REJECTED,
    payload,
    error: true,
  };
}
