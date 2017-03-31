/*
 *
 * UsersNewPage actions
 *
 */

import {
  CREATE_USER_PENDING,
} from './constants';

export function createUser(payload) {
  return {
    type: CREATE_USER_PENDING,
    payload,
  };
}
