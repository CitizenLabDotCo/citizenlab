/**
 * Test  sagas
 */

/* eslint-disable */
import { call, put } from 'redux-saga/effects';
import { createUser} from '../sagas';
import { signInUser } from '../sagas'
// import {
//   CREATE_USER_SUCCESS,
//   CREATE_USER_ERROR,
// } from './../constants';

// import {createEmailUserError, createEmailUserSuccess} from '../actions';

import { createUser as createUserRequest, login } from 'api';
// import { signInUserRequest } from 'utils/auth/actions';
//asdf
const newUser = { name: 'tesla' };
const userCredentials = {password: 'anana', email: 'pineapple'}
const fakeError = {json: {errors: 'NOOO, IT FAILED!!!'}};
const successCallback = () => 'YESS, IT WORKED!!!'
const errorCallback = (e) => e

const generator = createUser({...newUser, ...userCredentials}, successCallback, errorCallback);

describe('createUser Saga', () => {
  it('calls correct api', () => {
    const first = generator.next().value;
    expect(first).toEqual(call(createUserRequest, {...newUser, ...userCredentials}));
  });
//asdf
  it('should try to sign in the user', () => {
    const next = generator.next().value
    expect(next).toEqual(call(signInUser, userCredentials));
  });

  it('should dispatch correct action after success', () => {
    expect(generator.next().value).toEqual('YESS, IT WORKED!!!');
  });

  it('should dispatch correct action after failure', () => {
    expect(generator.throw(fakeError).value).toEqual('NOOO, IT FAILED!!!');
  });
});
