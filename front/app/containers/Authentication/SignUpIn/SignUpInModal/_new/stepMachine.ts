import { createMachine } from 'xstate';

const context = {
  error: undefined,
};

const states = {
  inactive: {
    on: {
      START_SIGN_IN_FLOW: 'sign-in-auth-providers',
      START_SIGN_UP_FLOW: 'sign-up-auth-providers',
    },
  },
  'sign-in-auth-providers': {
    on: {
      TOGGLE_FLOW: 'sign-up-auth-providers',
    },
  },
  'sign-up-auth-providers': {
    on: {
      TOGGLE_FLOW: 'sign-in-auth-providers',
    },
  },
  'email-sign-up': {
    on: {
      SUBMIT_EMAIL: 'email-sign-up:submitting',
    },
  },
  'email-sign-up:submitting': {
    invoke: {
      src: 'submitEmail',
      onDone: { target: 'success' },
      onError: { target: 'email-sign-up', actions: 'onError' },
    },
  },
  success: {},
} as const;

const services = {
  submitEmail: async () => {},
};

const actions = {
  // onError
};

export type States = typeof states;
export type Step = keyof States;

const stepMachine = createMachine(
  {
    initial: 'inactive',
    context,
    states,
  },
  {
    services,
    actions,
  }
);

export default stepMachine;
