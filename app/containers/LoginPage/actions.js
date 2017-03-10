/*
 *
 * LoginPage actions
 *
 */

import {
  USER_LOGIN,
} from './constants';

export function userLogin(values) {
  return {
    type: USER_LOGIN,
    payload: values,
  };
}
