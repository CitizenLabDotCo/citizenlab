import { http, HttpResponse } from 'msw';

import { API_PATH } from 'containers/App/constants';

import { AccessDeniedExplanationResponse } from '../types';

const phaseAccessDeniedExplanationPath = `${API_PATH}/phases/:phaseId/permissions/:action/access_denied_explanation`;

const accessDeniedExplanation: AccessDeniedExplanationResponse = {
  data: {
    type: 'access_denied_explanation',
    attributes: {
      access_denied_explanation_multiloc: {},
    },
  },
};

const endpoints = {
  'GET phases/:phaseId/permissions/:action/access_denied_explanation': http.get(
    phaseAccessDeniedExplanationPath,
    () => {
      return HttpResponse.json(accessDeniedExplanation, { status: 200 });
    }
  ),
};

export default endpoints;
