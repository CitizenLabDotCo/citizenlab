import React from 'react';

import { IdMethodData } from 'api/id_methods/types';
import { IPermissionData } from 'api/permissions/types';

import { render, screen, within, userEvent } from 'utils/testUtils/rtl';

import SecurityRequirementsSection from '.';

// What this section reacts to: whether SMS (and SMS login) is on, whether
// password login is on, whether a verification method is configured, and
// whether any sign-in method can leave a participant without an email address.
let mockSmsEnabled = true;
let mockSmsLoginEnabled = true;
let mockPasswordLoginEnabled = true;
let mockVerificationMethodConfigured = true;
let mockIdMethods: IdMethodData[] = [];

jest.mock('hooks/useFeatureFlag', () =>
  jest.fn(({ name }: { name: string }) => {
    if (name === 'sms') return mockSmsEnabled;
    if (name === 'sms_login') return mockSmsLoginEnabled;
    if (name === 'password_login') return mockPasswordLoginEnabled;
    return false;
  })
);

jest.mock('api/id_methods/useVerificationMethod', () =>
  jest.fn(() => ({
    data: mockVerificationMethodConfigured
      ? { data: { attributes: { method_metadata: { name: 'ItsMe' } } } }
      : null,
  }))
);

jest.mock('api/id_methods/useIdMethods', () =>
  jest.fn(() => ({ data: { data: mockIdMethods } }))
);

const SECTION_TITLE = 'Security requirements';
const EMAIL_LABEL = 'Require confirmed email from all participants';
const PHONE_LABEL = 'Require confirmed phone number from all participants';
const VERIFICATION_LABEL =
  'Require identity verification from all participants';
const PASSWORD_LABEL = 'Password';

// The collapsed summary uses shortened versions of the row labels.
const PASSWORD_SUMMARY = 'Password';
const PHONE_SUMMARY = 'Confirmed phone';
const VERIFICATION_SUMMARY = 'Verification';

// An authentication method that may sign someone up without an email address -
// which is also what makes the password only apply to some participants.
const emaillessAuthMethod = {
  id: 'method-fake_sso',
  type: 'id_method',
  attributes: {
    name: 'fake_sso',
    authentication_method: true,
    verification_method: false,
    method_metadata: { name: 'Fake SSO', email_always_present: false },
  },
} as IdMethodData;

const buildPermission = (
  attributes: Partial<IPermissionData['attributes']> = {}
): IPermissionData =>
  ({
    id: 'perm-1',
    type: 'permission',
    attributes: {
      action: 'commenting_idea',
      permitted_by: 'users',
      global_custom_fields: false,
      verification_expiry: null,
      access_denied_explanation_multiloc: {},
      everyone_tracking_enabled: false,
      user_data_collection: 'all_data',
      require_confirmed_email: true,
      confirmed_email_expiry: null,
      require_confirmed_phone_number: false,
      confirmed_phone_number_expiry: null,
      require_name: true,
      require_password: true,
      require_verification: false,
      permitted_by_everyone_allowed: false,
      ...attributes,
    },
    relationships: {
      permission_scope: { data: { id: 'ph-1', type: 'phase' } },
      groups: { data: [] },
    },
  } as IPermissionData);

const renderSection = (
  attributes?: Partial<IPermissionData['attributes']>,
  onChange = jest.fn()
) => {
  render(
    <SecurityRequirementsSection
      permission={buildPermission(attributes)}
      onChange={onChange}
    />
  );
  return onChange;
};

// The section always starts collapsed, so anything below the header has to be
// revealed first.
const openSection = () => userEvent.click(screen.getByText(SECTION_TITLE));

beforeEach(() => {
  mockSmsEnabled = true;
  mockSmsLoginEnabled = true;
  mockPasswordLoginEnabled = true;
  mockVerificationMethodConfigured = true;
  mockIdMethods = [];
});

describe('<SecurityRequirementsSection />', () => {
  describe('open / collapsed state', () => {
    it('starts collapsed even when a check is already required', () => {
      renderSection();
      expect(screen.queryByText(EMAIL_LABEL)).not.toBeInTheDocument();
    });

    it('summarises "None" when nothing is required', () => {
      renderSection({
        require_confirmed_email: false,
        require_password: false,
      });

      expect(screen.getByText('None')).toBeInTheDocument();
    });

    it('can be expanded from collapsed', async () => {
      renderSection({
        require_confirmed_email: false,
        require_password: false,
      });

      await openSection();

      expect(screen.getByText(EMAIL_LABEL)).toBeInTheDocument();
    });

    it('summarises every required check', () => {
      renderSection({
        require_confirmed_email: false,
        require_confirmed_phone_number: true,
        require_verification: true,
      });

      expect(
        screen.getByText(
          `${PASSWORD_SUMMARY} · ${PHONE_SUMMARY} · ${VERIFICATION_SUMMARY}`
        )
      ).toBeInTheDocument();
    });

    it('leaves an unavailable check out of the summary', () => {
      mockVerificationMethodConfigured = false;
      mockPasswordLoginEnabled = false;
      renderSection({
        require_confirmed_email: false,
        require_confirmed_phone_number: true,
        require_verification: true,
      });

      expect(screen.getByText('None')).toBeInTheDocument();
    });
  });

  describe('which checks are offered', () => {
    it('shows all four rows with their descriptions', async () => {
      renderSection();
      await openSection();

      expect(screen.getByText(PASSWORD_LABEL)).toBeInTheDocument();
      expect(screen.getByText(EMAIL_LABEL)).toBeInTheDocument();
      expect(screen.getByText(PHONE_LABEL)).toBeInTheDocument();
      expect(screen.getByText(VERIFICATION_LABEL)).toBeInTheDocument();
      expect(
        screen.getByText(
          'If enabled, all users need to confirm their email. If disabled, only participants who sign up by email need to confirm their email.'
        )
      ).toBeInTheDocument();
    });

    it('hides the phone and email rows when SMS is off', async () => {
      // Without SMS nobody can sign up by phone, so neither the phone check nor
      // the (then unconditional) email confirmation is configurable.
      mockSmsEnabled = false;
      renderSection();
      await openSection();

      expect(screen.queryByText(PHONE_LABEL)).not.toBeInTheDocument();
      expect(screen.queryByText(EMAIL_LABEL)).not.toBeInTheDocument();
      expect(screen.getByText(VERIFICATION_LABEL)).toBeInTheDocument();
    });

    it('hides the email row when SMS login is off', async () => {
      mockSmsLoginEnabled = false;
      renderSection({ require_confirmed_phone_number: true });
      await openSection();

      expect(screen.queryByText(EMAIL_LABEL)).not.toBeInTheDocument();
      expect(screen.getByText(PHONE_LABEL)).toBeInTheDocument();
    });

    it('offers the email row when a sign-in method may not return an email', async () => {
      mockSmsEnabled = false;
      mockIdMethods = [emaillessAuthMethod];
      renderSection();
      await openSection();

      expect(screen.getByText(EMAIL_LABEL)).toBeInTheDocument();
    });

    it('drops the conditional wording on the phone row when SMS login is off', async () => {
      mockSmsLoginEnabled = false;
      renderSection({ require_confirmed_phone_number: true });
      await openSection();

      expect(
        screen.getByText('Participant must have a confirmed phone number.')
      ).toBeInTheDocument();
    });

    it('hides the verification row when no method is configured', async () => {
      mockVerificationMethodConfigured = false;
      renderSection();
      await openSection();

      expect(screen.queryByText(VERIFICATION_LABEL)).not.toBeInTheDocument();
      expect(screen.getByText(EMAIL_LABEL)).toBeInTheDocument();
    });

    it('hides the password and phone rows when password login is off', async () => {
      // Phone confirmation codes are part of the password_login flow, so with
      // that feature off a confirmed phone number can never be obtained and the
      // check is not offered either.
      mockPasswordLoginEnabled = false;
      renderSection();
      await openSection();

      expect(screen.queryByText(PASSWORD_LABEL)).not.toBeInTheDocument();
      expect(screen.queryByText(PHONE_LABEL)).not.toBeInTheDocument();
      expect(screen.getByText(EMAIL_LABEL)).toBeInTheDocument();
    });

    it('renders nothing when no check is available at all', () => {
      mockSmsEnabled = false;
      mockPasswordLoginEnabled = false;
      mockVerificationMethodConfigured = false;
      renderSection();

      expect(screen.queryByText(SECTION_TITLE)).not.toBeInTheDocument();
    });
  });

  describe('the password row', () => {
    it('explains that a password only applies to email sign-ups when SSO is on', async () => {
      mockIdMethods = [emaillessAuthMethod];
      renderSection();
      await openSection();

      const passwordRow = screen.getByText(PASSWORD_LABEL).parentElement!;
      await userEvent.hover(
        within(passwordRow).getByTestId('tooltip-icon-button')
      );

      expect(
        await screen.findByText(
          /only requested from users who sign up with email/i
        )
      ).toBeInTheDocument();
    });

    it('does not explain anything when there is no SSO method', async () => {
      renderSection();
      await openSection();

      const passwordRow = screen.getByText(PASSWORD_LABEL).parentElement!;
      expect(
        within(passwordRow).queryByTestId('tooltip-icon-button')
      ).not.toBeInTheDocument();
    });

    it('emits the password requirement when toggled', async () => {
      const onChange = renderSection();
      await openSection();

      await userEvent.click(screen.getByText(PASSWORD_LABEL));

      expect(onChange).toHaveBeenCalledWith({ require_password: false });
    });
  });

  describe('editing', () => {
    it('emits the enabled flag and expiry when a check is toggled', async () => {
      const onChange = renderSection();
      await openSection();

      await userEvent.click(screen.getByText(VERIFICATION_LABEL));

      expect(onChange).toHaveBeenCalledWith({
        require_verification: true,
        verification_expiry: null,
      });
    });
  });
});
