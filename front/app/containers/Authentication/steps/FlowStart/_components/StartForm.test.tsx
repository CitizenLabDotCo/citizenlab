import React from 'react';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { State } from 'containers/Authentication/typings';

import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';

import sharedMessages from '../../messages';

import StartForm from './StartForm';

jest.mock('hooks/useFeatureFlag', () => jest.fn());

const onSubmitEmail = jest.fn();
const onSubmitPhone = jest.fn();

const state = {
  flow: 'signup',
  email: null,
  phone: null,
  new_email: null,
  new_phone: null,
  smsManualCampaignConsent: false,
  token: null,
  prefilledBuiltInFields: null,
  ssoProvider: null,
  claimTokens: null,
} satisfies State;

const renderStartForm = (stateOverrides: Partial<State> = {}) =>
  render(
    <StartForm
      loading={false}
      topText={sharedMessages.enterYourEmailAddress}
      state={{ ...state, ...stateOverrides }}
      setError={jest.fn()}
      onSubmitEmail={onSubmitEmail}
      onSubmitPhone={onSubmitPhone}
    />
  );

const queryToggle = () =>
  screen.queryByRole('button', {
    name: /use your (phone number|email address) instead/i,
  });

describe('StartForm', () => {
  describe('when the sms feature is disabled', () => {
    beforeEach(() => (useFeatureFlag as jest.Mock).mockReturnValue(false));

    it('only offers the email form', () => {
      renderStartForm();

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(queryToggle()).not.toBeInTheDocument();
    });
  });

  describe('when the sms feature is enabled', () => {
    beforeEach(() => (useFeatureFlag as jest.Mock).mockReturnValue(true));

    it('starts on the email form and can switch to the phone form and back', () => {
      renderStartForm();

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

      fireEvent.click(queryToggle() as HTMLElement);
      expect(
        screen.getByRole('textbox', { name: 'Phone number' })
      ).toBeInTheDocument();
      expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();

      fireEvent.click(queryToggle() as HTMLElement);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('starts on the phone form when a phone number is already in the state', () => {
      renderStartForm({ phone: '+32470123456' });

      expect(
        screen.getByRole('textbox', { name: 'Phone number' })
      ).toBeInTheDocument();
      expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    });

    it('prefills the email form with the address already in the state', () => {
      renderStartForm({ email: 'test@citizenlab.co' });

      expect(screen.getByLabelText(/email/i)).toHaveValue('test@citizenlab.co');
    });

    it('submits the email through onSubmitEmail', async () => {
      renderStartForm();

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@citizenlab.co' },
      });
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() =>
        expect(onSubmitEmail).toHaveBeenCalledWith('test@citizenlab.co')
      );
      expect(onSubmitPhone).not.toHaveBeenCalled();
    });
  });
});
