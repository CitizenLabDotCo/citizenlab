import { rest } from 'msw';
import { AuthenticationRequirementsResponse } from '../types';
import { API_PATH } from 'containers/App/constants';

export const initiativeResponse: AuthenticationRequirementsResponse = {
  data: {
    type: 'requirements',
    attributes: {
      requirements: {
        permitted: false,
        requirements: {
          built_in: {
            first_name: 'require',
            last_name: 'require',
            email: 'require',
          },
          custom_fields: {},
          onboarding: {},
          special: {
            password: 'require',
            confirmation: 'require',
            verification: 'dont_ask',
            group_membership: 'dont_ask',
          },
        },
      },
    },
  },
};

export const phaseResponse: AuthenticationRequirementsResponse = {
  data: {
    type: 'requirements',
    attributes: {
      requirements: {
        permitted: false,
        requirements: {
          built_in: {
            first_name: 'satisfied',
            last_name: 'satisfied',
            email: 'satisfied',
          },
          custom_fields: {},
          onboarding: {},
          special: {
            password: 'satisfied',
            confirmation: 'require',
            verification: 'dont_ask',
            group_membership: 'dont_ask',
          },
        },
      },
    },
  },
};

export const ideaResponse: AuthenticationRequirementsResponse = {
  data: {
    type: 'requirements',
    attributes: {
      requirements: {
        permitted: true,
        requirements: {
          built_in: {
            first_name: 'satisfied',
            last_name: 'satisfied',
            email: 'satisfied',
          },
          custom_fields: {},
          onboarding: {},
          special: {
            password: 'satisfied',
            confirmation: 'satisfied',
            verification: 'dont_ask',
            group_membership: 'dont_ask',
          },
        },
      },
    },
  },
};

const globalPath = `${API_PATH}/permissions/visiting/requirements`;
export const initiativesPath = `${API_PATH}/permissions/posting_initiative/requirements`;
export const phasePath = `${API_PATH}/phases/456/permissions/posting_idea/requirements`;
export const ideaPath = `${API_PATH}/ideas/789/permissions/commenting_idea/requirements`;

const endpoints = {
  'GET permissions/visiting/requirements': rest.get(
    globalPath,
    (_req, res, ctx) => {
      return res(ctx.status(200), ctx.json(initiativeResponse));
    }
  ),
  'GET permissions/posting_initiative/requirements': rest.get(
    initiativesPath,
    (_req, res, ctx) => {
      return res(ctx.status(200), ctx.json(initiativeResponse));
    }
  ),
  'GET phases/:phaseId/permissions/posting_idea/requirements': rest.get(
    phasePath,
    (_req, res, ctx) => {
      return res(ctx.status(200), ctx.json(phaseResponse));
    }
  ),
  'GET ideas/:ideaId/permissions/commenting_idea/requirements': rest.get(
    ideaPath,
    (_req, res, ctx) => {
      return res(ctx.status(200), ctx.json(ideaResponse));
    }
  ),
};

export default endpoints;
