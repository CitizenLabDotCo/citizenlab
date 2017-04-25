/*
 *
 * UsersNewPage actions
 *
 */

import {
  CREATE_USER_REQUEST,
} from './constants';

export function createUser(payload) {
  return {
    type: CREATE_USER_REQUEST,
    payload,
  };
}
