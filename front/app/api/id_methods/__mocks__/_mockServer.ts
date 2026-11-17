import { http, HttpResponse } from 'msw';

import { API_PATH } from 'containers/App/constants';

const verificationMethodPath = `${API_PATH}/id_methods/first_enabled_verification_method`;

const endpoints = {
  // Mirrors the API when the platform has no verification method enabled.
  'GET /id_methods/first_enabled_verification_method': http.get(
    verificationMethodPath,
    () => {
      return new HttpResponse(null, { status: 204 });
    }
  ),
};

export default endpoints;
