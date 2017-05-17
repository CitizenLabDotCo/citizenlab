/**
 * Test  sagas
 */

/* eslint-disable */
import { call, put } from 'redux-saga/effects';
import { createEmailUser as createUserSaga } from '../sagas';
import {
  CREATE_USER_SUCCESS,
  CREATE_USER_ERROR,
} from './../constants';

import {createEmailUserError, createEmailUserSuccess} from '../actions';

import { createUser } from 'api';
import { signInUserRequest } from 'utils/auth/actions';

const newUser = { name: 'tesla' };
const fakeError = {};
const generator = createUserSaga({ payload: newUser });

describe('createUser Saga', () => {
  it('calls correct api', () => {
    expect(generator.next().value).toEqual(call(createUser, newUser));
  });

  it('should try to sign in the user', () => {
    const next = generator.next().value
    expect(next).toEqual(put(signInUserRequest()));
  });

//a
  it('should dispatch correct action after success', () => {
    expect(generator.next().value).toEqual(put(createEmailUserSuccess()));
  });

  it('should dispatch correct action after failure', () => {
    expect(generator.throw(fakeError).value).toEqual(put(createEmailUserError({})));
  });
});
