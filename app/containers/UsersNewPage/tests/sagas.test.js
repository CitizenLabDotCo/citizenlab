/**
 * Test  sagas
 */

/* eslint-disable */
import { take, call, put, select } from 'redux-saga/effects';
import { createUser } from '../sagas';
import Api from '../../../api';
import {
  CREATE_USER_PENDING,
  CREATE_USER_FULFILLED,
  CREATE_USER_REJECTED,
} from './../constants';

const newUser = { name: 'tesla' };
const fakeError = {};
const generator = createUser({ payload: newUser });

describe('createUser Saga', () => {
  it('calls correct api', () => {
    expect(generator.next().value).toEqual(call(Api.createUser, newUser));
  });

  // TODO: try not to use undefined
  it('dispatches correct action after success', () => {
    expect(generator.next().value).toEqual(put({ type: CREATE_USER_FULFILLED, payload: undefined }));
  });

  it('dispatches correct action after failure', () => {
    expect(generator.throw(fakeError).value).toEqual(put({ type: CREATE_USER_REJECTED, payload: fakeError, error: true }));
  });
});
