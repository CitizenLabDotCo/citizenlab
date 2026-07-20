import React from 'react';

import { IPhasePermissionData } from 'api/phase_permissions/types';

import { render, screen, within, userEvent } from 'utils/testUtils/rtl';

import AccessSection from '.';

// ---- Controllable data hooks ------------------------------------------------
// The two things this section reacts to: whether password login is on, and
// whether an identity-verification method is configured.
let mockPasswordLoginEnabled = true;
let mockVerificationMethodConfigured = true;

jest.mock('hooks/useFeatureFlag', () =>
  jest.fn(({ name }: { name: string }) =>
    name === 'password_login' ? mockPasswordLoginEnabled : false
  )
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
  'components/admin/ActionForm/AccessSections/VerificationFieldsModal',
  () => () => null
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
  attributes?: Partial<IPhasePermissionData['attributes']>
) =>
  render(
    <AccessSection
      permission={buildPermission(attributes)}
      showAnyone
      onChange={jest.fn()}
    />
  );

beforeEach(() => {
  mockPasswordLoginEnabled = true;
  mockVerificationMethodConfigured = true;
});

describe('<AccessSection />', () => {
  it('renders the "Who can participate" header', () => {
    renderSection();
    expect(screen.getByText('Who can participate')).toBeInTheDocument();
  });

  describe('when an account is required (permitted_by: users)', () => {
    it('shows both authentication method rows with their descriptions when available', () => {
      renderSection();

      expect(screen.getByText('Confirmed email')).toBeInTheDocument();
      expect(screen.getByText('Identity verification')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Participant confirms an email address with a one-time code.'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Participant proves their identity through an external register.'
        )
      ).toBeInTheDocument();
    });

    it('marks the email method unavailable when password login is off', () => {
      mockPasswordLoginEnabled = false;
      renderSection();

      expect(
        screen.getByText(
          'Unavailable: password login is turned off for this platform.'
        )
      ).toBeInTheDocument();
      // The verification method is still available.
      expect(
        screen.getByText(
          'Participant proves their identity through an external register.'
        )
      ).toBeInTheDocument();
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

    it('shows the "pick at least one" hint when no method is enabled', () => {
      renderSection({
        require_confirmed_email: false,
        require_verification: false,
      });

      expect(screen.getByText(/Pick at least one method/i)).toBeInTheDocument();
    });

    it('locks the last remaining enabled method and explains why in a tooltip', async () => {
      // Only confirmed email enabled -> it is the last one, so it is locked.
      renderSection({
        require_confirmed_email: true,
        require_verification: false,
      });

      const emailRow = screen.getByText('Confirmed email').parentElement!;
      const tooltip = within(emailRow).getByTestId('tooltip-icon-button');
      await userEvent.hover(tooltip);

      expect(
        await screen.findByText(
          /At least one authentication method must stay enabled/i
        )
      ).toBeInTheDocument();
    });
  });

  describe('when no account is required (permitted_by: everyone)', () => {
    it('does not show the authentication method rows', () => {
      renderSection({ permitted_by: 'everyone' });

      expect(screen.queryByText('Confirmed email')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Identity verification')
      ).not.toBeInTheDocument();
    });
  });
});
