/**
 * Test  sagas
 */

/* eslint-disable redux-saga/yield-effects */
import { delay } from 'redux-saga';
import { put, call } from 'redux-saga/effects';
import { push } from 'react-router-redux';
import sagaHelper from 'redux-saga-testing';
import { getRecoveryLink } from 'api';
import { stringMock } from 'utils/testing/constants';

import { postResetLink } from '../sagas';
import { sendRecoveryLinkSuccess } from '../actions';

describe('UsersPasswordRecovery sagas', () => {
  const email = stringMock;
  const mockedAction = { email };

  describe('getUser', () => {
    const it = sagaHelper(postResetLink(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(getRecoveryLink, mockedAction.email));
    });

    it('then, should dispatch sendRecoveryLinkSuccess action', (result) => {
      expect(result).toEqual(put(sendRecoveryLinkSuccess()));
    });

    it('then, should wait for 3s', (result) => {
      expect(result).toEqual(call(delay, 3000));
    });

    it('then, should dispatch push(\'/sign-in', (result) => {
      expect(result).toEqual(put(push('/sign-in')));
    });
  });
});
