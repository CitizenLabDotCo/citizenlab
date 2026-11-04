import { http, HttpResponse } from 'msw';

import { API_PATH } from 'containers/App/constants';

import { IdMethods } from '../types';

// No verification or SSO methods enabled.
export const idMethodsData: IdMethods = { data: [] };

export const idMethodsPath = `${API_PATH}/id_methods`;

const endpoints = {
  'GET /id_methods': http.get(idMethodsPath, () => {
    return HttpResponse.json(idMethodsData, { status: 200 });
  }),
};

export default endpoints;
