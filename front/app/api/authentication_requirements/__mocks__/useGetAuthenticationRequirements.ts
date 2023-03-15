import { AuthenticationRequirementsResponse } from '../types';

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
          special: {
            password: 'require',
            confirmation: 'require',
          },
        },
      },
    },
  },
};

export const projectResponse: AuthenticationRequirementsResponse = {
  data: {
    type: 'requirements',
    attributes: {
      requirements: {
        permitted: false,
        requirements: {
          built_in: {
            first_name: 'dont_ask',
            last_name: 'dont_ask',
            email: 'require',
          },
          custom_fields: {},
          special: {
            password: 'dont_ask',
            confirmation: 'require',
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
          special: {
            password: 'satisfied',
            confirmation: 'require',
          },
        },
      },
    },
  },
};
