import React from 'react';

import { IdMethodData } from 'api/id_methods/types';
import { IPhasePermissionData } from 'api/phase_permissions/types';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import SecurityRequirementsSection from '.';

// What this section reacts to: whether SMS (and SMS login) is on, whether a
// verification method is configured, and whether any sign-in method can leave a
// participant without an email address.
let mockSmsEnabled = true;
let mockSmsLoginEnabled = true;
let mockVerificationMethodConfigured = true;
let mockIdMethods: IdMethodData[] = [];

jest.mock('hooks/useFeatureFlag', () =>
  jest.fn(({ name }: { name: string }) => {
    if (name === 'sms') return mockSmsEnabled;
    if (name === 'sms_login') return mockSmsLoginEnabled;
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

const EMAIL_LABEL = 'Require confirmed email from all participants';
const PHONE_LABEL = 'Require confirmed phone number from all participants';
const VERIFICATION_LABEL =
  'Require identity verification from all participants';

// An authentication method that may sign someone up without an email address.
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
  attributes: Partial<IPhasePermissionData['attributes']> = {}
): IPhasePermissionData =>
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
  } as IPhasePermissionData);

const renderSection = (
  attributes?: Partial<IPhasePermissionData['attributes']>,
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

beforeEach(() => {
  mockSmsEnabled = true;
  mockSmsLoginEnabled = true;
  mockVerificationMethodConfigured = true;
  mockIdMethods = [];
});

describe('<SecurityRequirementsSection />', () => {
  describe('open / collapsed state', () => {
    it('starts open when a check is already required', () => {
      renderSection();
      expect(screen.getByText(EMAIL_LABEL)).toBeInTheDocument();
    });

    it('starts collapsed with a "None" summary when nothing is required', () => {
      renderSection({ require_confirmed_email: false });

      expect(screen.queryByText(EMAIL_LABEL)).not.toBeInTheDocument();
      expect(screen.getByText('None')).toBeInTheDocument();
    });

    it('can be expanded from collapsed', async () => {
      renderSection({ require_confirmed_email: false });

      await userEvent.click(screen.getByText('Security requirements'));

      expect(screen.getByText(EMAIL_LABEL)).toBeInTheDocument();
    });

    it('summarises every required check', () => {
      renderSection({
        require_confirmed_email: false,
        require_confirmed_phone_number: true,
        require_verification: true,
      });

      // Collapsed, so this is the summary line rather than the rows.
      expect(
        screen.getByText(`${PHONE_LABEL} · ${VERIFICATION_LABEL}`)
      ).toBeInTheDocument();
    });

    it('does not count an unavailable check as a reason to open', () => {
      mockVerificationMethodConfigured = false;
      renderSection({
        require_confirmed_email: false,
        require_verification: true,
      });

      expect(screen.getByText('None')).toBeInTheDocument();
    });
  });

  describe('which checks are offered', () => {
    it('shows all three rows with their descriptions', () => {
      renderSection();

      expect(screen.getByText(EMAIL_LABEL)).toBeInTheDocument();
      expect(screen.getByText(PHONE_LABEL)).toBeInTheDocument();
      expect(screen.getByText(VERIFICATION_LABEL)).toBeInTheDocument();
      expect(
        screen.getByText(
          'If enabled, all users need to confirm their email. If disabled, only participants who sign up by email need to confirm their email.'
        )
      ).toBeInTheDocument();
    });

    it('hides the phone and email rows when SMS is off', () => {
      // Without SMS nobody can sign up by phone, so neither the phone check nor
      // the (then unconditional) email confirmation is configurable.
      mockSmsEnabled = false;
      renderSection();

      expect(screen.queryByText(PHONE_LABEL)).not.toBeInTheDocument();
      expect(screen.queryByText(EMAIL_LABEL)).not.toBeInTheDocument();
      expect(screen.getByText(VERIFICATION_LABEL)).toBeInTheDocument();
    });

    it('hides the email row when SMS login is off', () => {
      mockSmsLoginEnabled = false;
      renderSection();

      expect(screen.queryByText(EMAIL_LABEL)).not.toBeInTheDocument();
      expect(screen.getByText(PHONE_LABEL)).toBeInTheDocument();
    });

    it('offers the email row when a sign-in method may not return an email', () => {
      mockSmsEnabled = false;
      mockIdMethods = [emaillessAuthMethod];
      renderSection();

      expect(screen.getByText(EMAIL_LABEL)).toBeInTheDocument();
    });

    it('drops the conditional wording on the phone row when SMS login is off', () => {
      mockSmsLoginEnabled = false;
      renderSection({ require_confirmed_phone_number: true });

      expect(
        screen.getByText('Participant must have a confirmed phone number.')
      ).toBeInTheDocument();
    });

    it('hides the verification row when no method is configured', () => {
      mockVerificationMethodConfigured = false;
      renderSection();

      expect(screen.queryByText(VERIFICATION_LABEL)).not.toBeInTheDocument();
      expect(screen.getByText(EMAIL_LABEL)).toBeInTheDocument();
    });

    it('renders nothing when no check is available at all', () => {
      mockSmsEnabled = false;
      mockVerificationMethodConfigured = false;
      const { container } = render(
        <SecurityRequirementsSection
          permission={buildPermission()}
          onChange={jest.fn()}
        />
      );

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('editing', () => {
    it('emits the enabled flag and expiry when a check is toggled', async () => {
      const onChange = renderSection();

      await userEvent.click(screen.getByText(VERIFICATION_LABEL));

      expect(onChange).toHaveBeenCalledWith({
        require_verification: true,
        verification_expiry: null,
      });
    });
  });
});
