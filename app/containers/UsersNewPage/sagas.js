import { call, put, takeLatest, select } from 'redux-saga/effects';
import { createUser, socialRegister, socialLogin } from 'api';
import { makeSelectSetting } from 'utils/tenant/selectors';
import { setJwt } from 'utils/auth/jwt';
import { storeJwt, loadCurrentUserRequest, signInUserRequest } from 'utils/auth/actions';
import { push } from 'react-router-redux';

import hello from 'hellojs';

import {
  CREATE_EMAIL_USER_REQUEST,
  CREATE_SOCIAL_USER_REQUEST,
} from './constants';
import {
  createEmailUserSuccess,
  createEmailUserError,
  createSocialUserSuccess,
  createSocialUserError,
} from './actions';



