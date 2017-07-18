import { API_PATH } from 'containers/App/constants';
import { getJwt, setJwt } from 'utils/auth/jwt';
import * as _ from 'lodash';
import request from 'utils/request';
import streams from 'utils/streams';

export function observeSignedInUser() {
  return streams.create({ apiEndpoint: `${API_PATH}/users/me` });
}

export function signIn(email, password) {
  const apiEndpoint = `${API_PATH}/user_token`;

  const bodyData = {
    auth: {
      email,
      password,
    },
  };

  const httpMethod = {
    method: 'POST',
  };

  return request(apiEndpoint, bodyData, httpMethod, null).then((data) => {
    const jwt = getJwt();

    if (!jwt && _.has(data, 'jwt')) {
      setJwt(data.jwt);
    }

    return data;
  })
  .catch((error) => {
    throw error;
  });
}

export function signUp(
  firstName,
  lastName,
  email,
  password,
  selectedGender = null,
  selectedYearOfBirth = null,
  selectedAreaId = null
) {
  const apiEndpoint = `${API_PATH}/users`;

  const bodyData = {
    user: {
      firstName,
      lastName,
      email,
      password,
      selectedGender,
      selectedYearOfBirth,
      selectedAreaId,
    },
  };

  const httpMethod = {
    method: 'POST',
  };

  return request(apiEndpoint, bodyData, httpMethod, null).then(() => {
    return { email, password };
  })
  .catch((error) => {
    throw error;
  });
}
