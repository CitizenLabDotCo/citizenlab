import { createMachine, assign } from 'xstate';
import {
  accountCreatedSuccessfully,
  emailConfirmationNecessary,
  emailConfirmedSuccessfully,
} from './checks';

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
      ENTER_EMAIL_SIGN_UP: 'email-sign-up',
    },
  },
  'email-sign-up': {
    on: {
      SUBMIT_EMAIL: 'email-sign-up:submitting',
    },
  },
  'email-sign-up:submitting': {
    invoke: {
      src: 'checkIfEmailSubmitSucceeded',
      onDone: { target: 'maybe(email-confirmation)', actions: 'onSuccess' },
      onError: { target: 'email-sign-up', actions: 'onError' },
    },
  },
  'maybe(email-confirmation)': {
    invoke: {
      src: 'checkIfEmailConfirmationNecessary',
      onDone: 'email-confirmation',
      onError: 'success',
    },
  },
  'email-confirmation': {
    on: {
      CONFIRM_EMAIL: 'email-confirmation:submitting',
    },
  },
  'email-confirmation:submitting': {
    invoke: {
      src: 'checkIfEmailConfirmationSucceeded',
      onDone: { target: 'success', actions: 'onSuccess' },
      onError: { target: 'email-confirmation', actions: 'onError' },
    },
  },
  success: {},
} as const;

const services = {
  checkIfEmailSubmitSucceeded: async () => {
    return await accountCreatedSuccessfully();
  },
  checkIfEmailConfirmationNecessary: async () => {
    return await emailConfirmationNecessary();
  },
  checkIfEmailConfirmationSucceeded: async () => {
    return await emailConfirmedSuccessfully();
  },
};

const actions = {
  onSuccess: assign((_ctx, _event) => ({
    error: undefined,
  })),
  onError: assign((_ctx, _event) => ({
    error: 'Error!',
  })),
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
