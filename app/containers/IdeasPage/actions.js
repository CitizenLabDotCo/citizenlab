/*
 *
 * IdeasPage actions
 *
 */

import {
  ADD_IDEA,
} from './constants';

export function addIdea(payload) {
  return {
    type: ADD_IDEA,
    payload,
  };
}
