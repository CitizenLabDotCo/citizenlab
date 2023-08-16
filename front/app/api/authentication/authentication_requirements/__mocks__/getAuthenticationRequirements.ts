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
          onboarding: {},
          special: {
            password: 'dont_ask',
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
