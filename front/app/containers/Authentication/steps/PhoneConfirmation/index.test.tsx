import React from 'react';

import { setResendCooldown } from 'api/authentication/confirm_phone/resendCooldown';

import { render, screen, fireEvent, act } from 'utils/testUtils/rtl';

import PhoneConfirmation from '.';

const onResendCode = jest.fn().mockResolvedValue(undefined);

const renderPhoneConfirmation = () =>
  render(
    <PhoneConfirmation
      phone="+14155552671"
      loading={false}
      setError={jest.fn()}
      onConfirm={jest.fn()}
      onResendCode={onResendCode}
    />
  );

const queryResendLink = () => screen.queryByText(/send new code/i);
// By data-cy rather than by text: the same copy also goes out through the screen
// reader live region at the top of the step.
const queryCodeSentMessage = () =>
  document.querySelector('[data-cy="confirmation-code-sent-message"]');
const queryCountdown = (seconds?: number) =>
  screen.queryByText(
    new RegExp(`you can request a new code in ${seconds ?? ''}`, 'i')
  );

describe('PhoneConfirmation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    onResendCode.mockClear();
  });

  afterEach(() => jest.useRealTimers());

  describe('when a code was sent moments ago', () => {
    beforeEach(() => setResendCooldown(60));

    it('counts down instead of offering a new code', () => {
      renderPhoneConfirmation();

      expect(queryCountdown(60)).toBeInTheDocument();
      expect(queryResendLink()).not.toBeInTheDocument();

      act(() => jest.advanceTimersByTime(1000));
      expect(queryCountdown(59)).toBeInTheDocument();
    });

    it('offers a new code once the interval has run out', () => {
      renderPhoneConfirmation();

      act(() => jest.advanceTimersByTime(60_000));

      expect(queryCountdown()).not.toBeInTheDocument();
      expect(queryResendLink()).toBeInTheDocument();
    });
  });

  describe('when no code was sent recently', () => {
    beforeEach(() => setResendCooldown(0));

    it('offers a new code', async () => {
      renderPhoneConfirmation();

      expect(queryResendLink()).toBeInTheDocument();
      expect(queryCountdown()).not.toBeInTheDocument();

      await act(async () => {
        fireEvent.click(queryResendLink() as HTMLElement);
      });

      expect(onResendCode).toHaveBeenCalledWith('+14155552671');
    });

    it('starts counting down again once the new code went out', async () => {
      // The request itself is what records the new cooldown.
      onResendCode.mockImplementationOnce(async () => setResendCooldown(60));
      renderPhoneConfirmation();

      await act(async () => {
        fireEvent.click(queryResendLink() as HTMLElement);
      });

      expect(queryCountdown(60)).toBeInTheDocument();
      expect(queryResendLink()).not.toBeInTheDocument();
    });

    it('stops confirming the code was sent once the countdown has run out', async () => {
      onResendCode.mockImplementationOnce(async () => setResendCooldown(60));
      renderPhoneConfirmation();

      await act(async () => {
        fireEvent.click(queryResendLink() as HTMLElement);
      });

      expect(queryCodeSentMessage()).toBeInTheDocument();

      act(() => jest.advanceTimersByTime(60_000));

      expect(queryCodeSentMessage()).not.toBeInTheDocument();
      expect(queryResendLink()).toBeInTheDocument();
    });
  });
});
