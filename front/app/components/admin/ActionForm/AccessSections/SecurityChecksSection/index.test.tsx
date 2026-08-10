import React from 'react';

import { IPhasePermissionData } from 'api/phase_permissions/types';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import SecurityChecksSection from '.';

// The two things this section reacts to: whether SMS is on (a phone check needs
// it to send the code) and whether a verification method is configured.
let mockSmsEnabled = true;
let mockVerificationMethodConfigured = true;

jest.mock('hooks/useFeatureFlag', () =>
  jest.fn(({ name }: { name: string }) =>
    name === 'sms' ? mockSmsEnabled : false
  )
);

jest.mock('api/id_methods/useVerificationMethod', () =>
  jest.fn(() => ({
    data: mockVerificationMethodConfigured
      ? { data: { attributes: { method_metadata: { name: 'ItsMe' } } } }
      : null,
  }))
);

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
    <SecurityChecksSection
      permission={buildPermission(attributes)}
      onChange={onChange}
    />
  );
  return onChange;
};

beforeEach(() => {
  mockSmsEnabled = true;
  mockVerificationMethodConfigured = true;
});

describe('<SecurityChecksSection />', () => {
  describe('open / collapsed state', () => {
    it('starts open when a check is already required', () => {
      renderSection();
      expect(screen.getByText('Confirmed email')).toBeInTheDocument();
    });

    it('starts collapsed with a "None" summary when nothing is required', () => {
      renderSection({ require_confirmed_email: false });

      expect(screen.queryByText('Confirmed email')).not.toBeInTheDocument();
      expect(screen.getByText('None')).toBeInTheDocument();
    });

    it('can be expanded from collapsed', async () => {
      renderSection({ require_confirmed_email: false });

      await userEvent.click(screen.getByText('Security checks'));

      expect(screen.getByText('Confirmed email')).toBeInTheDocument();
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

      expect(screen.getByText('Confirmed email')).toBeInTheDocument();
      expect(screen.getByText('Confirmed phone number')).toBeInTheDocument();
      expect(screen.getByText('Identity verification')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Participant confirms an email address with a one-time code.'
        )
      ).toBeInTheDocument();
    });

    it('hides the phone row when SMS is off', () => {
      mockSmsEnabled = false;
      renderSection();

      expect(
        screen.queryByText('Confirmed phone number')
      ).not.toBeInTheDocument();
      expect(screen.getByText('Confirmed email')).toBeInTheDocument();
    });

    it('keeps the email check available regardless of how people sign in', () => {
      // No password login is mocked here at all (useFeatureFlag only answers
      // 'sms'), so this covers an SSO-only platform.
      renderSection();

      expect(
        screen.getByText(
          'Participant confirms an email address with a one-time code.'
        )
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/Unavailable: password login/)
      ).not.toBeInTheDocument();
    });

    it('marks verification unavailable when no method is configured', () => {
      mockVerificationMethodConfigured = false;
      renderSection();

      expect(
        screen.getByText(
          'Unavailable: no identity verification method is configured.'
        )
      ).toBeInTheDocument();
    });
  });

  describe('editing', () => {
    it('emits the enabled flag and expiry when a check is toggled', async () => {
      const onChange = renderSection();

      await userEvent.click(screen.getByText('Identity verification'));

      expect(onChange).toHaveBeenCalledWith({
        require_verification: true,
        verification_expiry: null,
      });
    });
  });
});
