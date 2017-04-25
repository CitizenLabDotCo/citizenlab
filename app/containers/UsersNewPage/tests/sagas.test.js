/**
 * Test  sagas
 */

/* eslint-disable */
import { call, put } from 'redux-saga/effects';
import { createUser as createUserSaga } from '../sagas';
import {
  CREATE_USER_SUCCESS,
  CREATE_USER_ERROR,
} from './../constants';
import { createUser } from 'api';

const newUser = { name: 'tesla' };
const fakeError = {};
const generator = createUserSaga({ payload: newUser });

describe('createUser Saga', () => {
  it('calls correct api', () => {
    expect(generator.next().value).toEqual(call(createUser, newUser));
  });

  it('should dispatch correct action after success', () => {
    expect(generator.next().value).toEqual(put({ type: CREATE_USER_SUCCESS, payload: undefined }));
  });

  it('should dispatch correct action after failure', () => {
    expect(generator.throw(fakeError).value).toEqual(put({ type: CREATE_USER_ERROR, payload: fakeError, error: true }));
  });
});
