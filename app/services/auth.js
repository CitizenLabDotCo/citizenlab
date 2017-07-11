import { API_PATH } from 'containers/App/constants';
import request from 'utils/request';
// import Streams from '../utils/streams';
// import Rx from 'rxjs/Rx';
// import _ from 'lodash';

export function signIn(email, password) {
  const data = {
    auth: {
      email,
      password,
    },
  };

  return request(`${API_PATH}/user_token`, data, {
    method: 'POST',
  });
}

export function observeSignIn(email, password) {
  return Streams.create(`${API_PATH}/ideas/${id}`, null, localProperties);
}