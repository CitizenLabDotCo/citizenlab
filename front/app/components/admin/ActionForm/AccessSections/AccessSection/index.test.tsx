import React from 'react';

import { IPhasePermissionData } from 'api/phase_permissions/types';

import { render, screen, within, userEvent } from 'utils/testUtils/rtl';

import AccessSection from '.';

// ---- Controllable data hooks ------------------------------------------------
// The three things this section reacts to: whether password login is on,
// whether SMS is on, and whether an identity-verification method is configured.
let mockPasswordLoginEnabled = true;
let mockSmsEnabled = true;
let mockVerificationMethodConfigured = true;

jest.mock('hooks/useFeatureFlag', () =>
  jest.fn(({ name }: { name: string }) => {
    if (name === 'password_login') return mockPasswordLoginEnabled;
    if (name === 'sms') return mockSmsEnabled;
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

// Not under test - stub out the children with their own data dependencies.
jest.mock(
  'components/admin/ActionForm/AccessSections/GroupsSection',
  () => () => null
);
jest.mock(
  'components/admin/ActionForm/AccessSections/IdMethodsModal/Trigger',
  () => () => <div data-testid="id-method-fields-trigger" />
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
      email_and_phone_requirements: 'email_only',
      confirmed_email_expiry: null,
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
    <AccessSection
      permission={buildPermission(attributes)}
      showAnyone
      onChange={onChange}
    />
  );
  return onChange;
};

const openContactModal = async () => {
  await userEvent.click(screen.getByText('Change'));
};

beforeEach(() => {
  mockPasswordLoginEnabled = true;
  mockSmsEnabled = true;
  mockVerificationMethodConfigured = true;
});

describe('<AccessSection />', () => {
  it('renders the "Who can participate" header', () => {
    renderSection();
    expect(screen.getByText('Who can participate')).toBeInTheDocument();
  });

  describe('when an account is required (permitted_by: users)', () => {
    it('shows the contact requirement trigger and the verification row', () => {
      renderSection();

      expect(
        screen.getByText('Email and phone requirements')
      ).toBeInTheDocument();
      expect(screen.getByText('Email address')).toBeInTheDocument();
      expect(screen.getByText('Confirmed by email')).toBeInTheDocument();
      expect(screen.getByText('Identity verification')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Participant proves their identity through an external register.'
        )
      ).toBeInTheDocument();
    });

    it.each([
      ['neither', 'Nothing confirmed'],
      ['email_only', 'Email address'],
      ['both_email_and_phone', 'Email and phone number'],
      ['either_email_or_phone', 'Email or phone number'],
    ] as const)('summarises %s on the trigger', (requirement, title) => {
      renderSection({
        email_and_phone_requirements: requirement,
        require_verification: requirement === 'neither',
      });

      expect(screen.getByText(title)).toBeInTheDocument();
    });

    it('marks the verification method unavailable when none is configured', () => {
      mockVerificationMethodConfigured = false;
      renderSection();

      expect(
        screen.getByText(
          'Unavailable: no identity verification method is configured.'
        )
      ).toBeInTheDocument();
    });

    it('locks verification on when nothing is confirmed and explains why', async () => {
      renderSection({
        email_and_phone_requirements: 'neither',
        require_verification: true,
      });

      const verificationRow = screen.getByText('Identity verification')
        .parentElement!;
      const tooltip = within(verificationRow).getByTestId(
        'tooltip-icon-button'
      );
      await userEvent.hover(tooltip);

      expect(
        await screen.findByText(
          /If nothing is required for email or phone, this method must stay enabled/i
        )
      ).toBeInTheDocument();
    });
  });

  describe('the contact requirement modal', () => {
    it('emits the picked requirement', async () => {
      const onChange = renderSection();
      await openContactModal();

      await userEvent.click(
        screen.getByTestId('contact-option-either_email_or_phone')
      );

      expect(onChange).toHaveBeenCalledWith({
        email_and_phone_requirements: 'either_email_or_phone',
      });
    });

    it('disables the email options when password login is off', async () => {
      mockPasswordLoginEnabled = false;
      renderSection({
        email_and_phone_requirements: 'neither',
        require_verification: true,
      });
      await openContactModal();

      expect(screen.getByTestId('contact-option-email_only')).toBeDisabled();
      expect(
        screen.getByTestId('contact-option-both_email_and_phone')
      ).toBeDisabled();
      expect(
        screen.getByTestId('contact-option-either_email_or_phone')
      ).toBeDisabled();
    });

    it('disables the phone options when SMS is off', async () => {
      mockSmsEnabled = false;
      renderSection();
      await openContactModal();

      expect(
        screen.getByTestId('contact-option-both_email_and_phone')
      ).toBeDisabled();
      expect(
        screen.getByTestId('contact-option-either_email_or_phone')
      ).toBeDisabled();
      expect(screen.getByTestId('contact-option-email_only')).toBeEnabled();
    });

    // Mirrors the backend's authentication_method_required validation: the
    // account must be backed by something.
    it('does not offer "nothing confirmed" when verification is not required', async () => {
      renderSection({ require_verification: false });
      await openContactModal();

      expect(screen.getByTestId('contact-option-neither')).toBeDisabled();
    });

    it('offers "nothing confirmed" when verification is required', async () => {
      renderSection({ require_verification: true });
      await openContactModal();

      expect(screen.getByTestId('contact-option-neither')).toBeEnabled();
    });

    it('offers a recency control for the channel in play', async () => {
      const onChange = renderSection({
        email_and_phone_requirements: 'email_only',
      });
      await openContactModal();

      await userEvent.click(
        within(screen.getByTestId('contact-option-email_only')).getByText(
          '+ Require recent confirmation'
        )
      );

      expect(onChange).toHaveBeenCalledWith({ confirmed_email_expiry: 30 });
    });

    it('offers a recency control per channel when either one will do', async () => {
      renderSection({
        email_and_phone_requirements: 'either_email_or_phone',
        confirmed_email_expiry: 30,
        confirmed_phone_number_expiry: 7,
      });
      await openContactModal();

      const card = within(
        screen.getByTestId('contact-option-either_email_or_phone')
      );
      expect(card.getByText('Email address')).toBeInTheDocument();
      expect(card.getByText('Phone number')).toBeInTheDocument();
      expect(card.getAllByText('remove')).toHaveLength(2);
    });

    it('shows no recency control when nothing is confirmed', async () => {
      renderSection({
        email_and_phone_requirements: 'neither',
        require_verification: true,
      });
      await openContactModal();

      expect(
        within(screen.getByTestId('contact-option-neither')).queryByText(
          '+ Require recent confirmation'
        )
      ).not.toBeInTheDocument();
    });
  });

  describe('when no account is required (permitted_by: everyone)', () => {
    it('does not show the authentication methods', () => {
      renderSection({ permitted_by: 'everyone' });

      expect(
        screen.queryByText('Email and phone requirements')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Identity verification')
      ).not.toBeInTheDocument();
    });

    it('does not offer the identification-methods trigger', () => {
      renderSection({ permitted_by: 'everyone' });
      expect(
        screen.queryByTestId('id-method-fields-trigger')
      ).not.toBeInTheDocument();
    });
  });
});
