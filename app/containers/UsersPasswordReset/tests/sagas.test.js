/**
 * Test  sagas
 */

/* eslint-disable redux-saga/yield-effects */
import { delay } from 'redux-saga';
import { put, call } from 'redux-saga/effects';
import { push } from 'react-router-redux';
import sagaHelper from 'redux-saga-testing';
import { resetPassword } from 'api';
import { stringMock } from 'utils/testing/constants';

import { postResetPassword } from '../sagas';
import { resetPasswordSuccess } from '../actions';

describe('UsersPasswordRecovery sagas', () => {
  const password = stringMock;
  const token = stringMock;
  const mockedAction = { password, token };

  describe('getUser', () => {
    const it = sagaHelper(postResetPassword(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(resetPassword, mockedAction.password, mockedAction.token));
    });

    it('then, should dispatch resetPasswordSuccess action', (result) => {
      expect(result).toEqual(put(resetPasswordSuccess()));
    });

    it('then, should wait for 3s', (result) => {
      expect(result).toEqual(call(delay, 3000));
    });

    it('then, should dispatch push(\'/sign-in', (result) => {
      expect(result).toEqual(put(push('/sign-in')));
    });
  });
});
