import { http, HttpResponse } from 'msw';

import { API_PATH } from 'containers/App/constants';

import { AuthenticationRequirementsResponse } from '../types';

export const visitorResponse: AuthenticationRequirementsResponse = {
  data: {
    type: 'requirements',
    attributes: {
      permitted: false,
      disabled_reason: 'user_missing_requirements',
      requirements: {
        authentication: {
          permitted_by: 'users',
          missing_user_attributes: [
            'first_name',
            'last_name',
            'email',
            'password',
            'confirmation',
          ],
        },
        verification: false,
        custom_fields: {},
        onboarding: false,
        group_membership: false,
      },
    },
  },
};

export const phaseResponse: AuthenticationRequirementsResponse = {
  data: {
    type: 'requirements',
    attributes: {
      permitted: false,
      disabled_reason: 'user_missing_requirements',
      requirements: {
        authentication: {
          permitted_by: 'users',
          missing_user_attributes: ['confirmation'],
        },
        verification: false,
        custom_fields: {},
        onboarding: false,
        group_membership: false,
      },
    },
  },
};

export const ideaResponse: AuthenticationRequirementsResponse = {
  data: {
    type: 'requirements',
    attributes: {
      permitted: true,
      disabled_reason: null,
      requirements: {
        authentication: {
          permitted_by: 'users',
          missing_user_attributes: [],
        },
        verification: false,
        custom_fields: {},
        onboarding: false,
        group_membership: false,
      },
    },
  },
};

const globalPath = `${API_PATH}/permissions/visiting/requirements`;
export const phasePath = `${API_PATH}/phases/456/permissions/posting_idea/requirements`;
export const ideaPath = `${API_PATH}/ideas/789/permissions/commenting_idea/requirements`;

const endpoints = {
  'GET permissions/visiting/requirements': http.get(globalPath, () => {
    return HttpResponse.json(visitorResponse, { status: 200 });
  }),
  'GET phases/:phaseId/permissions/posting_idea/requirements': http.get(
    phasePath,
    () => {
      return HttpResponse.json(phaseResponse, { status: 200 });
    }
  ),
  'GET ideas/:ideaId/permissions/commenting_idea/requirements': http.get(
    ideaPath,
    () => {
      return HttpResponse.json(ideaResponse, { status: 200 });
    }
  ),
};

export default endpoints;
