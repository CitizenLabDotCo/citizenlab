/* eslint-disable */
import { call, put } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { createUser} from '../sagas';
import { signInUser } from '../sagas'
import { createUserSuccess, loadIdeaAreasReportError, loadIdeaTopicsReportError, loadUsersReportSuccess } from '../actions';
import { createUser as createUserRequest, login } from 'api';

const email = 'johndoe@gmail.com';
const password = 'pineapple';
const newUser = {
  first_name: 'John',
  last_name: 'Doe',
  email,
  password,
  locale: 'en'
};

describe('createUser Saga', () => {

    describe('create a new user and sign it on', () => {
        const it = sagaHelper(createUser(newUser));

        it('should have created a new user', (result) => {
            expect(result).toEqual(call(createUserRequest, newUser));
            return 'a new user object';
        });

        it('then should have signed in the newly created user', (result) => {
            expect(result).toEqual(call(signInUser, { email, password, user: 'a new user object' }));
        });

        it('then shoud have dispatched a createUserSuccess action', (result) => {
            expect(result).toEqual(put(createUserSuccess(user)));
        });

        it('and then nothing', (result) => {
            expect(result).toBeUndefined();
        });
    });

    describe('the createUserRequest API is broken and throws an exception', () => {
        const it = sagaHelper(createUser(newUser));

        it('should have called the createUserRequest API, which should have thrown an excpetion', (result) => {
            expect(result).toEqual(call(createUserRequest, newUser));
            return new Error('Something went wrong');
        });

        it('then should have dispatched a createUserError error', (result) => {
            expect(result).toEqual(put(createUserError('Something went wrong')));
        });

        it('and then nothing', (result) => {
            expect(result).toBeUndefined();
        });
    });

    describe('the signInUser API is broken and throws an exception', () => {
        const it = sagaHelper(createUser(newUser));

        it('should have created a new user', (result) => {
            expect(result).toEqual(call(createUserRequest, newUser));
            return 'a new user object';
        });

        it('should have aclled the signInUser API, which should have thrown an exception', (result) => {
            expect(result).toEqual(call(signInUser, { email, password, user: 'a new user object' }));
            return new Error('Something went wrong');
        });

        it('then should dispatch a createUserError error', (result) => {
            expect(result).toEqual(put(createUserError('Something went wrong')));
        });

        it('and then nothing', (result) => {
            expect(result).toBeUndefined();
        });
    });

});